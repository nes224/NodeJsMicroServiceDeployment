const amqplib = require("amqplib");
const { v4: uuid4 } = require("uuid");

let amqplibConnection = null;

const getChannel = async () => {
    if (amqplibConnection === null) {
        amqplibConnection = await amqplib.connect('amqp://localhost');
    }
    return await amqplibConnection.createChannel();
};

const expensiveDBOperation = (payload, fakeResponse) => {
    console.log(payload);
    console.log(fakeResponse);
    return new Promise((res, rej) => {
        setTimeout(() => {
            res(fakeResponse)
        }, 3000);
    })
}

// This it will going to observe the activities like,
// if you are sending something,
// from the client then we will process some operation inside.
const RPCObserver = async (RPC_QUEUE_NAME, fakeResponse) => {
    // What is actually going to do like everytime if you have received any kind
    // of the rpc call then it will monitor this stuff and it will give you back some data.
    const channel = await getChannel();
    await channel.assertQueue(RPC_QUEUE_NAME, {
        durable: false, // durable fault it will just not stay forever, once this is kind of delivered then it will go away.
    });
    channel.prefetch(1); // The prefetch is a kind of value defines the number of maximum number of the unaccuracy deliveries that are prominent in this channel. 
    channel.consume(RPC_QUEUE_NAME, async (msg) => { // channel.consume will any message if it is coming by this queue name, if that the message has contained then we will perform this operation.
        if (msg.content) {
            // DB Operation
            const payload = JSON.parse(msg.content.toString());
            const response = await expensiveDBOperation(payload, fakeResponse); // call fake db operation

            // While we will listening to this queue then we will get a message,
            // and that message we will check if that message has a reply,
            // to queue name then we will provide this specfic data.
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)),
                {
                    correlationId: msg.properties.correlationId, // Here along with we are just providing a kind of correlation id which is also coming from the message.  
                }
            );
            // once you're receiving the message.
            channel.ack(msg); // acknowledge
        }
    }, {
        noAck: false,
    });
};

const requestData = async (RPC_QUEUE_NAME, requestPayload, uuid) => {
    // center channel

    const channel = await getChannel();

    // created a sort a queue and we're skipping at this kind of exclusive true.
    // that means if some response or something is going to become over here,
    // then this specfic channel specfic connection only able to receive it.
    const q = await channel.assertQueue("", { exclusive: true });

    // We have already send the request to some service.
    // now we are just waiting for the response,
    // So how we can get it
    // by channel.consume
    // channel consume that specific request by this queue and after that it will determine like 
    // if any messag we are receiving any message then message have properties and that properties 
    // will be having kind of correlationId then we will resolving this permit promise.
    channel.sendToQueue(
        RPC_QUEUE_NAME,
        Buffer.from(JSON.stringify(requestPayload)),
        {
            replyTo: q.queue,
            correlationId: uuid,
        }
    );



    return new Promise((resolve, reject) => {
        // timeour n
        const timeout = setTimeout(() => {
            channel.close();
            resolve("API cloud not fullfil the request!");
        }, 8000)

        // We are received able to receive the response or not.
        channel.consume(q.queue, (msg) => {
            if (msg.properties.correlationId === uuid) {
                resolve(JSON.parse(msg.content.toString()));
                clearTimeout(timeout);
            } else {
                reject("Data Not found!");
            }
        },
            {
                noAck: true,
            }
        );
    });
};

// We are going to use the while we will just send some kind,
// of request to other services.
const RPCRequest = async (RPC_QUEUE_NAME, requestPayload) => {
    const uuid = uuid4(); // correlationId
    return await requestData(RPC_QUEUE_NAME, requestPayload, uuid);
};

module.exports = {
    getChannel,
    RPCObserver,
    RPCRequest
}