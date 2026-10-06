declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key?: string;
  amount: number; // in paise
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  onSuccess: (response: RazorpaySuccessResponse) => void | Promise<void>;
  onDismiss?: () => void;
  onFailure?: (error: any) => void;
}

/**
 * Ensures Razorpay Checkout script is loaded in the DOM
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay Checkout SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Opens Razorpay Standard Web Checkout Modal
 */
export const openRazorpayCheckout = async (options: RazorpayCheckoutOptions): Promise<void> => {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded || !window.Razorpay) {
    throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
  }

  const razorpayKey =
    options.key ||
    import.meta.env.VITE_RAZORPAY_KEY_ID ||
    'rzp_test_TkWNcqpLEOsj8a';

  if (!razorpayKey) {
    throw new Error('Razorpay Key ID is missing. Please set VITE_RAZORPAY_KEY_ID in .env.');
  }

  const rzpOptions = {
    key: razorpayKey,
    amount: options.amount,
    currency: options.currency || 'INR',
    name: options.name || 'EzGo Event Marketplace',
    description: options.description || 'Escrow Payment for Event Services',
    image: options.image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=120&auto=format&fit=crop&q=80',
    order_id: options.order_id,
    prefill: {
      name: options.prefill?.name || '',
      email: options.prefill?.email || '',
      contact: options.prefill?.contact || '',
    },
    notes: options.notes || {},
    theme: {
      color: options.theme?.color || '#059669', // Emerald theme
    },
    modal: {
      ondismiss: () => {
        if (options.onDismiss) {
          options.onDismiss();
        }
      },
    },
    handler: async (response: RazorpaySuccessResponse) => {
      try {
        await options.onSuccess(response);
      } catch (err) {
        console.error('Error in Razorpay success handler:', err);
        if (options.onFailure) {
          options.onFailure(err);
        }
      }
    },
  };

  const rzp = new window.Razorpay(rzpOptions);

  rzp.on('payment.failed', (response: any) => {
    console.error('Razorpay Payment Failed:', response.error);
    if (options.onFailure) {
      options.onFailure(response.error);
    }
  });

  rzp.open();
};
