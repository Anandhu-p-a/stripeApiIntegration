const stripeRoutes = require("express").Router();
require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);



stripeRoutes.get("/",async(req,res)=>{
    try {
        res.send(req.body)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

//1. create payment intent
stripeRoutes.post('/create_intent', async (req, res) => {
    try {
      const { amount } = req.body;  // Validate and sanitize input
      if(amount){
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'inr',
        payment_method_types: ['card'],
        capture_method: 'manual', // explicitly specifying manual capture
      });
      res.status(200).send({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    }else {res.status(404).json({error:"no payment provided"})}
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });
// dummy success payment intent id : pi_3NzDIzSEJdmgC4xl0t8t6jiV
// 2. capture intent
stripeRoutes.post('/capture_intent/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const paymentIntent = await stripe.paymentIntents.capture(id);
      res.status(200).send(paymentIntent);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });

// 3. refund 
stripeRoutes.post('/create_refund/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const refund = await stripe.refunds.create({
        payment_intent: id,
      });
      res.status(200).send(refund);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });
  
//4. get list of all intents
stripeRoutes.get('/get_intents', async (req, res) => {
    try {
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 100,  // Consider implementing pagination
      });
      res.status(200).send(paymentIntents);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });
  

module.exports = {stripeRoutes}