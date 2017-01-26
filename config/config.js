/*
 * (C) Copyright 2016 Jan Koppe.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
var c = {};
c.version = {};
c.net = {};
c.mongo = {};
var env = process.env;

// information about informer
c.version.major  = 0;
c.version.minor  = 2;
c.version.bug    = 1;
c.version.api    = 1;

// network & database
c.net.port = env.INFORMER_PORT || 8082;
c.mongo.location = {};
c.mongo.location.full = env.INFORMER_MONGODB || 'mongodb://localhost/';
c.mongo.location.hostonly = env.INFORMER_MONGODB_HOST || 'localhost';
c.mongo.database = env.INFORMER_MONGODB_DATABASE || 'muncher';
c.mongo.port = env.INFORMER_MONGODB_PORT || 27017;
c.mongo.inital_connection_attempts = 30;
c.mongo.inital_connection_max_delay = 3000;
c.mongo.inital_connection_initial_delay = 1000;

// fix mongo location if trailing slash was omitted
if (c.mongo.location.full[c.mongo.location.full.length - 1] !== '/') {
  c.mongo.location.full += '/';
}

// socket.io (namespaces etc.)
c.socketio = {};
c.socketio.namespaces = {};
c.socketio.namespaces.job = '/api/v1/logs/job';


module.exports = c;
