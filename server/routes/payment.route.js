const paymentRouter = require("express").Router();
require("dotenv").config()
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const mongoose = require("mongoose");
const productModel = require("../models/product.model");
const bodyParser = require('body-parser');
paymentRouter.get("/",async(req,res)=>{
    try {
        res.send("pay")
    } catch (error) {
        console.log("error | payment route *********", error)
    }
})


paymentRouter.post("/checkout",async(req,res)=>{
    try {
    let data = req.body
   // Extract product IDs and ensure they are valid ObjectIds
   const productIds = data.items.map(item => item._id).filter(mongoose.Types.ObjectId.isValid);
    
   // Fetching product information from the database using await
   const products = await productModel.find({ _id: { $in: productIds } });

   // Creating a new array that combines the order info with the product details
   const detailedItems = data.items.map(item => {
     const product = products.find(p => p._id.toString() === item._id);
     return {
       quantity: item.quantity,
       productDetails: product ? product.toObject() : null
     };
   });
//    detailedItems is ready
    //-------------------------------------------------------------
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: detailedItems.map((item)=>{
            return    {
                price_data: {
                  currency: 'inr',  // Indian Rupee
                  product_data: {
                    name: item.productDetails.name,
                    images: ['https://example.com/t-shirt.png'],
                  },
                  unit_amount: item.productDetails.price*100,  // Make sure to adjust pricing to INR if necessary
                },
                quantity: item.quantity,
              }
        }),
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}?status=SUCCESS`,
        cancel_url:  `${process.env.CLIENT_URL}?status=FAILURE`,
      });
    console.log(session)
    res.json({url:session.url})







    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})



//webhooks for payment confirmation and security

paymentRouter.post('/webhooks', bodyParser.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
  
    try {
      // Construct event after verifying the signature
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object; // { id, object, ...}
  
      // Perform some operation
      await handlePaymentSuccess(session);
    }
  
    // Other event types can be handled here
  
    // Return a 200 response to acknowledge receipt of the event
    res.json({received: true});
  });
  
  const handlePaymentSuccess = async (session) => {
    // Your logic to handle successful payment.
    // Update the order in the database, send a confirmation email, etc.
    console.log("Hi from handle payment success , *************** ", )
    console.log("following is the session ",session)
  }


















module.exports={paymentRouter}