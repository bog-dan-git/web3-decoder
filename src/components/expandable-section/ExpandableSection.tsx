import { FC, useState } from 'react';

import './ExpandableSection.css';

interface Props {
  content: string;
}

const ExpandableSection: FC<Props> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 100;
  const isExpandable = content.length > maxLength;

  return (
    <span>
      {isExpandable ? (
        <span>
          {isExpanded ? content : `${content.slice(0, maxLength)}...`}
          <button
            className="expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        </span>
      ) : (
        <span>{content}</span>
      )}
    </span>
  );
};

export default ExpandableSection;
