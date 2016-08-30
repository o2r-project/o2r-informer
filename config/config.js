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
c.version.minor  = 1;
c.version.bug    = 0;
c.version.api    = 1;

// network & database
c.net.port         = env.INFORMER_PORT || 8082;
c.mongo.location   = env.INFORMER_MONGODB || 'localhost';
c.mongo.database   = env.INFORMER_MONGODB_DATABASE || 'muncher';

// fix mongo location if trailing slash was omitted
if (c.mongo.location[c.mongo.location.length - 1] !== '/') {
  c.mongo.location += '/';
}

// socket.io (namespaces etc.)
c.socketio = {};
c.socketio.namespaces = {};
c.socketio.namespaces.job = '/api/v1/logs/job';


module.exports = c;
