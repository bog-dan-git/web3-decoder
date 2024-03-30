import ExpandableSection from '../ExpandableSection';
import { FC, useEffect, useState } from 'react';

import './EthCall.css';
import { EthCallRequest, JsonRpcResponse } from '../../interfaces';
import { EthCallInfo, getEthCallInfo } from '../../services';
import { ContractData } from '../../client';

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
    <div>
      <div>
        URL:
        <a
          className="request-details__link"
          target="_blank"
          href={callInfo.swissknifeUrl}
          rel="noreferrer"
        >
          Swiss knife
        </a>
      </div>
      <div>Contract address: {callInfo.contractAddress}</div>
      <div>Contract Name: {callInfo.name}</div>
      <div className="expandable-wrapper">
        <div>Function call:</div>
        {callInfo.functionCall && (
          <ExpandableSection
            content={callInfo.functionCall}
          ></ExpandableSection>
        )}
      </div>
      <div>Function Name: {callInfo.functionName}</div>
      <div className="expandable-wrapper">
        <div>Function Args:</div>
        {callInfo.functionArgs && (
          <ExpandableSection
            content={callInfo.functionArgs}
          ></ExpandableSection>
        )}
      </div>
      <div className="expandable-wrapper">
        <div>Function Result:</div>
        {callInfo.functionResult && (
          <ExpandableSection
            content={callInfo.functionResult}
          ></ExpandableSection>
        )}
      </div>
    </div>
  );
};

export default EthCall;
