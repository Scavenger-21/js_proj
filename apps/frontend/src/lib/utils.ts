import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getStatusColor(statusCode: number): string {
  if (statusCode >= 500) return 'text-error-400';
  if (statusCode >= 400) return 'text-warning-400';
  if (statusCode >= 300) return 'text-blue-400';
  if (statusCode >= 200) return 'text-success-400';
  return 'text-text-secondary';
}

export function getStatusBg(statusCode: number): string {
  if (statusCode >= 500) return 'bg-error/10 text-red-400 border-error/20';
  if (statusCode >= 400) return 'bg-warning/10 text-amber-400 border-warning/20';
  if (statusCode >= 300) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (statusCode >= 200) return 'bg-success/10 text-green-400 border-success/20';
  return 'bg-bg-subtle text-text-secondary border-border';
}

export function getMethodClasses(method: string): string {
  const map: Record<string, string> = {
    GET: 'method-get',
    POST: 'method-post',
    PUT: 'method-put',
    DELETE: 'method-delete',
    PATCH: 'method-patch',
    HEAD: 'method-head',
    OPTIONS: 'method-options',
  };
  return map[method.toUpperCase()] ?? 'bg-bg-subtle text-text-secondary';
}

export function truncateUrl(url: string, maxLength = 60): string {
  if (url.length <= maxLength) return url;
  try {
    const u = new URL(url);
    const base = `${u.hostname}${u.pathname}`;
    if (base.length <= maxLength) return base;
    return base.substring(0, maxLength - 3) + '…';
  } catch {
    return url.substring(0, maxLength - 3) + '…';
  }
}

export function getHealthRatingColor(rating: string): string {
  const map: Record<string, string> = {
    excellent: 'text-green-400',
    good: 'text-emerald-400',
    fair: 'text-yellow-400',
    poor: 'text-orange-400',
    critical: 'text-red-400',
  };
  return map[rating] ?? 'text-text-secondary';
}

export function getHealthScoreColor(score: number): string {
  if (score >= 90) return '#22c55e';
  if (score >= 75) return '#34d399';
  if (score >= 55) return '#f59e0b';
  if (score >= 30) return '#f97316';
  return '#ef4444';
}
