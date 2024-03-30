import {
  EthCallRequest,
  EthGetBalanceRequest,
  JsonRpcRequest,
} from '../interfaces';

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
