const amqp = require('amqplib/callback_api');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

function receiveMessage(queue, bindingKeys) {
    const credentials = amqp.credentials.plain('user', 'password');
    amqp.connect('amqp://10.2.160.51', { credentials }, function (error0, connection) {
        if (error0) {
            throw error0;
        }
        console.log('Connected to RabbitMQ');
        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1;
            }
            console.log('Channel created');
            const exchangeName = "amq.topic";

            // Declare a topic exchange / Create a topic exchange
            channel.assertExchange(exchangeName, 'topic', { durable: true });

            // Declare the queue
            channel.assertQueue(queue, { durable: true }, function (error2, queueName) {
                if (error2) {
                    throw error2;
                }
                console.log('Queue asserted');

                // Bind the queue to the exchange with the specified binding keys
                for (const bindingKey of bindingKeys) {
                    channel.bindQueue(queueName.queue, exchangeName, bindingKey);
                }

                // Start consuming messages from the queue
                channel.consume(queueName.queue, function (msg) {
                    console.log(" [x] Received", msg.content.toString());
                    receiverCallback.processMessage(msg); // Process the received message
                }, {
                    noAck: true // Auto-acknowledgment
                });
            });
        });
    });
}

const bindingKeys = ['user', 'consumptie'];
receiveMessage('inventory_queue', bindingKeys);
