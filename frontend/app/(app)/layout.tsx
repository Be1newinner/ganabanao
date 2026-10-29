import { AppShell } from "@/components/app-shell";

// Signed-in pages render in the browser behind the session check (the API owns
// the session cookie), so there is no server-rendered content to validate for
// instant navigation.
export const instant = false;

export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
