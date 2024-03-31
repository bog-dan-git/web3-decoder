import { useContext } from 'react';

import { JsonRpcRequest, JsonRpcResponse } from '../../interfaces';
import { isEthBlockNumber, isEthCall, isEthGetBalance } from '../../services';
import { OnChainDataContext } from '../../contexts';

import EthCall from '../eth-call/EthCall';
import EthGetBalance from '../eth-get-balance/EthGetBalance';
import EthBlockNumber from '../eth-blockNumber/EthBlockNumber';

import './NetworkItemDetails.css';

interface Props {
  url: string;
  request: JsonRpcRequest[];
  response: JsonRpcResponse[];
}

const NetworkItemDetails = ({ url, request, response }: Props) => {
  const state = useContext(OnChainDataContext);
  const chainId = state.rpcChainIds[url];

  const getRequestDetailsContent = (request: JsonRpcRequest, index: number) => {
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
    } else if (request.method === 'eth_chainId') {
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

  const requestDetails = request.map(getRequestDetailsContent);

  return (
    <div className="request-details">
      <b>Chain ID:</b> {chainId ?? 'Unknown'}
      {requestDetails.map((x, i) => (
        <div key={i} className="request-details__item">
          <div>
            <div className="request-details__item__title">
              <b>
                [{i}] {x.title}
              </b>
            </div>
          </div>
          <div className="request-details__item__content">{x.content}</div>
        </div>
      ))}
    </div>
  );
};

export default NetworkItemDetails;
