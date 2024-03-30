import { JsonRpcRequest, JsonRpcResponse } from '../../interfaces';
import { FC, useContext, useEffect, useState } from 'react';
import './NetworkItem.css';
import { OnChainDataContext, OnChainDataDispatchContext } from '../../contexts';

import {
  getChainId,
  getMissingContractAbis,
  isEthBlockNumber,
  isEthCall,
  isEthGetBalance,
} from '../../services';
import EthCall from '../eth-call/EthCall';
import EthGetBalance from '../eth-get-balance/EthGetBalance';
import EthBlockNumber from '../eth-blockNumber/EthBlockNumber';

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
  const chainId = state.rpcChainIds[url];

  const getRequestDetails = (request: JsonRpcRequest, index: number) => {
    if (isEthCall(request)) {
      const contractData = state.contractData[chainId]?.[request.params[0].to];

      return {
        title: 'eth_call',
        content: (
          <EthCall
            request={request}
            response={response[index]}
            chainId={chainId}
            contractData={contractData}
          />
        ),
      };
    } else if (isEthGetBalance(request)) {
      return {
        title: 'eth_getBalance',
        content: <EthGetBalance request={request} response={response[index]} />,
      };
    } else if (isEthBlockNumber(request)) {
      return {
        title: 'eth_blockNumber',
        content: <EthBlockNumber response={response[index]} />,
      };
    }
    if (request.method === 'eth_chainId') {
      return {
        title: 'eth_chainId',
        content: chainId,
      };
    }

    return {
      title: request.method,
      content: JSON.stringify(request.params),
    };
  };

  const requestDetails = request.map(getRequestDetails);

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
        <div className="request-details">
          <b>Chain ID:</b> {chainId ?? 'Unknown'}
          {requestDetails.map((x, i) => (
            <div key={i} className="request-details__item">
              <div>
                <div>
                  <b>
                    [{i}] {x.title}
                  </b>
                </div>
              </div>
              <div className="eth-call-details">{x.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkItem;
