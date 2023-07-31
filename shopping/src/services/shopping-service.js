const { ShoppingRepository } = require("../database");
const { FormateData } = require("../utils");

// All Business logic will be here
class ShoppingService {
  constructor() {
    this.repository = new ShoppingRepository();
  }

  async getCart({ _id }) {
    try {
      const cartItems = await this.repository.Cart(_id);
      return FormateData(cartItems)
    } catch (err) {
      throw err
    }
  }


  async PlaceOrder(userId) {

    // Verify the txn number with payment logs

    try {

      const orderResult = await this.repository.CreateNewOrder(userId, userId.txnNumber);
      return FormateData(orderResult);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async GetOrders(customerId) {
    try {
      const orders = await this.repository.Orders(customerId);
      return FormateData(orders);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  // get order details
  async ManageCart(customerId, product, qty, isRemove) {
    try {
      const cartResult = await this.repository.AddCartItem(customerId, product, qty, isRemove);
      return FormateData(cartResult);
    } catch (err) {
      throw new APIError('Data Not found', err)
    }
  }
  async AddToWishlist(customerId, product) {
    try {
      const wishlistResult = await this.repository.AddWishlistItem(customerId, product);
      return FormateData(wishlistResult);

    } catch (err) {
      throw new APIError('Data Not found', err)
    }
  }
  async SubscribeEvents(payload) {

    payload = JSON.parse(payload);

    const { event, data } = payload;

    const { userId, product, qty } = data;

    switch (event) {
      case 'ADD_TO_CART':
        this.ManageCart(userId, product, qty, false);
        break;
      case 'REMOVE_FROM_CART':
        this.ManageCart(userId, product, qty, true);
        break;
      case 'REMOVE_FROM_WISHLIST':
        this.AddToWishlist(userId, product)
        break;
      default:
        break;
    }

  }

  async GetOrderPayload(userId, order, event) {
    if (order) {
      const payload = {
        event: event,
        data: { userId, order }
      }
      return FormateData(payload)
    } else {
      return FormateData({ error: 'No Order is available' })
    }
  }

}

module.exports = ShoppingService;
