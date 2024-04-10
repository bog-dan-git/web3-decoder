import { FC, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Props {
  children: string | string[];
}

const SolidityCode: FC<Props> = ({ children }) => {
  const style = useMemo(
    () => ({
      ...coldarkDark,
      'pre[class*="language-"]': {
        ...coldarkDark['pre[class*="language-"]'],
        background: 'transparent',
        margin: 0,
        padding: 0,
      },
    }),
    [],
  );

  return (
    <SyntaxHighlighter wrapLongLines={true} language="solidity" style={style}>
      {children}
    </SyntaxHighlighter>
  );
};

export default SolidityCode;
