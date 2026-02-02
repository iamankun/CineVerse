import { cookies, headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin layout - render children directly
  // Authentication is handled by individual components
  return <>{children}</>;
}
