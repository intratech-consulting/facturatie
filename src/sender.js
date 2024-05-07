const amqp = require('amqplib/callback_api');
const os = require('os');

async function isConsumerRunning() {
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
        exec('ps aux | grep "node consumer.js"', (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout.includes('node consumer.js'));
        });
    });
}

function sendHeartbeat(channel) {
    const serviceName = 'facturatie';
    const timestamp = Math.floor(Date.now() / 1000);
    isConsumerRunning().then(isRunning => {
        const error = isRunning ? '' : ' consumer script is not running';
        const status = 200;
        const xmlData = `
            <heartbeat>
                <service>${serviceName}</service>
                <timestamp>${timestamp}</timestamp>
                <error>${error}</error>
                <status>${status}</status>
                <extra>
                    <user-count>${os.userInfo().username}</user-count>
                </extra>
            </heartbeat>`;
        
        channel.sendToQueue('user', Buffer.from(xmlData));
        console.log(' [x] Sent Heartbeat');
    }).catch(error => {
        console.error('Error checking if consumer is running:', error);
    });
}

function connectAndSendHeartbeat() {
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
            channel.assertQueue('user', { durable: true });
            console.log(' [*] Waiting for messages. To exit press CTRL+C\n');

            setInterval(() => {
                sendHeartbeat(channel);
            }, 5000); // Send heartbeat every 5 seconds
        });
    });
}



connectAndSendHeartbeat();
