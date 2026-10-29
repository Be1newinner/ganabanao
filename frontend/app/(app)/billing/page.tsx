import { BillingView } from "./billing-view";

// Rendered in the browser behind the session check; see app/(app)/layout.tsx
export const instant = false;

export default function Page() {
  return <BillingView />;
}
