import {
  EthCallRequest,
  EthGetBalanceRequest,
  JsonRpcRequest,
  JsonRpcResponse,
} from '../interfaces';
import { ContractData, OnChainDataState } from '../contexts';
import { Interface, Result, TransactionDescription } from 'ethers';
import { client } from '../client';
import { isFulfilled } from '../common';
import { Web3 } from 'web3';

export const isEthCall = (
  request: JsonRpcRequest,
): request is EthCallRequest => {
  return request.method === 'eth_call';
};

export const isEthGetBalance = (
  request: JsonRpcRequest,
): request is EthGetBalanceRequest => {
  return request.method === 'eth_getBalance';
};

export const isEthBlockNumber = (request: JsonRpcRequest) => {
  return request.method === 'eth_blockNumber';
};

export interface EthCallInfo {
  swissknifeUrl: string;
  abiFound: boolean;
  name?: string;
  functionSignature?: string;
  functionArgs?: string;
  functionCall?: string;
  functionResult?: string;
  contractAddress?: string;
}

type Args = Array<string | Args>;

export const getCallInfo = (
  contractData: ContractData,
  request: EthCallRequest,
  response: JsonRpcResponse,
) => {
  if (!contractData || !contractData.abiFound) {
    return;
  }

  const { abi, name } = contractData;

  const contract = new Interface(abi);

  const parsedTransaction = contract.parseTransaction({
    data: request.params[0].data,
  });

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
  ) =>
    `${transactionDescription.name}(${transactionDescription.fragment.inputs
      .map((x) => x.format('full'))
      .join(
        ', ',
      )}) external returns (${transactionDescription.fragment.outputs.map((x) => x.format('full')).join(', ')})`;

  if (!parsedTransaction) {
    return {
      name: 'Not found',
      functionName: 'Not found',
      functionArgs: 'Not found',
    };
  }

  const parsedArgs = parseFunctionArgsToArray(parsedTransaction.args);
  const displayParams = argsToDisplayParams(parsedArgs);
  const decodedFunctionResult = parseFunctionArgsToArray(
    contract.decodeFunctionResult(parsedTransaction.name, response.result),
  );
  const functionSignature = getFunctionSignature(parsedTransaction);

  return {
    name,
    functionSignature,
    functionArgs: JSON.stringify(parsedArgs, null, 2),
    functionCall: `${parsedTransaction?.name}(${displayParams})`,
    contractAddress: request.params[0].to,
    functionResult: JSON.stringify(decodedFunctionResult, null, 2),
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
  const swissknifeUrl = buildSwissKnifeUrl(
    request.params[0].data,
    request.params[0].to,
    chainId,
  );

  const callInfo = getCallInfo(contractData, request, response);

  return {
    swissknifeUrl,
    abiFound: contractData.abiFound,
    name: callInfo?.name,
    functionSignature: callInfo?.functionSignature,
    functionArgs: callInfo?.functionArgs,
    functionCall: callInfo?.functionCall,
    functionResult: callInfo?.functionResult,
    contractAddress: callInfo?.contractAddress,
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
    const web3 = new Web3(url);
    const chainId = Number(await web3.eth.getChainId());

    return chainId;
  } else {
    const chainIdResponse = response[requestIndex].result;
    return Number(chainIdResponse);
  }
};
