const amqp = require("amqplib");
const fs = require("fs");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");

const logger = require("./logger").getLogger();
const FossbillingAdmin = require("./fossbilling/admin");
const { getClientIdByUuid } = require("./masteruuid");
const constants = require("./constants");
const e = require("express");

const parser = new XMLParser();
const builder = new XMLBuilder();
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

async function setupOrderConsumer(order, channel, msg, connection) {

  await setupInvoicePublisher(connection);

  switch (order.crud_operation) {
    case "create":
      try {
        if (!order.user_id === '') {
          const clientId = (await getClientIdByUuid(order.user_id)).facturatie;
        } else { 
          return;
        };
        const client = await fossbilling.getClient('', clientId);
        const productId = await getClientIdByUuid(order.products.product.product_id);
        order.products.product.product_id = productId.facturatie;
        console.log(order)
        const invoicePDFBase64 = await fossbilling.finishOrder(order, clientId);
        console.log('order created, invoice retrieved')
        let invoice = {
            filename:
              client.first_name + "_" + client.last_name + "_" + order.id + ".pdf",
            email: client.email,
            pdfBase64: invoicePDFBase64,
        };
        
        const xml = builder.build({ invoice });
        console.log('publishing invoice')
        invoicePublisherChannel.publish(
          constants.MAIN_EXCHANGE,
          constants.INVOICE_ROUTING,
          Buffer.from(xml),
        );
        console.log('invoice published')
        channel.ack(msg);
      } catch (error) {
        console.log(error);
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
