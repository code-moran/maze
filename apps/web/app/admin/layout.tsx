import type { Metadata } from "next";
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
  return <div className="dashboard-shell">{children}</div>;
}
