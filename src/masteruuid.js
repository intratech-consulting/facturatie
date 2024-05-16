const axios = require("axios");

const serviceName = "facturatie";
const port = 6000;
const hostname = "10.2.160.53";
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

module.exports = { linkUuidToClientId, getClientIdByUuid, getUuidByClientId };
