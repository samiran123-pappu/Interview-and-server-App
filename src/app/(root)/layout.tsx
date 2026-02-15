import StreamClientProvider from "@/components/providers/StreamClientProvider";
import OnlineTracker from "@/components/OnlineTracker";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StreamClientProvider>
      <OnlineTracker />
      {children}
    </StreamClientProvider>
  );
}
export default Layout;