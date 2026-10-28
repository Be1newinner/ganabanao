/**
 * Razorpay Checkout in the browser. It only collects the payment; credits are
 * added by the API when Razorpay's signed webhook arrives (FR-7.6), never here.
 */

interface CheckoutOptions {
  key: string;
  name: string;
  description: string;
  order_id?: string;
  subscription_id?: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler: (response: Record<string, string>) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", cb: (res: { error?: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: CheckoutOptions) => RazorpayInstance;
  }
}

const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
let loading: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error("Could not load Razorpay. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });
  return loading;
}

/** Opens Checkout; resolves true when the user completes payment, false if they close it. */
export async function openCheckout(options: Omit<CheckoutOptions, "handler" | "modal">): Promise<boolean> {
  await loadScript();
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      ...options,
      handler: () => resolve(true),
      modal: { ondismiss: () => resolve(false) },
    });
    rzp.on("payment.failed", (res) => reject(new Error(res.error?.description ?? "Payment failed.")));
    rzp.open();
  });
}
