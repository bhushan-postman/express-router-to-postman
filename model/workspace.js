const logger = require('pino')()
const log = logger.child({ file: 'workspace.js' })
const axios = require('axios');
const storage = require('node-persist');
const constants = require("../constants.js");
const POSTMAN_API_ENDPOINT = constants.POSTMAN_API_ENDPOINT;
const POSTMAN_API_KEY = constants.POSTMAN_API_KEY;

module.exports = {
    /**
     * This function checks if a workspace has already been created, if not creates a new workspace. 
     * If a workspace already existing, we are persisting the workspaceId using node-persist.
     * @param {*} name 
     * @returns 
     */
    saveWorkspace: async function (name) {        
        try {
            await storage.init({});
            let workspaceId = await storage.getItem('workspaceId');
            if(workspaceId) {
                log.info("Workspace has already been saved. Trying to retrieve workspace with ID " + workspaceId);
                return workspaceId;               
            }
            else {
                try {
                    var response = await axios.post(POSTMAN_API_ENDPOINT + 'workspaces/', 
                        { "workspace": {
                                "name": name,
                                "type": "team",
                                "description": "Created from Node.js application."
                            }
                        }, {headers: {'X-Api-Key':POSTMAN_API_KEY}});
                    await storage.setItem('workspaceId', response.data.workspace.id);                    
                    log.info("Workspace saved successfully.");
                    return response.data.workspace.id;
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
     * Get the workspace using the workspaceId from Postman
     * @param {*} workspaceId 
     * @returns 
     */
    getWorkspace: async function (workspaceId) {
        try {
            var response = await axios.get(POSTMAN_API_ENDPOINT + "workspaces/" + workspaceId, {
                headers: {'X-Api-Key':POSTMAN_API_KEY, 'accept': 'application/vnd.api.v10+json'}
            });
            log.info("Workspace " + response.data.workspace.name + " retreived successfully.");
            return response.data.workspace;
        }
        catch(error) {
            log.error(error);
            throw new Error('Workspace not found');
        }            
    }
};