import React, { useCallback, useEffect } from 'react';
import NetworkItem from './components/network-item/NetworkItem';
import './App.css';
import OnChainDataProvider from './components/OnChainDataProvider';
import { JsonRpcRequest, JsonRpcResponse } from './interfaces';

const isSupportedRequest = (request: unknown) =>
  Array.isArray(request) &&
  request.every((x) => x.jsonrpc === '2.0' && x.method.startsWith('eth_'));

function App() {
  const insertRequest = (
    url: string,
    request: JsonRpcRequest[],
    response: JsonRpcResponse[],
  ) => {
    setRequests((requests) => {
      return [...requests, { url, request, response }];
    });
  };
  const [requests, setRequests] = React.useState(
    [] as {
      url: string;
      request: JsonRpcRequest[];
      response: JsonRpcResponse[];
    }[],
  );

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
  });
  return (
    <OnChainDataProvider>
      <div className="app">
        <h1>Requests</h1>
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
      </div>
    </OnChainDataProvider>
  );
}

export default App;
