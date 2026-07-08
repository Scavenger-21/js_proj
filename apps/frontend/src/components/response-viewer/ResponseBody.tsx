'use client';
import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Copy, Check, WrapText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatResponseBody } from '@/lib/json-utils';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface ResponseBodyProps {
  body: unknown;
}

export function ResponseBody({ body }: ResponseBodyProps) {
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const { content, language } = formatResponseBody(body);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-text-disabled">
        <div className="text-xs">Empty response body</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span
          className="text-2xs font-mono font-semibold uppercase tracking-widest"
          style={{ color: '#555770' }}
        >
          {language}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWordWrap((w) => !w)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-all duration-200"
            style={wordWrap
              ? { background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#8b8ea0' }}
          >
            <WrapText size={11} />
            Wrap
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-text-secondary rounded-lg transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {copied
              ? <><Check size={11} className="text-success" /><span className="text-success">Copied!</span></>
              : <><Copy size={11} />Copy</>
            }
          </button>
        </div>
      </div>

      {/* Monaco Viewer */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language={language}
          value={content}
          theme="vs-dark"
          options={{
            readOnly: true,
            fontSize: 13,
            fontFamily: '"JetBrains Mono", "Geist Mono", monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: wordWrap ? 'on' : 'off',
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            padding: { top: 12, bottom: 12 },
            contextmenu: false,
            folding: true,
            tabSize: 2,
            lineNumbersMinChars: 3,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
        />
      </div>
    </div>
  );
}
