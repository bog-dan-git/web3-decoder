export interface JsonRpcRequest {
  id: number;
  jsonrpc: string;
  method: string;
  params: unknown[];
}

type EthCallRequestParams = [{ to: string; data: string }, string];

export interface EthCallRequest extends JsonRpcRequest {
  params: EthCallRequestParams;
}

export interface JsonRpcResponse {
  id: number;
  jsonrpc: string;
  result: string;
}
