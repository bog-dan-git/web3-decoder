import { type FC, type ReactNode, useReducer } from 'react';
import {
  OnChainDataContext,
  OnChainDataContextAction,
  OnChainDataDispatchContext,
  OnChainDataState,
} from '../contexts';
import { handleAbiReceived, handleChainIdReceived } from '../contexts/actions';

const initialOnChainData: OnChainDataState = {
  rpcChainIds: {},
  contractData: {},
};

const onChainDataReducer = (
  state: OnChainDataState,
  action: OnChainDataContextAction,
): OnChainDataState => {
  switch (action.type) {
    case 'CHAIN_ID_RECEIVED':
      return handleChainIdReceived(state, action);
    case 'ABI_RECEIVED':
      return handleAbiReceived(state, action);
    default:
      return state;
  }
};

interface Props {
  children?: ReactNode;
}

const OnChainDataProvider: FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(onChainDataReducer, initialOnChainData);
  return (
    <OnChainDataContext.Provider value={state}>
      <OnChainDataDispatchContext.Provider value={dispatch}>
        {children}
      </OnChainDataDispatchContext.Provider>
    </OnChainDataContext.Provider>
  );
};

export default OnChainDataProvider;
