import type { Metadata } from 'next';
import { RequestBuilder } from '@/components/request-builder/RequestBuilder';
import { ResponseViewer } from '@/components/response-viewer/ResponseViewer';

export const metadata: Metadata = {
  title: 'Request Builder | APIForge',
  description: 'Compose and send HTTP requests with full header and body control.',
};

export default function WorkspacePage() {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Request Panel */}
      <div
        className="w-[48%] min-w-[360px] max-w-[640px] flex flex-col overflow-hidden"
        style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}
      >
        <RequestBuilder />
      </div>

      {/* Response Panel */}
      <div className="flex-1 min-w-[360px] flex flex-col overflow-hidden">
        <ResponseViewer />
      </div>
    </div>
  );
}
