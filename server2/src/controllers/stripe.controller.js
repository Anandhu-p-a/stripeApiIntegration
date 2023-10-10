require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

async function createPaymentIntent(amount) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
  });
  return paymentIntent;
}
//capture
async function capturePaymentIntent(paymentIntentId) {
    const capture = await stripe.paymentIntents.capture(paymentIntentId);
    return capture;
  }
 //refund
  async function refundPaymentIntent(paymentIntentId) {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
    return refund;
  }

//list all payment intents
async function listPaymentIntents() {
    const paymentIntents = await stripe.paymentIntents.list({ limit: 100 });
    return paymentIntents.data;
  }
  