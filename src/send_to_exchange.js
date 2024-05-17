const amqp = require("amqplib");
const logger = require("./logger").getLogger();

async function sendValidatedXML(xmlData, routingKey) {
  // Connect to RabbitMQ server
  const connection = await amqp.connect("amqp://localhost:5672");

  // Create channel
  const channel = await connection.createChannel();

  // Define exchange
  const exchange = "amq.topic";

  // Assert an exchange into existence
  await channel.assertExchange(exchange, "topic", { durable: true });

  // Send xmlData to the exchange with the routing key
  channel.publish(exchange, routingKey, Buffer.from(xmlData));

  logger.info(`Sent validated XML data to topic: ${routingKey}`);

  // Close channel and connection
  await channel.close();
  await connection.close();
}

module.exports = sendValidatedXML;
