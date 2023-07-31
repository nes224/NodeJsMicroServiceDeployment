const CustomerService = require('../services/customer-service');

module.exports = (app) => {
    const service = new CustomerService();

    app.post('/app-events', async (req, res, next) => {
        const { payload } = req.body;

        service.SubscribeEvents(payload);

        console.log("================== Customer Shopping Service recovered ======= ");
        return res.status(200).json(payload);
    });
}