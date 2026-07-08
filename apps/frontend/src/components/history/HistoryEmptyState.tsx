'use client';
import { motion } from 'framer-motion';
import { Clock, Send, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function HistoryEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
      className="flex flex-col items-center justify-center h-full gap-6 p-8 relative overflow-hidden"
    >
      {/* Animated background glow */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
      />

      {/* Floating 3D icon */}
      <motion.div
        animate={{ y: [0, -8, 0], rotateX: [0, 5, 0], rotateY: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        className="relative z-10"
        style={{ perspective: 1000 }}
      >
        <div
          className="flex items-center justify-center w-20 h-20 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Clock size={32} className="text-text-disabled" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
        </div>
        
        {/* Orbiting badge */}
        <motion.div
          animate={{ rotateZ: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          className="absolute -bottom-2 -right-2 w-full h-full pointer-events-none"
        >
          <div
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
              border: '1px solid rgba(99,102,241,0.4)',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Send size={12} className="text-accent" />
          </div>
        </motion.div>

        {/* Sparkles */}
        <motion.div
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 3, delay: 1 }}
          className="absolute -top-3 -left-3"
        >
          <Sparkles size={16} className="text-accent/60" />
        </motion.div>
      </motion.div>

      <div className="text-center max-w-xs relative z-10">
        <h3 className="text-base font-semibold text-text-primary mb-2 tracking-tight">No Request History</h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          Your request history will appear here after you send your first API request.
        </p>
      </div>

      <Link
        href="/workspace"
        className="group relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-medium text-sm text-white overflow-hidden transition-all hover:scale-[1.02] active:scale-95 z-10"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 4px 16px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      >
        <motion.div
          className="absolute inset-0 bg-white/20"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
        <Send size={14} className="relative z-10" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
        <span className="relative z-10" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Send Your First Request</span>
      </Link>
    </motion.div>
  );
}
