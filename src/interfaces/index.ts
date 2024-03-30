export interface JsonRpcRequest {
  readonly id: number;
  readonly jsonrpc: string;
  readonly method: string;
  readonly params: readonly unknown[];
}

type EthCallRequestParams = [
  { readonly to: string; readonly data: string },
  string,
];

export interface EthCallRequest extends JsonRpcRequest {
  readonly params: EthCallRequestParams;
}
export interface EthGetBalanceRequest extends JsonRpcRequest {
  readonly params: readonly [string, string];
}

export interface JsonRpcResponse {
  readonly id: number;
  readonly jsonrpc: string;
  readonly result: string;
  readonly error?: { readonly code: number; readonly message: string };
}
