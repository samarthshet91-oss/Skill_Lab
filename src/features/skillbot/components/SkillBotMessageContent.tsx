import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface SkillBotMessageContentProps {
  content: string;
  isUser?: boolean;
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = language?.trim() || 'code';

  return (
    <div className="my-3 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800/80 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="uppercase text-[10px] font-bold tracking-wider">{displayLang}</span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px]"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto">
        <pre className="font-mono text-xs text-slate-100 leading-relaxed whitespace-pre font-normal">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function renderInlineText(text: string, isUser = false): React.ReactNode[] {
  // Regex to match code `code` or bold **bold**
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const codeContent = part.slice(1, -1);
      return (
        <code
          key={index}
          className={`px-1.5 py-0.5 rounded text-xs font-mono font-medium ${
            isUser
              ? 'bg-indigo-700/80 text-white border border-indigo-500/40'
              : 'bg-slate-100 text-indigo-700 border border-slate-200/80'
          }`}
        >
          {codeContent}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldContent = part.slice(2, -2);
      return (
        <strong key={index} className={isUser ? 'font-bold text-white' : 'font-bold text-slate-900'}>
          {boldContent}
        </strong>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export function SkillBotMessageContent({ content, isUser = false }: SkillBotMessageContentProps) {
  if (isUser) {
    return <div className="text-sm leading-relaxed whitespace-pre-wrap">{content}</div>;
  }

  // Split into code blocks vs non-code blocks
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const processTextChunk = (chunk: string, keyPrefix: string) => {
    const lines = chunk.split('\n');
    const nodes: React.ReactNode[] = [];
    let listBuffer: { type: 'bullet' | 'number'; items: string[]; startNum?: number } | null = null;

    const flushList = (listKey: string) => {
      if (!listBuffer) return;
      if (listBuffer.type === 'bullet') {
        nodes.push(
          <ul key={listKey} className="my-2 space-y-1.5 pl-1">
            {listBuffer.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span className="flex-1">{renderInlineText(item)}</span>
              </li>
            ))}
          </ul>
        );
      } else {
        nodes.push(
          <ol key={listKey} className="my-2 space-y-1.5 pl-1">
            {listBuffer.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                <span className="text-xs font-bold text-indigo-600 font-mono mt-0.5 shrink-0 w-4 text-right">
                  {(listBuffer?.startNum || 1) + idx}.
                </span>
                <span className="flex-1">{renderInlineText(item)}</span>
              </li>
            ))}
          </ol>
        );
      }
      listBuffer = null;
    };

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushList(`${keyPrefix}-list-${lineIdx}`);
        return;
      }

      // Check headings
      if (trimmed.startsWith('### ')) {
        flushList(`${keyPrefix}-list-${lineIdx}`);
        nodes.push(
          <h4 key={`${keyPrefix}-h4-${lineIdx}`} className="text-sm font-bold text-slate-900 mt-3 mb-1.5">
            {renderInlineText(trimmed.slice(4))}
          </h4>
        );
        return;
      }
      if (trimmed.startsWith('## ')) {
        flushList(`${keyPrefix}-list-${lineIdx}`);
        nodes.push(
          <h3 key={`${keyPrefix}-h3-${lineIdx}`} className="text-base font-extrabold text-slate-900 mt-3.5 mb-1.5">
            {renderInlineText(trimmed.slice(3))}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith('# ')) {
        flushList(`${keyPrefix}-list-${lineIdx}`);
        nodes.push(
          <h2 key={`${keyPrefix}-h2-${lineIdx}`} className="text-lg font-black text-slate-900 mt-4 mb-2">
            {renderInlineText(trimmed.slice(2))}
          </h2>
        );
        return;
      }

      // Check bullet point
      const bulletMatch = line.match(/^(\s*)[-*•]\s+(.*)$/);
      if (bulletMatch) {
        const itemText = bulletMatch[2];
        if (listBuffer && listBuffer.type === 'bullet') {
          listBuffer.items.push(itemText);
        } else {
          flushList(`${keyPrefix}-list-${lineIdx}`);
          listBuffer = { type: 'bullet', items: [itemText] };
        }
        return;
      }

      // Check numbered list
      const numMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
      if (numMatch) {
        const startNum = parseInt(numMatch[2], 10);
        const itemText = numMatch[3];
        if (listBuffer && listBuffer.type === 'number') {
          listBuffer.items.push(itemText);
        } else {
          flushList(`${keyPrefix}-list-${lineIdx}`);
          listBuffer = { type: 'number', items: [itemText], startNum };
        }
        return;
      }

      // Regular line/paragraph
      flushList(`${keyPrefix}-list-${lineIdx}`);
      nodes.push(
        <p key={`${keyPrefix}-p-${lineIdx}`} className="my-1.5 text-sm leading-relaxed text-slate-700">
          {renderInlineText(trimmed)}
        </p>
      );
    });

    flushList(`${keyPrefix}-list-end`);
    return nodes;
  };

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = content.substring(lastIndex, match.index);
      elements.push(...processTextChunk(textChunk, `chunk-${lastIndex}`));
    }
    const lang = match[1];
    const code = match[2];
    elements.push(<CodeBlock key={`code-${match.index}`} code={code} language={lang} />);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const trailingChunk = content.substring(lastIndex);
    elements.push(...processTextChunk(trailingChunk, `chunk-${lastIndex}`));
  }

  return <div className="space-y-0.5">{elements}</div>;
}
