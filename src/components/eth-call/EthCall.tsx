import { FC, useEffect, useState } from 'react';

import SolidityCode from '../solidity-code/SolidityCode';
import JsonViewer from '../json-viewer/JsonViewer';

import { EthCallRequest, JsonRpcResponse } from '../../interfaces';
import { EthCallInfo, getEthCallInfo } from '../../services';
import { ContractData } from '../../contexts';

import './EthCall.css';

interface Props {
  contractData: ContractData;
  request: EthCallRequest;
  response: JsonRpcResponse;
  chainId: number;
}

const EthCall: FC<Props> = (props) => {
  const [callInfo, setCallInfo] = useState<EthCallInfo | null>(null);

  useEffect(() => {
    setTimeout(() => {
      const callInfo = getEthCallInfo(
        props.contractData,
        props.request,
        props.response,
        props.chainId,
      );

      setCallInfo(callInfo);
    }, 0);
  }, [props.contractData, props.request, props.response, props.chainId]);

  return !callInfo ? (
    <div>Loading...</div>
  ) : (
    <div className="grid-container">
      <div>URL: </div>
      <div>
        <a
          className="request-details__link"
          target="_blank"
          href={callInfo.swissknifeUrl}
          rel="noreferrer"
        >
          Swissknife
        </a>
      </div>
      <div>Contract address: </div>
      <div>{callInfo.contractAddress}</div>
      {callInfo.abiFound && callInfo.decoded && (
        <>
          <div>Contract Name: </div>
          <SolidityCode>{`contract ${callInfo.name}`}</SolidityCode>
          <div>Function Signature: </div>
          <SolidityCode>{callInfo.functionSignature!}</SolidityCode>
          <div>Function Call: </div>
          {callInfo.functionCall && (
            <SolidityCode>{callInfo.functionCall}</SolidityCode>
          )}
          <div>Function args: </div>
          <JsonViewer object={callInfo.functionArgs!} />
          <div>Function result: </div>
          {callInfo.functionResultOk ? (
            <JsonViewer object={callInfo.functionResult as object} />
          ) : (
            <div className="error">{callInfo.functionResult!.toString()}</div>
          )}
        </>
      )}
      {!callInfo.abiFound && <div className="error">ABI not found</div>}
      {callInfo.abiFound && !callInfo.decoded && (
        <div className="error">Unable to decode function call</div>
      )}
    </div>
  );
};

export default EthCall;
