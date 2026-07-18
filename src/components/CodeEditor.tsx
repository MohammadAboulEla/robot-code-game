/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Code } from 'lucide-react';
import { tokenizePython } from '../utils/pythonTokenizer';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  executingLine: number | null;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  setCode,
  executingLine
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineGutterRef = useRef<HTMLDivElement>(null);
  const highlightBgRef = useRef<HTMLDivElement>(null);
  const codeHighlightRef = useRef<HTMLPreElement>(null);

  const handleEditorScroll = () => {
    if (textareaRef.current) {
      const scrollTop = textareaRef.current.scrollTop;
      const scrollLeft = textareaRef.current.scrollLeft;
      if (lineGutterRef.current) {
        lineGutterRef.current.scrollTop = scrollTop;
      }
      if (highlightBgRef.current) {
        highlightBgRef.current.scrollTop = scrollTop;
      }
      if (codeHighlightRef.current) {
        codeHighlightRef.current.scrollTop = scrollTop;
        codeHighlightRef.current.scrollLeft = scrollLeft;
      }
    }
  };

  useEffect(() => {
    handleEditorScroll();
  }, [code]);

  const codeLines = code.split('\n');

  return (
    <div className="bg-[#faf8f2] border border-[#3e382d] shadow-sm flex flex-col flex-1 min-h-0 h-full">
      {/* Header Editor Controls */}
      <div className="border-b border-[#3e382d] bg-[#eae3ce] px-4 py-2.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-[#9c3526]" />
          <span className="text-xs font-bold text-[#2e2a22] tracking-wider uppercase font-mono">Python Editor</span>
        </div>
        <span className="text-[10px] bg-[#faf8f2] px-2 py-0.5 border border-[#3e382d] text-[#5c5341] font-mono font-bold">
          PYTHON 3 CORE
        </span>
      </div>

      {/* Synchronized Gutter and Textarea Editor */}
      <div className="flex bg-[#faf8f2] flex-1 min-h-0 h-full relative text-xs font-mono">
        
        {/* 1. Gutter Line Numbers */}
        <div 
          ref={lineGutterRef}
          className="w-11 bg-[#eae3ce]/55 border-r border-[#3e382d] text-[#8a7c62] select-none text-right py-4 pr-3.5 overflow-hidden font-mono"
          style={{ lineHeight: '24px' }}
        >
          {codeLines.map((_, i) => {
            const isCurrent = executingLine === (i + 1);
            return (
              <div 
                key={`line-gutter-${i}`}
                className={`transition-colors duration-200 flex justify-end items-center gap-1 h-6 ${
                  isCurrent ? 'text-[#9c3526] font-bold' : ''
                }`}
                style={{ height: '24px', lineHeight: '24px' }}
              >
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#9c3526] inline-block"></span>}
                <span>{i + 1}</span>
              </div>
            );
          })}
        </div>

        {/* 2. Text Editor & Execution highlighting background layer */}
        <div className="flex-1 relative overflow-hidden h-full">
          
          {/* Highlight Line Background Overlay */}
          <div 
            ref={highlightBgRef}
            className="absolute inset-0 pointer-events-none py-4 select-none font-mono overflow-hidden h-full"
            style={{ lineHeight: '24px' }}
          >
            {codeLines.map((_, i) => {
              const isCurrent = executingLine === (i + 1);
              return (
                <div 
                  key={`line-bg-${i}`}
                  className={`w-full h-6 border-l-2 ${
                    isCurrent 
                      ? 'bg-[#9c3526]/10 border-[#9c3526]' 
                      : 'border-transparent'
                  }`}
                  style={{ height: '24px' }}
                />
              );
            })}
          </div>

          {/* Syntax Highlighted Code Overlay */}
          <pre
            ref={codeHighlightRef}
            className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-transparent select-none"
            style={{
              tabSize: 4,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: '12px',
              lineHeight: '24px',
              padding: '16px',
              margin: 0,
              border: 'none',
              boxSizing: 'border-box',
              whiteSpace: 'pre',
              color: '#2e2a22',
            }}
          >
            <code>
              {tokenizePython(code).map((token, i) => {
                let className = "text-[#2e2a22]"; // default charcoal
                if (token.type === 'comment') {
                  className = "text-[#8a7c62] italic";
                } else if (token.type === 'string') {
                  className = "text-[#4d7c0f] font-semibold";
                } else if (token.type === 'number') {
                  className = "text-[#b8005b]";
                } else if (token.type === 'keyword') {
                  className = "text-[#9c3526] font-bold";
                } else if (token.type === 'function') {
                  className = "text-[#1a6596] font-bold";
                } else if (token.type === 'punctuation') {
                  className = "text-[#5c5341]";
                }
                return (
                  <span key={`token-${i}`} className={className}>
                    {token.text}
                  </span>
                );
              })}
            </code>
          </pre>

          {/* Actual Textarea Element */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onScroll={handleEditorScroll}
            className="absolute inset-0 w-full h-full bg-transparent resize-none focus:outline-none overflow-auto scrollbar-thin scrollbar-thumb-[#eae3ce] selection:bg-[#9c3526]/20"
            placeholder="# Write your robot automation logic here..."
            spellCheck="false"
            style={{
              tabSize: 4,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: '12px',
              lineHeight: '24px',
              padding: '16px',
              margin: 0,
              border: 'none',
              boxSizing: 'border-box',
              whiteSpace: 'pre',
              color: code ? 'transparent' : 'inherit',
              WebkitTextFillColor: code ? 'transparent' : 'inherit',
              caretColor: '#9c3526',
            }}
          />
        </div>

      </div>
    </div>
  );
};
