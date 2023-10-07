require("dotenv").config();
const express = require("express");
const { connection } = require("./config/connect");
const productModel = require("./models/product.model");
const { paymentRouter } = require("./routes/payment.route");
const app = express();

app.use(express.urlencoded({ extended: false }));
const bodyParser = require('body-parser');
//webhook url verification with body parser only and not express.json()

app.post('payment/webhooks', bodyParser.raw({type: 'application/json'}), async (req, res) => {
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

//-web hook ends --------------------------------------------------------------------------------------


app.use(express.json())

app.get("/",async(req,res)=>{
    try {
        let data = await productModel.find();
        res.send(data)
    } catch (error) {
        console.log(error)
    }
    
})

app.use("/payment",paymentRouter)






app.listen(8001,async(req,res)=>{
    try {
        await connection;
        console.log("connected to remote db")
    } catch (error) {
        console.log("error in connection",error)
    }
    console.log("app started @ http://localhost:8001/ ")
})