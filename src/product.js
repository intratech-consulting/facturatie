const amqp = require("amqplib");
const bodyParser = require('body-parser');
const express = require('express');
const { XMLParser } = require("fast-xml-parser");
const Logger = require("./logger");
const logger = Logger.getLogger();
const FossbillingAdmin = require("./fossbilling/admin");
const { getProductIdByUuid, linkUuidToProductId, updateUuidToProductId } = require("./masteruuid");
const constants = require("./constants");

const parser = new XMLParser();
const fossbilling = new FossbillingAdmin();

async function setupProductConsumer(product, channel, msg) {
  switch (product.crud_operation) {
    case "create":
      try {
        const productId = await fossbilling.createProduct(product);
        logger.log(
          "setupProductConsumer",
          `Created product with ID: ${productId}`,
          false,
        );
        await linkUuidToProductId(product.id, productId);
        logger.log(
          "setupProductConsumer",
          `Linked UUID to product with ID: ${productId}`,
          false,
        );
        channel.ack(msg);
      } catch (error) {
        logger.log(
          "setupProductConsumer",
          `Error during product creation- Product UUID ${product.id}:`,
          true,
        );
        channel.ack(msg);
      }
      break;
    case "update":
      try {
        const productId = Number((await getProductIdByUuid(product.id)).facturatie);
        logger.log(
          "setupProductConsumer",
          `Updating product with ID: ${productId}`,
          false,
        );
        await fossbilling.updateProduct(product, productId);
        logger.log(
          "setupProductConsumer",
          `Updated product with ID: ${productId}`,
          false,
        );
        channel.ack(msg);
      } catch (error) {
        logger.log(
          "setupProductConsumer",
          `Error during product update - Product UUID ${product.id}.`,
          true,
        );
        channel.ack(msg);
      }
      break;
    case "delete":
      try {
        const productId = Number((await getProductIdByUuid(product.id)).facturatie);
        logger.log(
          "setupProductConsumer",
          `Deleting product with ID: ${productId}`,
          false,
        );
        await fossbilling.deleteProduct(productId);
        logger.log(
          "setupProductConsumer",
          `Deleted product with ID: ${productId}`,
          false,
        );
        await updateUuidToProductId(product.id, "NULL");
        channel.ack(msg);
      } catch (error) {
        logger.log(
          "setupProductConsumer",
          `Error during product deletion - Product UUID: ${product.id}.`,
          true,
        );
        channel.ack(msg);
      }
      break;
    default:
      logger.log(
        "setupProductConsumer",
        `Unknown operation: ${product.crud_operation}`,
        true,
      );
      channel.ack(msg);
  }
}

module.exports = { setupProductConsumer };
