// Import necessary modules
const xml2js = require('xml2js');
const axios = require('axios');

// Exportable function to create an invoice from XML data
function createInvoiceFromXml(xmlData, apiUrl, apiToken) {
    // Parse XML to JSON
    xml2js.parseString(xmlData, (err, result) => {
        if (err) {
            console.error("Error parsing XML:", err);
            return;
        }

        const order = result.order;
        const products = order.products[0].product.map((prod) => ({
            id: prod.id[0],
            name: prod.name[0],
            price: parseFloat(prod.price[0]),
            amount: parseInt(prod.amount[0]),
            total: parseFloat(prod.total[0]),
        }));

        const total_price = parseFloat(order.total_price[0]);

        // Construct the JSON object for FossBilling
        const invoiceData = {
            customer_id: order.user_id[0],
            company_id: order.company_id[0],
            products: products.map((product) => ({
                product_id: product.id,
                quantity: product.amount,
                price: product.price,
            })),
            total_price,
            status: order.status[0],
        };

        // Use Axios to send the invoice data to FossBilling
        axios.post(apiUrl, invoiceData, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
        })
        .then((response) => {
            console.log("Invoice created:", response.data);
        })
        .catch((error) => {
            console.error("Error creating invoice:", error);
        });
    });
}

module.exports = { createInvoiceFromXml }; // Export the function for external use
