const amqp = require('amqplib');
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

async function sendHeartbeat(channel) {
    const serviceName = 'facturatie';
    const timestamp = Math.floor(Date.now() / 1000);
    const isRunning = await isConsumerRunning(); // Changed variable name to avoid conflict
    const error = isRunning ? '' : ' consumer script is not running'; // Use the new variable name
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

    channel.sendToQueue('heartbeat_queue', Buffer.from(xmlData));
    console.log(' [x] Sent Heartbeat');
}

async function connectAndSendHeartbeat() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue('heartbeat_queue', { durable: false });

    console.log(' [*] Waiting for messages. To exit press CTRL+C\n');

    setInterval(async () => {
        await sendHeartbeat(channel);
    }, 5000); // Send heartbeat every 5 seconds
}

connectAndSendHeartbeat().catch(console.error);
