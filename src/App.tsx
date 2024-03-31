import { useCallback, useEffect, useState } from 'react';
import NetworkItem from './components/network-item/NetworkItem';
import './App.css';
import OnChainDataProvider from './components/OnChainDataProvider';
import { JsonRpcRequest, JsonRpcResponse } from './interfaces';

const isSupportedRequest = (request: JsonRpcRequest | JsonRpcRequest[]) =>
  Array.isArray(request)
    ? request.every((x) => x.jsonrpc === '2.0' && x.method.startsWith('eth_'))
    : request.jsonrpc === '2.0' && request.method.startsWith('eth_');

interface RequestItem {
  url: string;
  request: JsonRpcRequest[];
  response: JsonRpcResponse[];
}

function App() {
  const [requests, setRequests] = useState<RequestItem[]>([]);

  const insertRequest = (
    url: string,
    request: JsonRpcRequest[],
    response: JsonRpcResponse[],
  ) => {
    setRequests((requests) => {
      return [
        ...requests,
        {
          url,
          request: Array.isArray(request) ? request : [request],
          response: Array.isArray(response) ? response : [response],
        },
      ];
    });
  };

  const handleRequestCallback = useCallback(
    (request: chrome.devtools.network.Request) => {
      if (
        request.request &&
        request.request.method === 'POST' &&
        request.request.postData &&
        request.request.postData.mimeType === 'application/json'
      ) {
        const requestBody = JSON.parse(request.request.postData.text!);
        if (!isSupportedRequest(requestBody)) {
          return;
        }

        request.getContent((body: string) => {
          const responseBody = JSON.parse(body);
          insertRequest(request.request.url, requestBody, responseBody);
        });
      }
    },
    [],
  );

  useEffect(() => {
    chrome.devtools.network.onRequestFinished.addListener(
      handleRequestCallback,
    );

    return () => {
      chrome.devtools.network.onRequestFinished.removeListener(
        handleRequestCallback,
      );
    };
  }, [handleRequestCallback]);

  return (
    <OnChainDataProvider>
      <div className="app">
        {requests.length ? (
          <div className="requests">
            {requests.map((request, index) => (
              <NetworkItem
                key={index}
                request={request.request}
                response={request.response}
                url={request.url}
              />
            ))}
          </div>
        ) : (
          <div className="center">
            <div>Recording web3 activity...</div>
            <div>
              Perform a request or hit <b>Ctrl + R</b> to record the reload
            </div>
          </div>
        )}
      </div>
    </OnChainDataProvider>
  );
}

export default App;
