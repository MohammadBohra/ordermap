const cds = require('@sap/cds');
const fetch = require('node-fetch'); // Node >=18 has fetch globally

module.exports = cds.service.impl(async function () {

    //const { Stores } = cds.entities('BigCommStoreService');
    // -------------------------
    // Authorization for Coupons
    // -------------------------
    this.before(['CREATE', 'UPDATE', 'DELETE'], 'Stores', (req) => {
        if (!req.user.is('BigCommStAdmin')) {
            req.reject(403, 'You are not authorized to modify stores data.');
        }
    });

    // -------------------------
    // Feature Control for Fiori
    // -------------------------
    this.on('READ', 'FeatureControl', async (req) => {
        const isAdmin = req.user.is('BigCommStAdmin');
        return [{ operationHidden: !isAdmin }];
    });

    

    
});
