import type { HttpMethod } from '@apiforge/shared';

export const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-green-400',
  POST: 'text-indigo-400',
  PUT: 'text-amber-400',
  DELETE: 'text-red-400',
  PATCH: 'text-purple-400',
  HEAD: 'text-cyan-400',
  OPTIONS: 'text-slate-400',
};

export const METHOD_STYLES: Record<HttpMethod, string> = {
  GET: 'text-green-400 bg-green-400/10 border-green-400/20 hover:bg-green-400/15',
  POST: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20 hover:bg-indigo-400/15',
  PUT: 'text-amber-400 bg-amber-400/10 border-amber-400/20 hover:bg-amber-400/15',
  DELETE: 'text-red-400 bg-red-400/10 border-red-400/20 hover:bg-red-400/15',
  PATCH: 'text-purple-400 bg-purple-400/10 border-purple-400/20 hover:bg-purple-400/15',
  HEAD: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20 hover:bg-cyan-400/15',
  OPTIONS: 'text-slate-400 bg-slate-400/10 border-slate-400/20 hover:bg-slate-400/15',
};

export const METHOD_BG_STYLES: Record<HttpMethod, string> = {
  GET: 'bg-green-400/10 border-green-400/20',
  POST: 'bg-indigo-400/10 border-indigo-400/20',
  PUT: 'bg-amber-400/10 border-amber-400/20',
  DELETE: 'bg-red-400/10 border-red-400/20',
  PATCH: 'bg-purple-400/10 border-purple-400/20',
  HEAD: 'bg-cyan-400/10 border-cyan-400/20',
  OPTIONS: 'bg-slate-400/10 border-slate-400/20',
};
