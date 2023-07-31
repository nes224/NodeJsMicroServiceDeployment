const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require('axios');
const { APP_SECRET, MESSAGE_BROKEN_URL, EXCHANGE_NAME, QUEUE_NAME, SHOPPING_BINDING_KEY } = require("../config");
const amqplib = require('amqplib');
const { CUSTOMER_BINDING_KEY } = require("../../../products/src/config");
//Utility functions
module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.get("Authorization");
    console.log(signature);
    const payload = await jwt.verify(signature.split(" ")[1], APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

/* ------------------ Message Broker ------------ */

// create a channel
module.exports.CreateChannel = async () => {
  const conenction = await amqplib.connect(process.env.MESSAGE_BROKER_URL);
  const channel = await conenction.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, 'direct', false);
  return channel;
}

module.exports.PublishMessage = async (channel, binding_key, message) => {
  try {
    await channel.public(EXCHANGE_NAME, binding_key, Buffer.from(message));
    console.log('MEssage has been sent' + message)
  } catch (err) {
    throw err;
  }
}

module.exports.SubscribeMessage = async (channel, service) => {
  const appQueue = await channel.assertQueue(QUEUE_NAME);
  await channel.bindQueue(appQueue.queue, EXCHANGE_NAME, SHOPPING_BINDING_KEY);
  await channel.consume(appQueue.queue, data => {
    console.log('Receive data in Shopping Service.');
    console.log(data.content.toString());
    service.SubscribeEvents(data.content.toString());
    channel.ack(data);
  })
}