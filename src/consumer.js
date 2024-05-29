const { setupUserConsumer } = require("./user");
const { setupOrderConsumer } = require("./order");
const { setupProductConsumer } = require("./product");
const constants = require("./constants");
const Logger = require("./logger");
const logger = Logger.getLogger();
const { XMLParser } = require("fast-xml-parser");
const parser = new XMLParser();

async function setupConsumer(connection) {
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
        "setupConsumer",
        `Received message: ${msg.content.toString()}`,
        false,
      );
      const object = parser.parse(msg.content.toString());
      if (object.user) {
        console.log("received user ", object.user)
        const user = object.user;
        await setupUserConsumer(user, channel, msg);
      } else if (object.order) {
        console.log("received order ", object.order)
        const order = object.order;
        await setupOrderConsumer(order, channel, msg);
      } else if (object.product) {
        console.log("received product ", object.product)
        const product = object.product;
        await setupProductConsumer(product, channel, msg);
      } else {
        logger.log("setupConsumer", "This object is not supported.", true);
        channel.nack(msg);
        return;
      }
    },
    {
      noAck: false,
    },
  );
}

module.exports = setupConsumer;