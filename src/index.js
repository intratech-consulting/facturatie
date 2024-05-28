const amqp = require("amqplib");
const Logger = require("./logger");
const setupUserConsumer = require("./user");
const { setupInvoicePublisher, setupOrderConsumer  }= require("./order");
const setupHeartbeats = require("./heartbeat");
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
  await setupUserConsumer(connection);
  await setupUserPublisher(connection);
}

main();
