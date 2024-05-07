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
        const clientData = {
            email: userData.email[0],
            first_name: "test",
            last_name: "",
            status: "active",
            group_id: "",
            company: "",
            address_1: "",
            address_2: "",
            city: "",
            state: "",
            country: "",
            postcode: "",
            phone_cc: "",
            phone: "",
            currency: "",
            password: "Test1234",
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
            const response = await axios.delete(
                `${this.bbService.apiUrl}/client/delete/${clientId}`,
                {
                    headers: {
                        "API-Key": this.bbService.apiToken,
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error(`Error deleting client: ${error}`);
            throw error;
        }
    }
}

module.exports = admin;