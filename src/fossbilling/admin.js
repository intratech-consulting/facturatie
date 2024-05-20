const axios = require("axios");
const BoxBillingService = require("./bbService");
const Encryption = require("./encryption");
require("dotenv").config();

class admin {
    constructor() {
        this.bbService = new BoxBillingService({
            api_role: 'admin',
            api_token: process.env.API_KEY,
            api_url: process.env.API_URL,
        });
        this.enc = new Encryption();
    }

    async createClient(userData) {
        // Check if required parameters are provided
        if (!userData.email || !userData.first_name) {
            throw new Error('email and first_name are required');
        }
        console.log(userData.telephone);

        const address = userData.address || {};
        const password = "test@mail.com";

        const clientData = {
            email: userData.email || "test@mail.com",
            first_name: userData.first_name || "Test",
            last_name: userData.last_name || "",
            status: "active",
            company: userData.company_id || "",
            address_1: `${address.street} ${address.house_number}` || "",
            address_2: "",
            city: address.city || "",
            state: address.state || "",
            country: address.country || "",
            postcode: address.zip || "",
            phone_cc: userData.telephone.toString().substring(0, 3) || "",
            phone: userData.telephone.toString().substring(3) || "",
            currency: "",
            password: `${await this.enc.encryptString(password)}Pass1234`
        };

        console.log(clientData)

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

    async updateClient(updateData, clientId = updateData.id) {

        // Check if required parameters are provided
        if (!clientId) {
            throw new Error('client_id is required');
        }

        const {
            email,
            first_name,
            last_name,
            company_id,
            telephone,
            address: {
                street,
                house_number,
                city,
                state,
                country,
                zip
            } = {}
        } = updateData;

        const clientData = {
            id: clientId,
            ...(email && email[0] && { email: email }),
            ...(first_name && first_name[0] && { first_name: first_name }),
            ...(last_name && last_name[0] && { last_name: last_name }),
            ...(company_id && company_id[0] && { company: company_id }),
            ...(telephone && telephone[0] && {
                phone_cc: telephone.toString().substring(0, 3),
                phone: telephone.toString().substring(3)
            }),
            ...(street && house_number && street[0] && house_number[0] && { address_1: `${street} ${house_number}` }),
            ...(city && city[0] && { city: city }),
            ...(state && state[0] && { state: state}),
            ...(country && country[0] && { country: country }),
            ...(zip && zip[0] && { postcode: zip })
        };

        try {
            const response = await this.bbService.callMethod('client_update', [clientData]);
            return response;
        } catch (error) {
            console.error(`Error updating client: ${error}`);
            throw error;
        }
    };

    async createOrder(orderData, clientID = orderData.user_id) {

        // Check if required parameters are provided
        if (!orderData.user_id || !orderData.products[0].product[0].product_id[0]) {
            throw new Error('client_id and product_id are required');
        }

        // Prepare the data for the API call
        const data = {
            client_id: clientID,
            product_id: orderData.products[0].product[0].product_id[0],
            config: orderData.config || {},
            quantity: orderData.products[0].product[0].amount[0] || 1,
            price: orderData.total_price[0],
            company: orderData.company_id || "",
            currency: orderData.currency || "EUR" || "",
            title: orderData.products[0].product[0].name[0] || "Cola",
            activate: orderData.activate,
            invoice_option: orderData.invoice_option || "no-invoice",
            created_at: orderData.created_at,
            updated_at: orderData.updated_at
        };

        try {
            const response = await this.bbService.callMethod('order_create', [data]);
            return response;
        } catch (error) {
            console.error(`Error creating order: ${error}`);
            throw error;
        }
    }

    async getClient(clientId) {
        try {
            const response = await this.bbService.callMethod('client_get', [{ id: clientId }]);
            return response;
        } catch (error) {
            console.error(`Error getting client: ${error}`);
            throw error;
        }
    }

    async getCartList() {
        try {
            const response = await this.bbService.callMethod('cart_get_list', []);
            return response;
        } catch (error) {
            console.error(`Error getting cart: ${error}`);
            throw error;
        }
    }

    async batchExpire() {
        try {
            const response = await this.bbService.callMethod('cart_batch_expire', []);
            return response;
        } catch (error) {
            console.error(`Error expiring batch: ${error}`);
            throw error;
        }
    }

    async userExists(clientId) {
        try {
            await this.getClient(clientId);
            return true;
        } catch (error) {
            if (error.message.includes('Client not found')) {
                return false;
            }
            throw error;
        }
    }
}

module.exports = admin;