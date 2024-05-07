const axios = require("axios");
const BoxBillingService = require("./bbService");
require("dotenv").config();

class admin {
    constructor() {
        this.bbService = new BoxBillingService({
            api_role: 'admin',
            api_token: process.env.API_KEY,
            api_url: process.env.API_URL_ADMIN,
        });
    }

    async createClient(userData) {
        const address = userData.address && userData.address[0] || {};

        const clientData = {
            email: userData.email && userData.email[0] || "test@mail.com",
            first_name: userData.first_name && userData.first_name[0] || "Test",
            last_name: userData.last_name && userData.last_name[0] || "",
            status: "active",
            group_id: userData.group_id && userData.group_id[0] || "",
            company: userData.company && userData.company[0] || "",
            address_1: address.street && address.street[0] && address.house_number && address.house_number[0] || "",
            address_2: "",
            city: address.city && address.city[0] || "",
            state: address.state && address.state[0] || "",
            country: address.country && address.country[0] || "",
            postcode: address.zip && address.zip[0] || "",
            phone_cc: userData.telephone && userData.telephone[0] && userData.telephone[0].substring(0, 3) || "",
            phone: userData.telephone && userData.telephone[0] && userData.telephone[0].substring(3) || "",
            currency: "",
            password: userData.first_name && userData.first_name[0] && userData.last_name && userData.last_name[0] && `${userData.first_name[0]}${userData.last_name[0]}Pass1234` || "Test1234"
        };
    
        try {
            const response = await this.bbService.callMethod('client_create', [clientData]);
            return response;
        } catch (error) {
            console.error(`Error creating client: ${error}`);
            throw error;
        }
    };

    async deleteClient(clientId) {
        try {
            const response = await this.bbService.callMethod('client_delete', [{ id: clientId }]);
            return response;
        } catch (error) {
            console.error(`Error deleting client: ${error}`);
            throw error;
        }
    }
}

module.exports = admin;