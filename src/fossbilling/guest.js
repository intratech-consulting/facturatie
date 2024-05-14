const axios = require("axios");
const BoxBillingService = require("./bbService");
const Encryption = require("./encryption");
require("dotenv").config();

class guest {

    constructor() {
        this.bbService = new BoxBillingService({
            api_role: 'guest',
            api_url: process.env.API_URL,
        });
        this.enc = new Encryption();
    };

    async clientLogin(clientData) {

        // Check if required parameters are provided
        if (!clientData.email){
            throw new Error('email is required');
        }

        const password = clientData.email || "test@mail.com";

        const loginData = {
            email: clientData.email,
            password: `${await this.enc.encryptString(password)}Pass1234`
        };

        try {
            const response = await this.bbService.callMethod('client_login', [loginData]);
            return response;
        } catch (error) {
            console.error(`Error logging in client: ${error}`);
            throw error;
        };
    };
}

module.exports = guest;
