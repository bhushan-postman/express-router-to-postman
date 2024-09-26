const logger = require('pino')()
const log = logger.child({ file: 'collection.js' })
const axios = require('axios');
const storage = require('node-persist');
const constants = require("../constants.js");
const POSTMAN_API_ENDPOINT = constants.POSTMAN_API_ENDPOINT;
const POSTMAN_API_KEY = constants.POSTMAN_API_KEY;
const requestService = require("./request.js");

/**
 * This function checks if a collection already exists, if not, it creates a new collection.
 * We are persisting the collectionId using node-persist
 */
module.exports = {
    /**
     * Creates a collection and requests
     * @param {*} name - collection name
     * @param {*} workspaceId - workspaceId
     * @param {*} requests - requests to create
     */
    saveCollection: async function (name, workspaceId, requests) {        
        try {
            await storage.init({});
            let collectionId = await storage.getItem('collectionId');              
            if(collectionId) {
                log.info("Collection has already been saved. Trying to retrieve collection with ID " + collectionId);  
                const collection = await this.getCollection(collectionId);   
                const existingRequestsWithIds = [];
                const existingRequests = [];                 
                collection.item.forEach(e => {                                                         
                    var url = e.request.url.raw;              
                    var method = e.request.method;                    
                    var request = {name: 'Request to ' + method + ' ' + url, request: {method: method, url: url}};
                    existingRequests.push(request);
                    existingRequestsWithIds.push({id: e.id, request: request});
                });             
                // Add any new routes defined since the previous sync with Postman                                   
                requests.forEach(e => {                    
                    // Check if the request does not exist in the existingRequests. Create if true
                    if(!JSON.stringify(existingRequests).includes(JSON.stringify(e))){                                                         
                        requestService.addRequestToCollection(collectionId, e.name, e.request.url, e.request.method);                        
                    }
                });
                
                // Check if any requests have been removed. If yes, delete the request
                existingRequestsWithIds.forEach(e => {
                    // Delete
                    if(!JSON.stringify(requests).includes(JSON.stringify(e.request))) {
                        requestService.deleteRequestFromCollection(collectionId, e.id);
                    }                    
                });
            }   
            else {
                try {
                    var response = await axios.post(POSTMAN_API_ENDPOINT + 'collections?workspace=' + workspaceId, 
                        {                                 
                                "collection": {
                                    "info": {
                                        "name": name,
                                        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"                                            
                                    },
                                    "item": requests
                                }                                
                        }, 
                        {headers: {'X-Api-Key':POSTMAN_API_KEY}}
                    );
                    await storage.setItem('collectionId', response.data.collection.id);
                    log.info("Collection saved successfully.");
                }
                catch (error) {
                    log.error(error);
                }                
            }                    
        }
        catch (error) {
            log.error(error);
        };        
    },
    /**
     * Get a specific collection from Postman
     * @param {*} collectionId 
     * @returns 
     */
    getCollection: async function (collectionId) {
        try {
            var response = await axios.get(POSTMAN_API_ENDPOINT + "collections/" + collectionId, {
                headers: {'X-Api-Key':POSTMAN_API_KEY, 'accept': 'application/vnd.api.v10+json'}
            });
            log.info("Collection " + response.data.collection.info.name + " retreived successfully.");
            return response.data.collection;
        }
        catch(error) {
            log.error(error);            
            throw new Error('Collection not found');
        }            
    }
};