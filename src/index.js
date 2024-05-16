const amqp = require("amqplib");
const { getLogger } = require("./logger");
const setupUserConsumer = require("./user");
const setupOrderConsumer = require("./order");
const setupHeartbeats = require("./heartbeat");
require("dotenv").config();

const logger = getLogger();

async function main() {
  const credentials = amqp.credentials.plain(process.env.RABBITMQ_USER, process.env.RABBITMQ_PASS);
  const connection = await amqp.connect(process.env.RABBITMQ_URL, {
    credentials,
  });
  logger.info("Connected to RabbitMQ");
  await setupHeartbeats(connection);
  await setupUserConsumer(connection);
  await setupOrderConsumer(connection);
}

main();
