import { EthGetBalanceRequest, JsonRpcResponse } from '../../interfaces';

interface Props {
  request: EthGetBalanceRequest;
  response: JsonRpcResponse;
}

const EthGetBalance = (props: Props) => {
  const [address, block] = props.request.params;
  const balance = Number(props.response.result);

  return (
    <div>
      <div>Address: {address}</div>
      <div>Block: {block}</div>
      <div>Balance: {balance}</div>
    </div>
  );
};

export default EthGetBalance;
