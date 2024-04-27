const amqp = require('amqplib');

async function consumeMessages() {
    const credentials = require('amqplib').credentials.plain('user', 'password');
    const connection = await amqp.connect('amqp://10.2.160.51');
    const channel = await connection.createChannel();

    const queue = 'kassa_queue';
    await channel.assertQueue(queue, { durable: true });

    console.log(" [*] Waiting for messages. To exit press CTRL+W");

    channel.consume(queue, function (message) {
        const content = message.content.toString();
        console.log(" [x] Received", content);
        // Process the received XML data here

        // Acknowledge the message
        channel.ack(message);
    }, { noAck: false });
}

consumeMessages('kassa_queue').catch(console.error);
