export const metadata = {
  title: "Maze Studio",
  robots: { index: false, follow: false },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ height: "100vh", margin: 0, padding: 0 }}>{children}</div>
  );
}
