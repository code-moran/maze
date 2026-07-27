import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import "@/styles/maze.css";

export const metadata: Metadata = {
  title: "Dashboard | Maze",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="dashboard-shell">{children}</div>
    </AuthProvider>
  );
}
