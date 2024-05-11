const axios = require("axios");
const BoxBillingService = require("./bbService");
require("dotenv").config();

class admin {

    constructor() {
        this.bbService = new BoxBillingService({
            api_role: 'client',
            api_token: process.env.API_KEY,
            api_url: process.env.API_URL,
        });
    };
    
}