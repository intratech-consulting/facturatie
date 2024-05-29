const amqp = require("amqplib");
const bodyParser = require('body-parser');
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
const Logger = require("./logger");
const logger = Logger.getLogger();
const FossbillingAdmin = require("./fossbilling/admin");
const { getClientIdByUuid, linkUuidToClientId, updateUuidToClientId } = require("./masteruuid");
const constants = require("./constants");
const parser = new XMLParser();
const fossbilling = new FossbillingAdmin();

let users;

async function setupUserPublisher(connection) {
  const channel = await connection.createChannel();
  await channel.assertExchange(constants.MAIN_EXCHANGE, "topic", { durable: true });
  logger.log("setupUserPublisher", `Asserted exchange: ${constants.MAIN_EXCHANGE}`, false);

  try {
    setTimeout(async () => {
      users = await fossbilling.getClientList();
    }, 5000);
    console.log("Users: " + users)
  } catch (error) {
    logger.log("setupUserPublisher", "Error during fetching clients.", true);
    return;
  }

  while (true) {
    setTimeout(async () => {
      console.log("Checking for new users")
      let newUsers = await fossbilling.getClientList();
      let diff = newUsers.filter(x => !users.includes(x));
      users = newUsers;
      console.log("Diff: " + diff)
      for (let user of diff) {
        user.routing_key = constants.USER_ROUTING;
        const builder = new XMLBuilder();
        const xml = builder.build({ user: user });
        if(!XMLValidator.validate(xml)) {
          console.log("ERROR: XML validation failed")
          logger.log("setupUserPublisher", `XML validation failed`, true);
          return;
        }
        console.log("Publishing message: " + xml);
        channel.publish(constants.MAIN_EXCHANGE, constants.USER_ROUTING, Buffer.from(xml));
        logger.log('setupUserPublisher', `Published message: ${xml}`, false);
      }
    }, 10000)
  }
}

async function setupUserConsumer(user, channel, msg) {
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
        const clientId = Number((await getClientIdByUuid(user.id)).facturatie);
        logger.log(
          "setupUserConsumer",
          `Updating client with id: ${clientId}`,
          false,
        );
        if (!await fossbilling.userExists('', clientId)) {
          logger.log(
            "setupUserConsumer",
            `Client with id ${clientId} does not exist.`,
            false,
          );
          channel.ack(msg);
          return;
        }
        await fossbilling.updateClient(user, clientId);
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
        const clientId = Number((await getClientIdByUuid(user.id)).facturatie);
        logger.log(
          "setupUserConsumer",
          `Deleting client with id: ${clientId}`,
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
        }// delete client id 
        console.log("Deleting client with id: " + clientId)
        try {
          await fossbilling.deleteClient(clientId);
        } catch (error) {
          console.log("Not deleting client with id: " + clientId + " because of " + error)
          channel.ack(msg);
          return;
        }
        logger.log(
          "setupUserConsumer",
          `Deleted client with id: ${clientId}`,
          false,
        );

        await updateUuidToClientId(user.id, null);
        channel.ack(msg);
        console.log("Return hard delete message")
        user.routing_key = constants.USER_ROUTING;
        const builder = new XMLBuilder();
        const xml = builder.build({ user: user });
        if(!XMLValidator.validate(xml)) {
          console.log("ERROR: XML validation failed")
          logger.log("setupUserConsumer", `XML validation failed`, true);
          return;
        }
        console.log("Publishing message: " + xml);
        channel.publish(constants.MAIN_EXCHANGE, constants.USER_ROUTING, Buffer.from(xml));
        logger.log('setupUserPublisher', `Published message: ${xml}`, false);
      } catch (error) {
        console.log("ERROR:", error)
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
}

module.exports = { setupUserPublisher, setupUserConsumer };
