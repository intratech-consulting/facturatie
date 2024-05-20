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
  logger.log("main", "Connected to RabbitMQ server.", false);
  await setupHeartbeats(connection);
  logger.log("main", "Heartbeats setup.", false);
  await setupUserConsumer(connection);
  logger.log("main", "User consumer setup.", false);
  await setupInvoicePublisher(connection);
  logger.log("main", "Invoice publisher setup.", false);
  await setupOrderConsumer(connection);
  logger.log("main", "Order consumer setup.", false);
}

main();
