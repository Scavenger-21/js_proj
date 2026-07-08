'use client';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const PAGE_TITLES: Record<string, { title: string; description: string; emoji: string }> = {
  '/workspace':            { title: 'Request Builder',  description: 'Compose and send HTTP requests',       emoji: '⚡' },
  '/workspace/history':    { title: 'Request History',  description: 'Browse and replay past requests',      emoji: '🕐' },
  '/workspace/analytics':  { title: 'Analytics',        description: 'Performance trends and insights',      emoji: '📊' },
  '/workspace/health':     { title: 'Endpoint Health',  description: 'Monitor API reliability and latency',  emoji: '🩺' },
};

export function TopBar() {
  const pathname = usePathname();
  const page = PAGE_TITLES[pathname] ?? { title: 'APIForge', description: '', emoji: '⚡' };

  return (
    <header
      className="flex items-center justify-between h-[52px] px-5 shrink-0"
      style={{
        background: 'rgba(255,255,255,0.025)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Page Info */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3"
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg text-base"
          style={{
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          {page.emoji}
        </div>
        <div>
          <h1 className="text-sm font-semibold text-text-primary leading-none">{page.title}</h1>
          <p className="text-2xs text-text-tertiary mt-0.5">{page.description}</p>
        </div>
      </motion.div>

      {/* Right side */}
      <div className="flex items-center gap-2.5">
        {/* API Status */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.18)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
          <span className="text-2xs text-success font-medium">API connected</span>
        </div>

        {/* Brand badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <Zap size={11} className="text-accent" />
          <span className="text-2xs text-accent font-semibold tracking-tight">APIForge</span>
          <span className="text-2xs text-text-tertiary">v1.0</span>
        </div>
      </div>
    </header>
  );
}
