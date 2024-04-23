const amqp = require('amqplib/callback_api');

// RabbitMQ connection
amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }
        const queue = 'heartbeat_queue';

        // Declare queue
        channel.assertQueue(queue, {
            durable: false
        });

        // Receive messages
        console.log("Waiting for heartbeat messages...");
        channel.consume(queue, function(msg) {
            console.log("Received heartbeat message:", msg.content.toString());
        }, {
            noAck: true
        });
    });
});
