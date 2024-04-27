const amqp = require('amqplib/callback_api');

function consumeMessages(queue) {
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
            channel.assertQueue(queue, { durable: true });
            console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);

            channel.consume(queue, function (msg) {
                console.log(" [x] Received", msg.content.toString());
                // Process the received XML data here

                // Acknowledge the message
                channel.ack(msg);
            }, {
                noAck: false
            });
        });
    });
}

consumeMessages('heartbeat_queue');
