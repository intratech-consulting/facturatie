const amqp = require("amqplib");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");

const logger = require("./logger").getLogger();
const FossbillingAdmin = require("./fossbilling/admin");
const { getClientIdByUuid } = require("./masteruuid");
const constants = require("./constants");

const parser = new XMLParser();
const fossbilling = new FossbillingAdmin();

async function setupOrderConsumer(connection) {
  const channel = await connection.createChannel();
  const exchange = "amq.topic";
  const queue = constants.SYSTEM;
  await channel.assertExchange(exchange, "topic", { durable: true });
  logger.log("setupOrderConsumer", `Asserted exchange: ${exchange}`, false);
  await channel.assertQueue(queue, { durable: true });
  logger.log("setupOrderConsumer", `Asserted queue: ${queue}`, false);
  logger.log("setupOrderConsumer", `Start consuming messages: ${queue}`, false);
  channel.consume(
    queue,
    async function (msg) {
      logger.log("setupOrderConsumer", `Received message: ${msg.content.toString()}`, false);
      const object = parser.parse(msg.content.toString());
      switch (user.crud_operation) {
        case "create":
          try {
            const clientId = await getClientIdByUuid(object.order.user_id);
            const createdOrder = await fossbilling.createOrder(order, clientId);
            // TODO: Make an `invoice` object and send it to the `facturatie` queue.
            channel.ack(msg);
          } catch (error) {
            logger.log("setupOrderConsumer", `Nack message: ${msg.content.toString()}`, true);
            channel.nack(msg);
          }
          break;
        case "update":
          logger.log("setupOrderConsumer", `Unsupported operation: ${msg.content.toString()}`, true);
          channel.nack(msg);
          return;
        case "delete":
          logger.log("setupOrderConsumer", `Unsupported operation: ${msg.content.toString()}`, true);
          channel.nack(msg);
          return;
      }
    },
    {
      noAck: false,
    },
  );
}

module.exports = setupOrderConsumer;
