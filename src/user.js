const amqp = require("amqplib");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");

const logger = require("./logger").getLogger();
const FossbillingAdmin = require("./fossbilling/admin");
const { getClientIdByUuid, linkUuidToClientId } = require("./masteruuid");
const constants = require("./constants");

const parser = new XMLParser();
const fossbilling = new FossbillingAdmin();

async function setupUserConsumer(connection) {
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
      const user = object.user;
      switch (user.crud_operation) {
        case "create":
          try {
            const clientId = await fossbilling.createClient(user);
            logger.info(`Created client with id: ${clientId}`);
            await linkUuidToClientId(user.id, clientId);
            logger.info(`Linked UUID to client with id: ${clientId}`);
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
          // await deleteUser(user); // TODO: Needs Master UUID deletion method
          channel.ack(msg);
          return;
      }
    },
    {
      noAck: false,
    },
  );
}

module.exports = setupUserConsumer;
