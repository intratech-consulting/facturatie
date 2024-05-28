const amqp = require("amqplib");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
const Logger = require("./logger");
const logger = Logger.getLogger();
const FossbillingAdmin = require("./fossbilling/admin");
const { getClientIdByUuid, linkUuidToClientId, updateUuidToClientId } = require("./masteruuid");
const constants = require("./constants");

const parser = new XMLParser();
const fossbilling = new FossbillingAdmin();

async function setupUserPublisher(connection) {
  const channel = await connection.createChannel();
  await channel.assertExchange(constants.MAIN_EXCHANGE, "topic", { durable: true });
  logger.log("setupUserPublisher", `Asserted exchange: ${exchange}`, false);
  
  channel.publish(exchange, constants.USER_ROUTING, Buffer.from('<user><routing_key>user.facturatie</routing_key><crud_operation>create</crud_operation><id>dab9414f-5530-4ddc-920a-1fd74a31c415</id><first_name>John</first_name><last_name>Doe</last_name><email>john.doe@mail.com</email><telephone>+32467179912</telephone><birthday>2024-04-14</birthday><address><country>Belgium</country><state>Brussels</state><city>Brussels</city><zip>1000</zip><street>Nijverheidskaai</street><house_number>170</house_number></address><company_email>john.doe@company.com</company_email><company_id>2eed4528-bc6b-4760-8be9-6170cddc59ce</company_id><source>facturatie</source><user_role>speaker</user_role><invoice>BE00 0000 0000 0000</invoice><calendar_link>www.example.com</calendar_link></user>'));
  console.log("="*50, "\nUser message sent:", exchange, constants.USER_ROUTING, Buffer.from('<user><routing_key>user.facturatie</routing_key><crud_operation>create</crud_operation><id>dab9414f-5530-4ddc-920a-1fd74a31c415</id><first_name>John</first_name><last_name>Doe</last_name><email>john.doe@mail.com</email><telephone>+32467179912</telephone><birthday>2024-04-14</birthday><address><country>Belgium</country><state>Brussels</state><city>Brussels</city><zip>1000</zip><street>Nijverheidskaai</street><house_number>170</house_number></address><company_email>john.doe@company.com</company_email><company_id>2eed4528-bc6b-4760-8be9-6170cddc59ce</company_id><source>facturatie</source><user_role>speaker</user_role><invoice>BE00 0000 0000 0000</invoice><calendar_link>www.example.com</calendar_link></user>'), "\n="*50);
}

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
            const clientId = Number((await getClientIdByUuid(user.id)).facturatie);
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
            }
            console.log("Deleting client with id: " + clientId)
            await fossbilling.deleteClient(clientId);
            logger.log(
              "setupUserConsumer",
              `Deleted client with id: ${clientId}`,
              false,
            );
            await updateUuidToClientId(user.id, "NULL");
            channel.ack(msg);
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
    },
    {
      noAck: false,
    },
  );
}

module.exports = { setupUserConsumer, setupUserPublisher };
