import React from 'react';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}-list`} className="space-y-2.5 my-3 pl-2 sm:pl-3">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-2 shrink-0" />
              <div className="flex-1">{renderFormattedText(item)}</div>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const renderFormattedText = (text: string): React.ReactNode => {
    // 1. Split by URLs first
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const urlParts = text.split(urlRegex);

    return urlParts.map((urlPart, uIndex) => {
      if (urlPart.match(/^https?:\/\//)) {
        return (
          <a
            key={`url-${uIndex}`}
            href={urlPart}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700 dark:hover:text-indigo-300 break-all inline-flex items-center gap-0.5 mx-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <span>{urlPart}</span>
            <span className="text-xs">↗</span>
          </a>
        );
      }

      // 2. Handle **bold** inside non-URL parts
      const boldParts = urlPart.split(/(\*\*.*?\*\*)/g);
      return boldParts.map((bPart, bIndex) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return (
            <strong key={`b-${uIndex}-${bIndex}`} className="font-semibold text-slate-900 dark:text-slate-100">
              {bPart.slice(2, -2)}
            </strong>
          );
        }

        // 3. Handle `code`
        const codeParts = bPart.split(/(`.*?`)/g);
        return codeParts.map((cPart, cIndex) => {
          if (cPart.startsWith('`') && cPart.endsWith('`')) {
            return (
              <code
                key={`c-${uIndex}-${bIndex}-${cIndex}`}
                className="px-1.5 py-0.5 text-xs font-mono rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300"
              >
                {cPart.slice(1, -1)}
              </code>
            );
          }
          return cPart;
        });
      });
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(`empty-${index}`);
      return;
    }

    // Heading 3: ###
    if (trimmed.startsWith('### ')) {
      flushList(`h3-${index}`);
      const headingText = trimmed.replace(/^###\s+/, '');
      elements.push(
        <h3
          key={`h3-${index}`}
          className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2.5 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 first:border-0 first:pt-0 first:mt-0"
        >
          {headingText}
        </h3>
      );
      return;
    }

    // Heading 2: ##
    if (trimmed.startsWith('## ')) {
      flushList(`h2-${index}`);
      const headingText = trimmed.replace(/^##\s+/, '');
      elements.push(
        <h2
          key={`h2-${index}`}
          className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-7 mb-3 flex items-center gap-2"
        >
          {headingText}
        </h2>
      );
      return;
    }

    // Bullet item: - or *
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.replace(/^[-*]\s+/, '');
      currentList.push(itemText);
      return;
    }

    // Regular paragraph
    flushList(`p-${index}`);
    elements.push(
      <p key={`p-${index}`} className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed my-2">
        {renderFormattedText(trimmed)}
      </p>
    );
  });

  flushList('final');

  return <div className="space-y-1">{elements}</div>;
};
