export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth pages don't use the dashboard shell
  return <>{children}</>;
}
