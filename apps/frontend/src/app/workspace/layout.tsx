import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-bg-base">
      {/* Aurora animated background */}
      <div className="aurora-bg">
        <div className="aurora-orb-3" />
      </div>

      {/* Layout */}
      <div className="relative z-10 flex w-full h-full">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </div>
  );
}
