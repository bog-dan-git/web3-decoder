import { JsonRpcResponse } from '../../interfaces';

interface Props {
  response: JsonRpcResponse;
}

const EthBlockNumber = (props: Props) => {
  const blockNumberHex = props.response.result;
  const blockNumber = Number(blockNumberHex);
  return (
    <div>
      Block number: {blockNumberHex} ({blockNumber})
    </div>
  );
};

export default EthBlockNumber;
