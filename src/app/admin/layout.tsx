import { cookies, headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isLoginPage = pathname.includes("/admin/login");

  // For login page, render without any wrapper
  if (isLoginPage) {
    return <>{children}</>;
  }

  // For other admin pages, check authentication via AdminGuard component
  return <>{children}</>;
}
