
module.exports = (app) => {

    app.post('/app-events', async (req, res, next) => {
        const { payload } = req.body;

        console.log("================== Products Service recovered ======= ");
        return res.status(200).json(payload);
    });
}