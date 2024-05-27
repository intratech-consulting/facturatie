const amqp = require("amqplib");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
const Logger = require("./logger");
const logger = Logger.getLogger();
const FossbillingAdmin = require("./fossbilling/admin");
const { getClientIdByUuid, linkUuidToClientId, updateUuidToClientId } = require("./masteruuid");
const constants = require("./constants");

const parser = new XMLParser();
const fossbilling = new FossbillingAdmin();

async function setupUserConsumer(connection) {
  const channel = await connection.createChannel();
  const exchange = "amq.topic";
  const queue = constants.SYSTEM;

  await channel.assertExchange(exchange, "topic", { durable: true });
  logger.log("main", `Asserted exchange: ${exchange}`, false);
  await channel.assertQueue(queue, { durable: true });
  logger.log("main", `Asserted queue: ${queue}`, false);
  logger.log("main", `Start consuming messages: ${queue}`, false);
  channel.consume(
    queue,
    async function (msg) {
      logger.log(
        "setupUserConsumer",
        `Received message: ${msg.content.toString()}`,
        false,
      );
      const object = parser.parse(msg.content.toString());
      const user = object.user;

      switch (user.crud_operation) {
        case "create":
          try {
            if (await fossbilling.userExists(user.email)) {
              logger.log(
                "setupUserConsumer",
                `Client with email ${user.email} already exists.`,
                false,
              );
              channel.ack(msg);
              return;
            }
            const clientId = await fossbilling.createClient(user);
            logger.log(
              "setupUserConsumer",
              `Created client with id: ${clientId}`,
              false,
            );
            await linkUuidToClientId(user.id, clientId);
            logger.log(
              "setupUserConsumer",
              `Linked UUID to client with id: ${clientId}`,
              false,
            );
            channel.ack(msg);
          } catch (error) {
            logger.log(
              "setupUserConsumer",
              `Error during creation - User UUID: ${user.id}.`,
              true,
            );
            channel.nack(msg);
          }
          break;
        case "update":
          try {
            const clientId = await getClientIdByUuid(user.id);
            logger.log(
              "setupUserConsumer",
              `Updating client with id: ${clientId}`,
              false,
            );
            if (!(await fossbilling.userExists('', clientId))) {
              logger.log(
                "setupUserConsumer",
                `Client with id ${clientId} does not exist.`,
                false,
              );
              channel.ack(msg);
              return;
            }
            await fossbilling.updateClient(clientId, user);
            logger.log(
              "setupUserConsumer",
              `Updated client with id: ${clientId}`,
              false,
            );
            channel.ack(msg);
          } catch (error) {
            logger.log(
              "setupUserConsumer",
              `Error during update - User UUID: ${user.id}.`,
              true,
            );
            channel.nack(msg);
          }
          break;
        case "delete":
          try {
            if (!(await fossbilling.userExists(user.email))) {
              logger.log(
                "setupUserConsumer",
                `Client with email ${user.email} does not exist.`,
                false,
              );
              channel.ack(msg);
              return;
            }
            const clientId = await getClientIdByUuid(user.id);
            logger.log(
              "setupUserConsumer",
              `Deleting client with id: ${clientId}`,
              false,
            );
            fossbilling.deleteClient(clientId);
            logger.log(
              "setupUserConsumer",
              `Deleted client with id: ${clientId}`,
              false,
            );
            await updateUuidToClientId(user.id, "NULL");
            channel.ack(msg);
          } catch (error) {
            logger.log(
              "setupUserConsumer",
              `Error during deletion - User UUID: ${user.id}.`,
              true,
            );
            channel.nack(msg);
          }
          break;
        default:
          logger.log(
            "setupUserConsumer",
            `Unknown operation: ${user.crud_operation}`,
            true,
          );
          channel.nack(msg);
      }
    },
    {
      noAck: false,
    },
  );
}

module.exports = setupUserConsumer;
