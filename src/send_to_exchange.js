const amqp = require("amqplib");
const validator = require("xsd-schema-validator");
const logger = require("./logger").getLogger();

async function sendValidatedXML(xmlData, xsdData, routingKey) {
  // XML and XSD validation
  validator.validateXML(xmlData, xsdData, function (err, result) {
    if (err) {
      logger.error("Invalid XML data");
      return;
    }
  });

  // Connect to RabbitMQ server
  const connection = await amqp.connect("amqp://localhost");

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
