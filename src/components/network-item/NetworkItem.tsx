import { FC, useContext, useEffect, useState } from 'react';

import { JsonRpcRequest, JsonRpcResponse } from '../../interfaces';
import { OnChainDataContext, OnChainDataDispatchContext } from '../../contexts';
import { getChainId, getMissingContractAbis } from '../../services';

import NetworkItemDetails from '../network-item-details/NetworkItemDetails';

import './NetworkItem.css';

interface Props {
  url: string;
  request: JsonRpcRequest[];
  response: JsonRpcResponse[];
}

const NetworkItem: FC<Props> = ({ url, request, response }) => {
  const state = useContext(OnChainDataContext);
  const dispatch = useContext(OnChainDataDispatchContext);

  const setContractData = async (chainId: number) => {
    const missingContractData = await getMissingContractAbis(
      state,
      chainId,
      request,
    );

    for (const contractData of missingContractData) {
      dispatch({
        type: 'ABI_RECEIVED',
        payload: {
          chainId,
          address: contractData.address,
          abi: contractData.abi,
          name: contractData.name,
          abiFound: !contractData.error && contractData.code !== 400,
        },
      });
    }
  };

  const updateChainId = async () => {
    const chainId = state.rpcChainIds[url];

    if (chainId) {
      return chainId;
    }

    const receivedChainId = await getChainId(url, request, response);

    dispatch({
      type: 'CHAIN_ID_RECEIVED',
      payload: { rpcUrl: url, chainId: receivedChainId },
    });

    return receivedChainId;
  };

  useEffect(() => {
    updateChainId().then((chainId) => setContractData(chainId));
  }, []);

  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div
        className={expanded ? 'request expanded' : 'request'}
        onClick={() => setExpanded((_) => !_)}
      >
        <div className="request__methods">
          {request.map((x) => (
            <div key={x.id}>{x.method}</div>
          ))}
        </div>
        <div>{new URL(url).origin}</div>
      </div>
      {expanded && (
        <NetworkItemDetails url={url} request={request} response={response} />
      )}
    </div>
  );
};

export default NetworkItem;
