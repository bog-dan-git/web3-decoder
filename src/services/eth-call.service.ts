import { ethers, Interface, Result, TransactionDescription } from 'ethers';
import { EthCallRequest, JsonRpcRequest, JsonRpcResponse } from '../interfaces';
import { ContractData, OnChainDataState } from '../contexts';
import { client } from '../client';
import { isFulfilled } from '../common';
import { isEthCall } from './network-item.service';

export interface EthCallInfo {
  swissknifeUrl: string;
  abiFound: boolean;
  decoded: boolean;
  contractAddress: string;
  name?: string;
  functionSignature?: string;
  functionArgs?: string;
  functionCall?: string;
  functionResult?: string;
  functionResultOk?: boolean;
}

type Args = Array<string | Args>;

const parseFunctionArgsToArray = (args: Result): Args =>
  args.map((x: Result | string) =>
    Array.isArray(x) ? parseFunctionArgsToArray(x as Result) : x.toString(),
  );

const argsToDisplayParams = (args: Args): string =>
  args
    .map((x) =>
      Array.isArray(x) ? `[${argsToDisplayParams(x)}]` : x.toString(),
    )
    .join(', ');

const getFunctionSignature = (
  transactionDescription: TransactionDescription,
) => {
  const { name, fragment } = transactionDescription;
  const { inputs, outputs, stateMutability } = fragment;
  const inputsFormatted = inputs.map((x) => x.format('full')).join(', ');
  const outputsFormatted = outputs.map((x) => x.format('full')).join(', ');

  return `${name}(${inputsFormatted}) external ${stateMutability} returns (${outputsFormatted})`;
};

const decodeFunctionResult = (
  contract: Interface,
  response: JsonRpcResponse,
  transactionDescription: TransactionDescription,
) => {
  try {
    const decoded = contract.decodeFunctionResult(
      transactionDescription.fragment,
      response.result,
    );

    const stringified = JSON.stringify(
      parseFunctionArgsToArray(decoded)[0],
      null,
      2,
    );

    return { ok: true, data: stringified };
  } catch (e) {
    return { ok: false, data: response.error?.message ?? 'Unknown error' };
  }
};

export const getCallInfo = (
  contractData: ContractData,
  request: EthCallRequest,
  response: JsonRpcResponse,
) => {
  if (!contractData || !contractData.abiFound) {
    return { decoded: false, abiFound: false };
  }

  const { abi, name } = contractData;

  const contract = new Interface(abi);

  const parsedTransaction = contract.parseTransaction({
    data: request.params[0].data,
  });

  if (!parsedTransaction) {
    return {
      abiFound: true,
      decoded: false,
    };
  }

  const parsedArgs = parseFunctionArgsToArray(parsedTransaction.args);
  const displayParams = argsToDisplayParams(parsedArgs);
  const decodedFunctionResult = decodeFunctionResult(
    contract,
    response,
    parsedTransaction,
  );
  const functionSignature = getFunctionSignature(parsedTransaction);

  return {
    name,
    functionSignature,
    functionArgs: JSON.stringify(parsedArgs, null, 2),
    functionCall: `${parsedTransaction?.name}(${displayParams})`,
    functionResult: decodedFunctionResult,
    decoded: true,
    abiFound: true,
  };
};

export const buildSwissKnifeUrl = (
  calldata: string,
  contractAddress: string,
  chainId?: number,
) => {
  const url = `https://calldata.swiss-knife.xyz/decoder?calldata=${calldata}&address=${contractAddress}${chainId ? `&chainId=${chainId}` : ''}`;
  return url;
};

export const getEthCallInfo = (
  contractData: ContractData,
  request: EthCallRequest,
  response: JsonRpcResponse,
  chainId: number,
): EthCallInfo => {
  const { data, to } = request.params[0];

  const swissknifeUrl = buildSwissKnifeUrl(data, to, chainId);

  const callInfo = getCallInfo(contractData, request, response);

  return {
    swissknifeUrl,
    abiFound: callInfo.abiFound,
    name: callInfo?.name,
    functionSignature: callInfo?.functionSignature,
    functionArgs: callInfo?.functionArgs,
    functionCall: callInfo?.functionCall,
    functionResult: callInfo?.functionResult?.data,
    functionResultOk: callInfo?.functionResult?.ok,
    contractAddress: to,
    decoded: callInfo.decoded,
  };
};

export const getMissingContractAbis = async (
  state: OnChainDataState,
  chainId: number,
  request: JsonRpcRequest[],
) => {
  const ethCalls = request.filter(isEthCall);
  const distinctAddresses = Array.from(
    new Set(ethCalls.map((x) => x.params[0].to as string)),
  );

  const contractsWithoutAbis = distinctAddresses.filter(
    (x) => !state.contractData[chainId]?.[x],
  );

  const abiResponses = await Promise.allSettled(
    contractsWithoutAbis.map((address) =>
      client
        .getContractAbi(chainId, address)
        .then((data) => ({ address, ...data })),
    ),
  );

  return abiResponses.filter(isFulfilled).map((x) => x.value);
};

export const getChainId = async (
  url: string,
  request: JsonRpcRequest[],
  response: JsonRpcResponse[],
) => {
  const requestIndex = request.findIndex((x) => x.method === 'eth_chainId');
  if (!~requestIndex) {
    const provider = new ethers.JsonRpcProvider(url);
    const chainId = Number(await provider.getNetwork().then((x) => x.chainId));
    return chainId;
  } else {
    const chainIdResponse = response[requestIndex].result;
    return Number(chainIdResponse);
  }
};
