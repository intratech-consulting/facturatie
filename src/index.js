const amqp = require("amqplib");
const Logger = require("./logger");
const setupHeartbeats = require("./heartbeat");
const setupConsumer = require("./consumer");
require("dotenv").config();

async function main() {
  const credentials = amqp.credentials.plain(
    process.env.RABBITMQ_USER,
    process.env.RABBITMQ_PASS,
  );
  const connection = await amqp.connect(process.env.RABBITMQ_URL, {
    credentials,
  });
  let logger = new Logger();
  await logger.setupLogger(connection);
  await setupHeartbeats(connection);

  await setupConsumer(connection);

}

main();
