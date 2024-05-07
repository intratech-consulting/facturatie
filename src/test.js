const xmlHandling = require('./xmlHandling');
const adminClass = require('./admin');
const fs = require('fs');
const path = require('path');
const logFilePath = path.join(__dirname, 'log.txt');


const xh = new xmlHandling();
const admin = new adminClass();

function logToFile(data, filename = logFilePath) {
    const message = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
    fs.appendFile(filename, message + '\n', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('Logged to file:', filename);
    });
}
let userData = 
    `<user>
        <user_id>1</user_id>
        <first_name>John</first_name>
        <last_name>Doe</last_name>
        <email>john.doe@mail.com</email>
        <telephone>+32467179912</telephone>
        <birthday>2024-04-14</birthday>
        <address>
                <country>BE</country>
                <state>Brussels</state>
                <city>Brussels</city>
                <zip>1000</zip>
                <street>Nijverheidskaai</street>
                <house_number>170</house_number>
        </address>
        <company_email>john.doe@company.com</company_email>
        <company_id>1</company_id>
        <source></source>
        <user_role></user_role>
        <invoice></invoice>
    </user>`;

let orderData = 
    `<order>
        <id>1</id>
        <user_id>46</user_id>
        <company_id>1</company_id>
        <products>
            <product>
                <id>3</id>
                <name>Coca Cola</name>
                <price>2.50</price>
                <amount>3</amount>
                <category>Soft drinks</category>
                <total>7.5</total> <!-- hoeveelheid x prijs-->
                <totalExBtw>6.19</totalExBtw>
                <btw></btw>
            </product>
        </products>
        <total_price>260.00</total_price>
        <status>paid</status>
    </order>`;

async function test_xmlToJson(userData) {
    json = await xh.xmlToJson(userData);
    console.log(json);
    return json;
};

let xml;

// functie om json naar xml te hervormen
async function test_jsonToXml(userData) {
    json = await test_xmlToJson(userData);
    xml = await xh.jsonToXml(json);
    console.log(xml);
    return xml;
};

// functie om te kijken of een klant aangemaakt kan worden.
async function test_createClient(userData) {
    try {
        const jsonUserData = await test_xmlToJson(userData);
        console.log(jsonUserData.user);
        // Correct the URL if it's being constructed dynamically here
        console.log(jsonUserData.user.first_name[0])
        console.log(jsonUserData.user.email[0])
        console.log(jsonUserData.user.address)
        const response = await admin.createClient(jsonUserData.user);
        logToFile(JSON.stringify(response, null, 2));
        console.log("client created", response);
        return response
    } catch (error) {
        console.error("Error in test_createClient:", error);
        // Log detailed error information to the file
        const errorMessage = `Error creating client: ${error.message}\nURL: ${error.config?.url}\nStatus: ${error.response?.status}\nData: ${error.config?.data}`;
        logToFile(errorMessage);
    }
}

async function test_deleteClient(clientID) {
    try {
        const response = await admin.deleteClient(clientID);
        logToFile(JSON.stringify(response, null, 2));
        console.log("client deleted", response);
    } catch (error) {
        console.error("Error in test_deleteClient:", error);
        // Log detailed error information to the file
        const errorMessage = `Error deleting client: ${error.message}\nURL: ${error.config?.url}\nStatus: ${error.response?.status}\nData: ${error.config?.data}`;
        logToFile(errorMessage);
    }
}

async function test_createOrder(orderData, clientID = orderData.user_id) {

    const jsonOrderData = await test_xmlToJson(orderData);

    try {
        const response = await admin.createOrder(jsonOrderData.order, clientID);
        logToFile(JSON.stringify(response, null, 2));
        console.log("order created", response);
    } catch (error) {
        console.error("Error in test_createOrder:", error);
        // Log detailed error information to the file
        const errorMessage = `Error creating order: ${error.message}\nURL: ${error.config?.url}\nStatus: ${error.response?.status}\nData: ${error.config?.data}`;
        logToFile(errorMessage);
    }
}

// functie om de testen uit te voeren
async function runTests() {
    // await test_xmlToJson();
    // await test_jsonToXml();
    clientID = await test_createClient(userData);
    await new Promise((resolve) => {
        process.stdin.once('data', () => {
            resolve();
        });
    });
    orderID = await test_createOrder(orderData, clientID);
    await new Promise((resolve) => {
        process.stdin.once('data', () => {
            resolve();
        });
    });
    await test_deleteClient(clientID);
};

runTests().then(() => process.exit());