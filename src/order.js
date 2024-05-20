const amqp = require("amqplib");
const fs = require("fs");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");

const logger = require("./logger").getLogger();
const FossbillingAdmin = require("./fossbilling/admin");
const { getClientIdByUuid } = require("./masteruuid");
const constants = require("./constants");

const parser = new XMLParser();
const fossbilling = new FossbillingAdmin();

let invoicePublisherChannel;

async function setupInvoicePublisher(connection) {
  invoicePublisherChannel = await connection.createChannel();
  await invoicePublisherChannel.assertExchange(
    constants.MAIN_EXCHANGE,
    "topic",
    { durable: true },
  );
  logger.log(
    "setupInvoicePublisher",
    `Asserted exchange: ${constants.MAIN_EXCHANGE}`,
    false,
  );
}

async function setupOrderConsumer(connection) {
  const channel = await connection.createChannel();
  const queue = constants.SYSTEM;
  await channel.assertExchange(constants.MAIN_EXCHANGE, "topic", {
    durable: true,
  });
  logger.log(
    "setupOrderConsumer",
    `Asserted exchange: ${constants.MAIN_EXCHANGE}`,
    false,
  );
  await channel.assertQueue(queue, { durable: true });
  logger.log("setupOrderConsumer", `Asserted queue: ${queue}`, false);
  logger.log("setupOrderConsumer", `Start consuming messages: ${queue}`, false);
  channel.consume(
    queue,
    async function (msg) {
      logger.log(
        "setupOrderConsumer",
        `Received message: ${msg.content.toString()}`,
        false,
      );
      const object = parser.parse(msg.content.toString());
      switch (user.crud_operation) {
        case "create":
          try {
            const clientId = await getClientIdByUuid(object.order.user_id);
            const client = await fossbilling.getClient(clientId);
            const createdOrder = await fossbilling.createOrder(order, clientId);
            let pdfPath = ""; // TODO: Get the PDF path from the `fossbilling` API.
            let pdf = fs.readFileSync(pdfPath);
            let pdfBase64 = pdf.toString("base64");
            let invoice = {
              Invoice: {
                filename:
                  client.name + "_" + client.lastname + "_" + order.id + ".pdf",
                email: client.email,
                pdfBase64: pdfBase64,
              },
            };
            const xml = XMLBuilder.buildObject(invoice);
            invoicePublisherChannel.publish(
              constants.MAIN_EXCHANGE,
              constants.INVOICE_ROUTING,
              Buffer.from(xml),
            );
            channel.ack(msg);
          } catch (error) {
            logger.log(
              "setupOrderConsumer",
              `Nack message: ${msg.content.toString()}`,
              true,
            );
            channel.nack(msg);
          }
          break;
        case "update":
          logger.log(
            "setupOrderConsumer",
            `Unsupported operation: ${msg.content.toString()}`,
            true,
          );
          channel.nack(msg);
          return;
        case "delete":
          logger.log(
            "setupOrderConsumer",
            `Unsupported operation: ${msg.content.toString()}`,
            true,
          );
          channel.nack(msg);
          return;
      }
    },
    {
      noAck: false,
    },
  );
}

module.exports = { setupInvoicePublisher, setupOrderConsumer };
