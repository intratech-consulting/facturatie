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


async function test_xmlToJson() {
    
    userData = 
    `<user>
        <user_id>1</user_id>
        <first_name>John</first_name>
        <last_name>Doe</last_name>
        <email>john.doe@mail.com</email>
        <telephone>+32467179912</telephone>
        <birthday>2024-04-14</birthday>
        <address>
                <country>Belgium</country>
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

    json = await xh.xmlToJson(userData);
    console.log(json);
    return json;
};

let xml;

// functie om json naar xml te hervormen
async function test_jsonToXml() {
    json = await test_xmlToJson();
    xml = await xh.jsonToXml(json);
    console.log(xml);
    return xml;
};

// functie om te kijken of een klant aangemaakt kan worden.
async function test_createClient() {
    try {
        const jsonUserData = await test_xmlToJson();
        console.log(jsonUserData.user);
        // Correct the URL if it's being constructed dynamically here
        console.log(jsonUserData.user.first_name[0])
        console.log(jsonUserData.user.email[0])
        const response = await admin.createClient(jsonUserData.user);
        const responseData = await response.json();
        logToFile(JSON.stringify(responseData, null, 2));
    } catch (error) {
        console.error("Error in test_createClient:", error);
        // Log detailed error information to the file
        const errorMessage = `Error creating client: ${error.message}\nURL: ${error.config?.url}\nStatus: ${error.response?.status}\nData: ${error.config?.data}`;
        logToFile(errorMessage);
    }
}

// functie om de testen uit te voeren
async function runTests() {
    // await test_xmlToJson();
    // await test_jsonToXml();
    await test_createClient();
    // await test_deleteClient();
};

runTests().then(() => process.exit());