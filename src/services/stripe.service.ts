import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error('Missing Stripe publishable key');
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export const stripeService = {
  async createCheckoutSession(
    reservationId: string,
    amount: number,
    objectTitle: string
  ): Promise<string> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        reservationId,
        amount,
        objectTitle
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    return sessionId;
  },

  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      throw error;
    }
  },

  async handlePayment(
    reservationId: string,
    amount: number,
    objectTitle: string
  ): Promise<void> {
    const sessionId = await this.createCheckoutSession(
      reservationId,
      amount,
      objectTitle
    );
    await this.redirectToCheckout(sessionId);
  }
};
