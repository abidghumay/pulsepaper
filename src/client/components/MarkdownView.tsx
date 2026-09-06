import React from 'react';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  // Parse markdown lines into structured elements
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
              <div>{renderFormattedText(item)}</div>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const renderFormattedText = (text: string): React.ReactNode => {
    // Replace **bold** with <strong>
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-slate-900 dark:text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
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
