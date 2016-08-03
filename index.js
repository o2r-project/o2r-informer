/*
 * (C) Copyright 2016 o2r-project.
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

const config        = require('./config/config');
const debug         = require('debug')('informer');

// Socket.io
const socketio      = require('socket.io')(config.net.port);
const joblog        = socketio.of('/api/v1/logs/job');
// Watch for changes in MongoDB oplog
const MongoWatch    = require('mongo-watch');
watcher             = new MongoWatch({
  format:           'pretty',
  useMasterOplog:   true,
  host:             config.mongo.location
});

// emit changes through socket.io
watcher.watch(config.mongo.database + '.jobs', event => {
  if(event.operation === 'update' && event.data.$set) {
    debug(event);
    joblog.to(event.data.id).emit(event.data.$set);
  } // only emit updates
});

