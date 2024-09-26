const logger = require('pino')()
const express = require('express')
const name = require('project-name');
const workspace = require('./model/workspace');
const collection = require('./model/collection');
const routes = require('./routes');
const log = logger.child({ file: 'index.js' })
var path = require('path');


/**
 * This function access a express application as input
 * @param {app} expressApp - Express Application
*/
async function publishToPostman(expressApp) {   
    // Extract main folder name which will be used to set the name of the workspace and folder name     
    const workspaceName = path.basename(__dirname);
    // Extract all the endpoints from the router
    var requests = routes.stackToCollection(app._router.stack);     
    // Create a workspace
    const workspaceId = await workspace.saveWorkspace(workspaceName);
    // Create a collection and store all the routes
    const collectionId = await collection.saveCollection(workspaceName, workspaceId, requests);
    log.info("Postman publish complete.");           
}

module.exports = publishToPostman