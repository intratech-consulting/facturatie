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
        // userData is a JSON object, containing user data like in draft.xml

        // Using only the required fields for now
        const clientData = {
            email: "test@email.com",
            first_name: "test",
            last_name: "testing",
            status: `active`,
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
            password: `Test1234`,
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
        // Send a DELETE request to the Fossbilling API to delete a client
        // http://10.2.160.51:876/admin/client/delete/
        // uses client_id as parameter

        try {
            const response = await axios.delete(
                `${this.apiUrl}/client/delete/${clientId}`,
                {
                    headers: {
                        "API-Key": this.key,
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
