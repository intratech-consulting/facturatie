const xmlHandling = require('./xmlHandling');
const adminClass = require('./admin');
const guestClass = require('./guest');

const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
const fs = require('fs');
const path = require('path');
const logFilePath = path.join(__dirname, 'log.txt');


const xh = new xmlHandling();
const admin = new adminClass();
const guest = new guestClass();
const parser = new XMLParser();

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
        <routing_key>user.crm</routing_key>
        <crud_operation>create</crud_operation>
        <id>f60ac425-30c9-4864-a014-0af2cf91322c</id>
        <first_name>John</first_name>
        <last_name>Doe</last_name>
        <email>sisi.achternaam@voorbeeld.be</email>
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
        <company_id>a03Qy000004cOQUIA2</company_id>
        <source></source>
        <user_role>speaker</user_role>
        <invoice>BE00 0000 0000 0000</invoice>
        <calendar_link>www.example.com</calendar_link>
    </user>`;

let orderData = 
    `<order>
        <routing_key>order.crm</routing_key>
        <crud_operation>create</crud_operation>
        <id>123</id>
        <user_id>0123</user_id>
        <company_id>3210</company_id>
        <products>
            <product>
                <product_id>3</product_id>
                <name>Coca Cola</name>
                <amount>5</amount>
            </product>
            <product>
                <product_id>4</product_id>
                <name>Fanta</name>
                <amount>7</amount>
            </product>
        </products>
        <total_price>260.00</total_price>
        <status>paid</status>
    </order>`;


let updateData = 
    `<user>
        <routing_key>user.crm</routing_key>
        <crud_operation>update</crud_operation>
        <id>1238740192847</id>
        <first_name>Jane</first_name>
        <last_name></last_name>
        <email>jane.doe@mail.com</email>
        <telephone></telephone>
        <birthday></birthday>
        <address>
            <country>FR</country>
            <state>Paris</state>
            <city>Paris</city>
            <zip></zip>
            <street></street>
            <house_number></house_number>
        </address>
        <company_email>john.doe@company.com</company_email>
        <company_id>a03Qy000004cOQUIA2</company_id>
        <source>salesforce</source>
        <user_role>speaker</user_role>
        <invoice>BE00 0000 0000 0000</invoice>
        <calendar_link>www.example.com</calendar_link>
    </user>`;
    
async function test_xmlToJson(userData) {
    json = parser.parse(userData.toString());
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

async function test_updateClient(updateData, clientID = updateData.id) {
    
    const jsonUserData = await test_xmlToJson(updateData);

    try {
        const response = await admin.updateClient(jsonUserData.user, clientID);
        logToFile(JSON.stringify(response, null, 2));
        console.log("client updated", response);
    } catch (error) {
        console.error("Error in test_updateClient:", error);
        // Log detailed error information to the file
        const errorMessage = `Error updating client: ${error.message}\nURL: ${error.config?.url}\nStatus: ${error.response?.status}\nData: ${error.config?.data}`;
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
        console.log(jsonOrderData.products)
        // Log detailed error information to the file
        const errorMessage = `Error creating order: ${error.message}\nURL: ${error.config?.url}\nStatus: ${error.response?.status}\nData: ${error.config?.data}`;
        logToFile(errorMessage);
    }
}

async function test_getClient(email) {
    try {
        const response = await admin.getClient( email);
        logToFile(JSON.stringify(response, null, 2));
        console.log("client retrieved", response);
        return response; // Make sure to return the response
    } catch (error) {
        console.error("Error in test_getClient:", error);
        // Log detailed error information to the file
        const errorMessage = `Error retrieving client: ${error.message}\nURL: ${error.config?.url}\nStatus: ${error.response?.status}\nData: ${error.config?.data}`;
        logToFile(errorMessage);
    }
}

async function test_loginClient(clientData) {
    try {
        if (!clientData) {
            throw new Error("clientData is undefined");
        }
        
        const response = await guest.clientLogin(clientData);
        logToFile(JSON.stringify(response, null, 2));
        console.log("client logged in", response);
    } catch (error) {
        console.error("Error in test_loginClient:", error);
        // Log detailed error information to the file
        const errorMessage = `Error logging in client: ${error.message}\nURL: ${error.config?.url}\nStatus: ${error.response?.status}\nData: ${error.config?.data}`;
        logToFile(errorMessage);
    }
}

async function test_handleOrder(orderData) {

    orderData = await test_xmlToJson(orderData);

    try {
        const response = await guest.handleOrder(orderData);
        logToFile(JSON.stringify(response, null, 2));
        console.log("order handled", response);
    } catch (error) {
        console.error("Error in test_handleOrder:", error);
        // Log detailed error information to the file
        const errorMessage = `Error handling order: ${error.message}\nURL: ${error.config?.url}\nStatus: ${error.response?.status}\nData: ${error.config?.data}`;
        logToFile(errorMessage);
    }
}

async function test_getCart() {
    try {
        const response = await guest.getCart();
        logToFile(JSON.stringify(response, null, 2));
        console.log("cart retrieved", response);
    } catch (error) {
        console.error("Error in test_getCart:", error);
        // Log detailed error information to the file
        const errorMessage = `Error retrieving cart: ${error.message}\nURL: ${error.config?.url}\nStatus: ${error.response?.status}\nData: ${error.config?.data}`;
        logToFile(errorMessage);
    }
}

async function test_getCartList() {
    try {
        const response = await admin.getCartList();
        logToFile(JSON.stringify(response, null, 2));
        console.log("cart list retrieved"/*, response*/);
    } catch (error) {
        console.error("Error in test_getCartList:", error);
        // Log detailed error information to the file
        const errorMessage = `Error retrieving cart list: ${error.message}\nURL: ${error.config?.url}\nStatus: ${error.response?.status}\nData: ${error.config?.data}`;
        logToFile(errorMessage);
    }
}

async function test_batchExpire() { 
    try {
        const response = await admin.batchExpire();
        logToFile(JSON.stringify(response, null, 2));
        console.log("batch expired", response);
    } catch (error) {
        console.error("Error in test_batchExpire:", error);
        // Log detailed error information to the file
        const errorMessage = `Error expiring batch: ${error.message}\nURL: ${error.config?.url}\nStatus: ${error.response?.status}\nData: ${error.config?.data}`;
        logToFile(errorMessage);
    }
}

async function test_getInvoice(invoiceId) {
    try {
        const response = await admin.getInvoice(invoiceId);
        logToFile(JSON.stringify(response, null, 2));
        console.log("invoice retrieved", response);
    } catch (error) {
        console.error("Error in test_getInvoice:", error);
        // Log detailed error information to the file
        const errorMessage = `Error retrieving invoice: ${error.message}\nURL: ${error.config?.url}\nStatus: ${error.response?.status}\nData: ${error.config?.data}`;
        logToFile(errorMessage);
    }
}

async function test_viewInvoice(invoiceHash) {
    try {
        const response = await admin.viewInvoice(invoiceHash);
        logToFile(JSON.stringify(response, null, 2));
        console.log("invoice viewed", response);
    } catch (error) {
        console.error("Error in test_viewInvoice:", error);
        // Log detailed error information to the file
        const errorMessage = `Error viewing invoice: ${error.message}\nURL: ${error.config?.url}\nStatus: ${error.response?.status}\nData: ${error.config?.data}`;
        logToFile(errorMessage);
    }
}

// functie om de testen uit te voeren
async function runTests() {
    // await test_xmlToJson(userData);
    // await test_jsonToXml();
    // clientID = await test_createClient(userData);
    // await new Promise((resolve) => {
    //     process.stdin.once('data', () => {
    //         resolve();
    //     });
    // });
    // await test_getClient('fanta@redbull.be');
    // await new Promise((resolve) => {
    //     process.stdin.once('data', () => {
    //         resolve();
    //     });
    // });
    // await test_createOrder(orderData, clientID);
    // await new Promise((resolve) => {
    //     process.stdin.once('data', () => {
    //         resolve();
    //     });
    // });
    // clientData = await test_getClient(clientID);
    // await new Promise((resolve) => {
    //     process.stdin.once('data', () => {
    //         resolve();
    //     });
    // });
    // await test_loginClient(clientData);
    // await new Promise((resolve) => {
    //     process.stdin.once('data', () => {
    //         resolve();
    //     });
    // });
    // await test_handleOrder(orderData);
    // await new Promise((resolve) => {
    //     process.stdin.once('data', () => {
    //         resolve();
    //     });
    // });
    // await test_getCart();await new Promise((resolve) => {
    //     process.stdin.once('data', () => {
    //         resolve();
    //     });
    // });
    // await test_getCartList();
    // await new Promise((resolve) => {
    //     process.stdin.once('data', () => {
    //         resolve();
    //     });
    // });
    await test_getInvoice('2');
    // const invoiceHash = 'eba00351b326bb22ebee817ab67deec237abc135476a4d06451a7e8c57485c10c0b019b2f1477d6bb720e63ec0130fa71fd97124ff40fd3209ffb705844602c536886464214eb8e9f74c0bc86175c8b1a127cd01216a001b0001d05fd1793b985e1f5ccda02ab85f460b1497e7e03b';
    // await test_viewInvoice(invoiceHash);
    // await test_updateClient(updateData, clientID);
    // await new Promise((resolve) => {
    //     process.stdin.once('data', () => {
    //         resolve();
    //     });
    // });
    // await test_batchExpire();
    // await new Promise((resolve) => {
    //     process.stdin.once('data', () => {
    //         resolve();
    //     });
    // });
    // await test_deleteClient(clientID);
    console.log("Tests completed");
};

runTests().then(() => process.exit());