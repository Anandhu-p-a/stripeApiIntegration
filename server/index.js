require("dotenv").config();
const express = require("express");
const { connection } = require("./config/connect");
const productModel = require("./models/product.model");
const { paymentRouter } = require("./routes/payment.route");
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: false }));


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