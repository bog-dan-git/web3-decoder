import type { OnChainDataState } from '../index';
import { InterfaceAbi } from 'ethers';

export interface ChainIdReceivedAction {
  type: 'CHAIN_ID_RECEIVED';
  payload: {
    rpcUrl: string;
    chainId: number;
  };
}

export interface AbiReceivedAction {
  type: 'ABI_RECEIVED';
  payload: {
    chainId: number;
    address: string;
    abi: InterfaceAbi;
    name: string;
    abiFound: boolean;
  };
}

export const handleChainIdReceived = (
  state: OnChainDataState,
  action: ChainIdReceivedAction,
): OnChainDataState => {
  const { rpcUrl, chainId } = action.payload;
  return {
    ...state,
    rpcChainIds: {
      ...state.rpcChainIds,
      [rpcUrl]: chainId,
    },
  };
};

export const handleAbiReceived = (
  state: OnChainDataState,
  action: AbiReceivedAction,
): OnChainDataState => {
  const { chainId, address, abi, name, abiFound } = action.payload;
  return {
    ...state,
    contractData: {
      ...state.contractData,
      [chainId]: {
        ...state.contractData[chainId],
        [address]: { abi, name, abiFound },
      },
    },
  };
};
