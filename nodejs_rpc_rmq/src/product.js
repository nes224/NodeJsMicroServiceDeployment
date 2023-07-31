const express = require('express');
const PORT = 8000;
const { RPCObserver,RPCRequest } = require('./rpc');


const app = express();
app.use(express.json());

const fakeProductResponse = {
    _id: "yt54354ewdster654yfdgd",
    title: "iPhone",
    price: 600
};

RPCObserver("PRODUCT_RPC", fakeProductResponse);

app.get('/customer',async(req,res) =>{
    const requestPayload = {
        customerId: 'yt54354ewdster654yfdgd'
    };

    try {
        const responseData = await RPCRequest('CUSTOMER_RPC',requestPayload);
        console.log(responseData);
        return res.json('Customer Service');

    } catch (err) {
        console.log(err);
        return res.status(400).json(error);
    }}
);

app.get('/',(req,res) =>{
    return res.json('Product Service');
});

app.listen(PORT, () =>{
    console.log(`Product is Running on ${PORT}`);
    console.clear();
});