// Auth pages have their own full-page layout — no sidebar/nav
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
