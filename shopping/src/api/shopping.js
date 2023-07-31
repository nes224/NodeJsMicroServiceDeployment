const ShoppingService = require("../services/shopping-service");
const { SubscribeMessage,PublishMessage } = require("../utils");
const UserAuth = require('./middlewares/auth');
const {CUSTOMER_BINDING_KEY} = require('../config');

module.exports = (app,channel) => {

    const service = new ShoppingService();
    SubscribeMessage(channel,service);

    app.post('/order', UserAuth, async (req, res, next) => {
        const userObjIds = req.user;
        const txnNumber = req.body.txnId;

        try {
            const { data } = await service.PlaceOrder({ userObjIds, txnNumber });
            const payload = await service.GetOrderPayload(userObjIds._id, data, 'CREATE_ORDER');
            // PublishCustomerEvent(payload);
            PublishMessage(channel,CUSTOMER_BINDING_KEY,JSON.stringify(payload));

            return res.status(200).json(data);

        } catch (err) {
            next(err)
        }

    });

    app.get('/orders', UserAuth, async (req, res, next) => {

        const { _id } = req.user;

        try {
            const { data } = await service.GetOrders(_id);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }

    });

    app.get('/cart', UserAuth, async (req, res, next) => {
        const { _id } = req.user;

        try {
            const { data } = await service.getCart({ _id });
            return res.status(200).json(data)
        } catch (err) {

        }
    })
}