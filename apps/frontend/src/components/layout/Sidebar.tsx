'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Send, Clock, BarChart3, Activity,
  ChevronLeft, ChevronRight, Settings, Github,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/workspace',            icon: Send,     label: 'Request',   description: 'Build & send' },
  { href: '/workspace/history',    icon: Clock,    label: 'History',   description: 'Past requests' },
  { href: '/workspace/analytics',  icon: BarChart3,label: 'Analytics', description: 'Performance' },
  { href: '/workspace/health',     icon: Activity, label: 'Health',    description: 'API uptime' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useStore();

  return (
    <motion.aside
      animate={{ width: isSidebarCollapsed ? 60 : 224 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="relative flex flex-col h-full shrink-0 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      {/* Logo */}
      <div className="flex items-center gap-3 h-[52px] px-3.5 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))',
            border: '1px solid rgba(99,102,241,0.35)',
            boxShadow: '0 0 12px rgba(99,102,241,0.2)',
          }}
        >
          <Zap size={15} className="text-accent" />
        </motion.div>
        <AnimatePresence>
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              <p className="text-sm font-semibold text-text-primary tracking-tight whitespace-nowrap">APIForge</p>
              <p className="text-2xs text-text-tertiary whitespace-nowrap">v1.0 · Workspace</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-hidden">
        {NAV_ITEMS.map((item, i) => {
          const Icon = item.icon;
          const isActive = item.href === '/workspace'
            ? pathname === '/workspace'
            : pathname.startsWith(item.href);

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 h-9 px-2.5 rounded-xl text-sm transition-all duration-200 group overflow-hidden',
                  isActive
                    ? 'text-text-primary'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                {/* Active background */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.1))',
                      border: '1px solid rgba(99,102,241,0.25)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                {/* Hover background */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/[0.04] transition-colors duration-200" />
                )}

                {/* Active left accent bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-accent"
                    style={{ boxShadow: '0 0 8px rgba(99,102,241,0.6)' }}
                  />
                )}

                <Icon
                  size={15}
                  className={cn(
                    'shrink-0 relative z-10 transition-colors duration-200',
                    isActive ? 'text-accent' : 'text-text-tertiary group-hover:text-text-secondary',
                  )}
                />

                <AnimatePresence>
                  {!isSidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.12 }}
                      className="relative z-10 min-w-0"
                    >
                      <p className="text-sm font-medium whitespace-nowrap">{item.label}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Bottom Actions */}
      <div className="px-2 py-3 space-y-1">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 h-9 px-2.5 rounded-xl text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04] transition-all duration-200 group"
        >
          <Github size={14} className="shrink-0" />
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs whitespace-nowrap"
              >
                GitHub
              </motion.span>
            )}
          </AnimatePresence>
        </a>
        <button className="flex items-center gap-3 h-9 px-2.5 rounded-xl text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04] transition-all duration-200 w-full">
          <Settings size={14} className="shrink-0" />
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs whitespace-nowrap"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-[66px] z-20 flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 hover:scale-110"
        style={{
          background: 'rgba(15,17,23,0.9)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {isSidebarCollapsed
          ? <ChevronRight size={12} className="text-text-secondary" />
          : <ChevronLeft size={12} className="text-text-secondary" />}
      </button>
    </motion.aside>
  );
}
