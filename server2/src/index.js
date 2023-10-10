const express = require("express");
const app  = express();
require("dotenv").config();
const port = process.env.port || 9001
const bodyParser = require('body-parser');
const { stripeRoutes } = require("./routes/stripe.route");
const { Product } = require("./models/product.model");
const { User } = require("./models/user.model");
const { connect } = require("./config/connection");

//middlewares ------------------------
app.use(bodyParser.json());

// routes-----------------------------
app.get("/",async(req,res)=>{
    try {
       let data = await Product.find();
       res.send(data)
    } catch (error) {
        console.log(error)
    }
})
app.post('/products', async (req, res) => {
    try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).send(product);
    } catch (error) {
      res.status(400).send(error);
    }
  });
app.use("/api/v1",stripeRoutes)


app.listen(port,async()=>{
    try {
        await connect
        console.log("connected to remote db")
    } catch (error) {
        console.log("error in connection", error)
    }
    console.log(`server started @ http://localhost:${port}`)
})

