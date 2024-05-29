const axios = require("axios");

require("dotenv").config();

const serviceName = "facturatie";
const port = 6000;
const rabbitmqUrl = process.env.RABBITMQ_URL;
const hostname = rabbitmqUrl.split("//")[1].split(":")[0];
const address = `http://${hostname}:${port}`;

/*
POST /addServiceId
{
  "MasterUuid": "<uuid>",
  "ServiceId": "<service_id>",
  "Service": "<service_name>"
}
RESPONSE
{
  "success": true,
  "message": "Service ID successfully added."
}
*/
async function linkUuidToClientId(uuid, clientId) {
  let data = {
    MasterUuid: uuid,
    ServiceId: clientId,
    Service: serviceName,
  };
  let request = {
    method: "POST",
    url: address + "/addServiceId",
    headers: {
      "Content-Type": "application/json",
    },
    data,
  };
  console.log(request);
  let response = await axios(request);
  let json = await response.data;
  return json;
}

/*
POST /UpdateServiceId
{
  "MASTERUUID": "<uuid>",
  "ServiceId": "<service_id>",
  "Service": "<service_name>"
}
RESPONSE
{
    "success": true,
    "message": "Service ID successfully updated."
}
*/
async function updateUuidToClientId(uuid, clientId) {
  let data = {
    MASTERUUID: uuid,
    NewServiceId: clientId,
    Service: serviceName,
  };
  console.log(data);
  let request = {
    method: "POST",
    url: address + "/updateServiceId",
    headers: {
      "Content-Type": "application/json",
    },
    data,
  };
  let response = await axios(request);
  let json = await response.data;
  return json;
}

/*
POST /getServiceId
{
  "MASTERUUID": "<uuid>",
  "Service": "<service_name>"
}
RESPONSE
{
  "<service_name>": "<service_id>"
}
*/
async function getClientIdByUuid(uuid) {
  let data = {
    MASTERUUID: uuid,
    Service: serviceName,
  };
  let request = {
    method: "POST",
    url: address + "/getServiceId",
    headers: {
      "Content-Type": "application/json",
    },
    data,
  };
  let response = await axios(request);
  let json = await response.data;
  return json;
}

/*
POST /getMasterUuid
{
  "ServiceId": "<service_id>",
  "Service": "<service_name>"
}
RESPONSE
{
  "UUID": "<uuid>"
}
*/
async function getUuidByClientId(clientId) {
  let data = {
    ServiceId: clientId,
    Service: serviceName,
  };
  let request = {
    method: "POST",
    url: address + "/getMasterUuid",
    headers: {
      "Content-Type": "application/json",
    },
    data,
  };
  let response = await axios(request);
  let json = await response.data;
  return json;
}

/*
POST /addProductUuid
{
  "MasterUuid": "<uuid>",
  "ProductId": "<product_id>",
  "Service": "<service_name>"
}
RESPONSE
{
  "success": true,
  "message": "Product UUID successfully added."
}
*/
async function linkUuidToProductId(uuid, productId) {
  let data = {
    MasterUuid: uuid,
    ServiceId: productId,
    Service: serviceName,
  };
  let request = {
    method: "POST",
    url: address + "/addServiceId",
    headers: {
      "Content-Type": "application/json",
    },
    data,
  };
  let response = await axios(request);
  let json = await response.data;
  return json;
}

/*
POST /updateProductUuid
{
  "MasterUuid": "<uuid>",
  "ProductId": "<product_id>",
  "Service": "<service_name>"
}
RESPONSE
{
    "success": true,
    "message": "Product UUID successfully updated."
}
*/
async function updateUuidToProductId(uuid, productId) {
  let data = {
    MasterUuid: uuid,
    NewServiceId: productId,
    Service: serviceName,
  };
  let request = {
    method: "POST",
    url: address + "/updateServiceId",
    headers: {
      "Content-Type": "application/json",
    },
    data,
  };
  let response = await axios(request);
  let json = await response.data;
  return json;
}

/*
POST /getProductId
{
  "MasterUuid": "<uuid>",
  "Service": "<service_name>"
}
RESPONSE
{
  "<service_name>": "<product_id>"
}
*/
async function getProductIdByUuid(uuid) {
  let data = {
    MasterUuid: uuid,
    Service: serviceName,
  };
  let request = {
    method: "POST",
    url: address + "/getServiceId",
    headers: {
      "Content-Type": "application/json",
    },
    data,
  };
  let response = await axios(request);
  let json = await response.data;
  return json;
}

/*
POST /getMasterUuidByProduct
{
  "ProductId": "<product_id>",
  "Service": "<service_name>"
}
RESPONSE
{
  "UUID": "<uuid>"
}
*/
async function getUuidByProductId(productId) {
  let data = {
    ServiceId: productId,
    Service: serviceName,
  };
  let request = {
    method: "POST",
    url: address + "/getMasterUuid",
    headers: {
      "Content-Type": "application/json",
    },
    data,
  };
  let response = await axios(request);
  let json = await response.data;
  return json;
}



module.exports = { linkUuidToClientId, getClientIdByUuid, getUuidByClientId, updateUuidToClientId, linkUuidToProductId, getProductIdByUuid, getUuidByProductId, updateUuidToProductId };
