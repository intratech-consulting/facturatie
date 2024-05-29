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

async function setupOrderConsumer(order, channel, msg) {
  switch (order.crud_operation) {
    case "create":
      try {
        const clientId = (await getClientIdByUuid(order.user_id)).facturatie;
        const client = await fossbilling.getClient('', clientId);
        console.log('Client: ', client)
        const productId = await getClientIdByUuid(order.products[0].product_id);
        order.products[0].product_id = productId;
        const invoicePDFBase64 = await fossbilling.createOrder(order, clientId);
        let invoice = {
          Invoice: {
            filename:
              client.name + "_" + client.lastname + "_" + order.id + ".pdf",
            email: client.email,
            pdfBase64: invoicePDFBase64,
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
}

module.exports = { setupInvoicePublisher, setupOrderConsumer };
