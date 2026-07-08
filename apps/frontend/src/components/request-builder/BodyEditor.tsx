'use client';
import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Code2, WrapText, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store';
import { tryPrettify, tryMinify } from '@/lib/json-utils';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export function BodyEditor() {
  const body = useStore((s) => s.body);
  const setBody = useStore((s) => s.setBody);
  const method = useStore((s) => s.method);
  const [editorReady, setEditorReady] = useState(false);

  const isBodyAllowed = !['GET', 'HEAD', 'OPTIONS'].includes(method);

  const handleFormat = useCallback(() => setBody(tryPrettify(body)), [body, setBody]);
  const handleMinify = useCallback(() => setBody(tryMinify(body)), [body, setBody]);

  if (!isBodyAllowed) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-text-disabled">
        <div className="text-3xl">🚫</div>
        <p className="text-xs text-text-tertiary">{method} requests cannot have a body</p>
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
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-secondary">Request Body</span>
          <span
            className="px-1.5 py-0.5 text-2xs rounded-md font-mono"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#555770', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            JSON
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleFormat}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary rounded-lg transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            title="Prettify JSON"
          >
            <WrapText size={11} />
            Format
          </button>
          <button
            onClick={handleMinify}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary rounded-lg transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            title="Minify JSON"
          >
            <Minimize2 size={11} />
            Minify
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden relative">
        {!editorReady && (
          <div className="absolute inset-0 bg-bg-surface animate-pulse" />
        )}
        <MonacoEditor
          height="100%"
          language="json"
          value={body}
          onChange={(v) => setBody(v ?? '')}
          onMount={() => setEditorReady(true)}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: '"JetBrains Mono", "Geist Mono", monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            padding: { top: 12, bottom: 12 },
            suggest: { showWords: false },
            formatOnPaste: true,
            tabSize: 2,
            lineNumbersMinChars: 3,
            folding: true,
            contextmenu: false,
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
