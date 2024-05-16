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
  logger.info(`Asserted exchange: ${exchange}`);
  await channel.assertQueue(queue, { durable: true });
  logger.info(`Asserted queue: ${queue}`);
  logger.info(`Start consuming messages: ${queue}`);
  channel.consume(
    queue,
    async function (msg) {
      logger.info(`Received message: ${msg.content.toString()}`);
      const object = parser.parse(msg.content.toString());
      switch (user.crud_operation) {
        case "create":
          try {
            const clientId = await getClientIdByUuid(object.order.user_id);
            const createdOrder = await fossbilling.createOrder(order, clientId);
            // TODO: Make an `invoice` object and send it to the `facturatie` queue.
            channel.ack(msg);
          } catch (error) {
            logger.error(error);
            channel.nack(msg);
          }
          break;
        case "update":
          channel.ack(msg);
          return;
        case "delete":
          channel.ack(msg);
          return;
      }
    },
    {
      noAck: false,
    },
  );
}

module.exports = setupOrderConsumer;
