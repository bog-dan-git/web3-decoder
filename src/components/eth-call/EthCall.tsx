import ExpandableSection from '../ExpandableSection';
import { FC } from 'react';

interface Props {
  swissknifeUrl: string;
  contractAddress?: string;
  name?: string;
  functionCall?: string;
  functionName?: string;
  functionArgs?: string;
}

const EthCall: FC<Props> = (props) => {
  return (
    <div>
      <div>
        URL:
        <a className="request-details__link" href={props.swissknifeUrl}>
          swissknife
        </a>
      </div>
      <div>
        Contract address: {props.contractAddress} (<a className={'link'}></a>
      </div>
      <div>Contract Name: {props.name}</div>
      <div className="expandable-wrapper">
        <div>Function call:</div>
        <ExpandableSection content={props.functionCall!}></ExpandableSection>
      </div>
      <div>Function Name: {props.functionName}</div>
      <div className="expandable-wrapper">
        <div>Function Args:</div>
        {props.functionArgs && (
          <ExpandableSection content={props.functionArgs}></ExpandableSection>
        )}
      </div>
    </div>
  );
};

export default EthCall;
