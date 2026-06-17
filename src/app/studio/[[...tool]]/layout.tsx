export const metadata = {
  title: "SS Consultores CMS",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ margin: 0, height: "100vh", maxHeight: "100dvh" }}>
      {children}
    </div>
  );
}
