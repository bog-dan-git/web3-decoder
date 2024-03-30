import { FC, useState } from 'react';

interface Props {
  content: string;
}

const ExpandableSection: FC<Props> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 100;
  const isExpandable = content.length > maxLength;

  return (
    <div>
      {isExpandable ? (
        <div>
          {isExpanded ? content : `${content.slice(0, maxLength)}...`}
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      ) : (
        <div>{content}</div>
      )}
    </div>
  );
};

export default ExpandableSection;
