const amqp = require("amqplib");
const constants = require("./constants");
const logger = require("./logger").getLogger();

async function setupUserConsumer(connection) {
  const channel = await connection.createChannel();
  const exchange = "amq.topic";
  const queue = constants.SYSTEM;
  const routing_key = "user." + constants.SYSTEM;
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
      new_msg = xmlbuilder
        .create({
          user,
        })
        .end({ pretty: true });
      logger.info(`Publishing message: ${new_msg}`);
      channel.publish(exchange, routing_key, Buffer.from(new_msg));
    },
    {
      noAck: false,
    },
  );
}

module.exports = setupUserConsumer;
