const express = require('express');
const { RPCObserver, RPCRequest } = require('./rpc');
const PORT = 9000;

const app = express();
app.use(express.json());

const fakeCustomerResponse = {
    _id: "yt54354ewdster654yfdgd",
    name: "Mike",
    country: "Poland"
};

RPCObserver("CUSTOMER_RPC", fakeCustomerResponse);

app.get('/wishlist', async (req, res) => {
    const requestPayload = {
        productId: '123',
        customerId: 'yt54354ewdster654yfdgd'
    };

    try {
        const responseData = await RPCRequest('PRODUCT_RPC',requestPayload);
        console.log(responseData);
        return res.json('Customer Service');

    } catch (err) {
        console.log(err);
        return res.status(400).json(error);
    }
    // We will put a kind of request to the product service.
});

app.get('/', (req, res) => {
    return res.json('Customer Service');
});

app.listen(PORT, () => {
    console.log(`Customer is Running on ${PORT}`);
    console.clear();
});