import {
  EthCallRequest,
  EthGetBalanceRequest,
  JsonRpcRequest,
  JsonRpcResponse,
} from '../interfaces';
import { OnChainDataState } from '../contexts';
import { Interface, Result } from 'ethers';
import { client, ContractData } from '../client';
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
  name: string;
  functionName: string;
  functionArgs: string;
  functionCall: string;
  functionResult: string;
  contractAddress: string;
}

type Args = Array<string | Args>;

export const getCallInfo = (
  contractData: ContractData,
  request: EthCallRequest,
  response: JsonRpcResponse,
) => {
  if (!contractData) {
    return {
      name: 'Not found',
      functionName: 'Not found',
      functionArgs: 'Not found',
      contractAddress: 'Not found',
      functionCall: 'Not found',
      functionResult: 'Not found',
    };
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

  return {
    name,
    functionName: parsedTransaction?.name,
    functionArgs: JSON.stringify(parsedArgs),
    functionCall: `${parsedTransaction?.name}(${displayParams})`,
    contractAddress: request.params[0].to,
    functionResult: JSON.stringify(decodedFunctionResult),
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
  const callInfo = getCallInfo(contractData, request, response);

  return {
    swissknifeUrl: buildSwissKnifeUrl(
      request.params[0].data,
      request.params[0].to,
      chainId,
    ),
    name: callInfo.name,
    functionName: callInfo.functionName,
    functionArgs: callInfo.functionArgs,
    functionCall: callInfo.functionCall!,
    functionResult: callInfo.functionResult!,
    contractAddress: callInfo.contractAddress!,
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
