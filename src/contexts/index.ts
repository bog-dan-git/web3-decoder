import { createContext, type Dispatch } from 'react';
import { AbiReceivedAction, ChainIdReceivedAction } from './actions';
import { InterfaceAbi } from 'ethers';

interface ContractData {
  abi: InterfaceAbi;
  name: string;
}

export interface OnChainDataState {
  rpcChainIds: Record<string, number>;
  contractData: Record<number, Record<string, ContractData>>;
}

export type OnChainDataContextAction =
  | ChainIdReceivedAction
  | AbiReceivedAction;

export const OnChainDataContext = createContext<OnChainDataState>(
  {} as OnChainDataState,
);

export const OnChainDataDispatchContext = createContext(
  {} as Dispatch<OnChainDataContextAction>,
);
