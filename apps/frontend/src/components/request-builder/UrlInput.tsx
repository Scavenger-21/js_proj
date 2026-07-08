'use client';
import { useRef, useState } from 'react';
import { Lock, Unlock, Globe, Loader2 } from 'lucide-react';
import { useStore } from '@/store';
import { METHOD_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface UrlInputProps {
  onSend: () => void;
  isLoading: boolean;
}

function normalizeUrl(url: string): string {
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) return `https://${url}`;
  return url;
}

function isSecure(url: string): boolean | null {
  if (!url) return null;
  try { return new URL(normalizeUrl(url)).protocol === 'https:'; } catch { return null; }
}

function isValidUrl(url: string): boolean {
  try { new URL(normalizeUrl(url)); return true; } catch { return false; }
}

export function UrlInput({ onSend, isLoading }: UrlInputProps) {
  const url    = useStore((s) => s.url);
  const setUrl = useStore((s) => s.setUrl);
  const method = useStore((s) => s.method);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const secure = isSecure(url);
  const valid  = isValidUrl(url);

  const handleSend = () => {
    if (url && !/^https?:\/\//i.test(url)) setUrl(`https://${url}`);
    onSend();
  };

  return (
    <div
      className="flex items-center h-10 rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: focused
          ? '1px solid rgba(99,102,241,0.5)'
          : '1px solid rgba(255,255,255,0.1)',
        boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
      }}
    >
      {/* Protocol icon */}
      <div
        className="flex items-center justify-center w-9 shrink-0 h-full"
        style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}
      >
        {secure === null  && <Globe   size={13} className="text-text-disabled" />}
        {secure === true  && <Lock    size={13} className="text-success" />}
        {secure === false && <Unlock  size={13} className="text-warning" />}
      </div>

      {/* URL input */}
      <input
        ref={inputRef}
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => { if (e.key === 'Enter' && valid && !isLoading) handleSend(); }}
        placeholder="https://api.example.com/v1/endpoint"
        spellCheck={false}
        autoComplete="off"
        className="flex-1 h-full bg-transparent px-3 text-sm font-mono text-text-primary placeholder:text-text-disabled focus:outline-none min-w-0"
      />

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!valid || isLoading}
        className={cn(
          'flex items-center gap-2 h-full px-4 text-sm font-semibold transition-all duration-200 shrink-0',
          valid && !isLoading
            ? 'text-white cursor-pointer hover:brightness-110 active:scale-95'
            : 'text-text-disabled cursor-not-allowed',
        )}
        style={
          valid && !isLoading
            ? {
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
              }
            : {
                background: 'rgba(255,255,255,0.03)',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
              }
        }
      >
        {isLoading ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            <span className="text-xs">Sending…</span>
          </>
        ) : (
          <>
            <span className={cn('text-2xs font-bold font-mono hidden sm:block', METHOD_COLORS[method])}>{method}</span>
            <span className="text-xs font-semibold">Send</span>
          </>
        )}
      </button>
    </div>
  );
}
