// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

'use strict';

// Local env
require('dotenv').load({ silent: true });

// Required Libs
var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var http = require('http');
var cfenv = require('cfenv');

// Credentials
var appEnv = cfenv.getAppEnv();

var databaseUri = process.env.DATABASE_URI || appEnv.getServiceCreds('parse-mongo').uri;

// Start Express
var app = express();

// Validate Keys
if (!process.env.APP_ID) {
  throw 'Please apply the Application ID from Parse.com';
}

if (!process.env.MASTER_KEY) {
  throw 'Please apply the Master Key from Parse.com';
}

if (!databaseUri) {
  throw 'Please provide DATABASE_URI to an instance of MongoDB or deploy to Bluemix with a Compose MongoDB service';
}

// Server Location
var port      = appEnv.port;
var host      = appEnv.bind;
var mountPath = process.env.PARSE_MOUNT || '/';

// Specify the connection string for your mongodb database
// and the location to your Parse cloud code
var parseConfig = {
  databaseURI: databaseUri,
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY,
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  serverURL: ((process.env.HTTPS) ? 'https://' : 'http://') + host + ':' + port + mountPath,
};

// Optional Keys
if (process.env.FILE_KEY) {
  // String
  parseConfig.fileKey = process.env.FILE_KEY;
}

if (process.env.CLIENT_KEY) {
  // String
  parseConfig.clientKey = process.env.CLIENT_KEY;
}

if (process.env.JS_KEY) {
  // String
  parseConfig.javascriptKey = process.env.JS_KEY;
}

if (process.env.REST_KEY) {
  // String
  parseConfig.restAPIKey = process.env.REST_KEY;
}

if (process.env.DOTNET_KEY) {
  // String
  parseConfig.dotNetKey = process.env.DOTNET_KEY;
}

if (process.env.ALLOW_CLIENT_CLASS_CREATION) {
  // Boolean
  parseConfig.allowClientClassCreation = process.env.ALLOW_CLIENT_CLASS_CREATION;
}

if (process.env.ENABLE_ANONYMOUS_USERS) {
  // Boolean
  parseConfig.enableAnonymousUsers = process.env.ENABLE_ANONYMOUS_USERS;
}

if (process.env.OAUTH) {
  // Object: https://github.com/ParsePlatform/parse-server/wiki/Parse-Server-Guide#oauth
  parseConfig.oauth = process.env.OAUTH;
}

if (process.env.FACEBOOK_APP_IDS) {
  // Array
  parseConfig.facebookAppIds = process.env.FACEBOOK_APP_IDS;
}

// Create Parse Server instance
var api = new ParseServer(parseConfig);

// Serve the Parse API on the / URL prefix
app.use(mountPath, api);

// And listen to requests
app.listen(port, host, function() {
  console.log('parse-server running on port ' + port + '.');
});

require("metrics-tracker-client").track();
