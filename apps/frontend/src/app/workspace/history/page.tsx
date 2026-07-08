import type { Metadata } from 'next';
import { HistoryList } from '@/components/history/HistoryList';

export const metadata: Metadata = {
  title: 'Request History | APIForge',
  description: 'Browse, replay, and manage your API request history.',
};

export default function HistoryPage() {
  return (
    <div className="h-full overflow-hidden bg-bg-base">
      <HistoryList />
    </div>
  );
}
