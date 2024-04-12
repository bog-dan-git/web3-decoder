import ReactJson from '@microlink/react-json-view';
import { FC } from 'react';

interface Props {
  object: object;
}

const JsonViewer: FC<Props> = ({ object }: Props) => {
  return (
    <ReactJson
      name={null}
      src={object}
      collapsed={true}
      theme={'monokai'}
      style={{ backgroundColor: 'transparent' }}
    />
  );
};

export default JsonViewer;
