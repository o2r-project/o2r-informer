/*
 * (C) Copyright 2017 o2r project
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

const config = require('./config/config');
const debug = require('debug')('informer');
const backoff = require('backoff');

const merge = require('./lib/util').merge;
const objectify = require('./lib/util').objectify;

const Job = require('./lib/model/job');

// Socket.io
debug("Connecting to socket.io at port %s and namespaces %s", config.net.port, JSON.stringify(config.socketio.namespaces));
const socketio = require('socket.io')(config.net.port);
const joblog = socketio.of(config.socketio.namespaces.job);
socketio.serveClient(true);

if (!joblog) {
  debug('joblog does not exist, shutting down: %s', joblog);
  process.exit(1);
}

joblog.on('connection', function (socket) {
  debug('Someone connected to joblog: %s', socket.id);
});

// DB connection
const MongoWatch = require('mongo-watch');
const dbURI = config.mongo.location.full + config.mongo.database;

// Need mongoose for job access
const mongoose = require('mongoose');

function initWatch(callback) {
  // Watch for changes in MongoDB oplog
  debug("Connecting with MongoWatch using host '%s' and port '%s'", config.mongo.location.hostonly, config.mongo.port);
  var watcher = new MongoWatch({
    format: 'pretty',
    host: config.mongo.location.hostonly,
    port: config.mongo.port
  });

  // emit changes through socket.io
  watcher.watch(config.mongo.database + '.jobs', event => {
    if (event.operation === 'update') {
      if (event.data.$set) {
        // only partial update, retrieve the job id from the complete document
        Job.findById(event.targetId, (err, job) => {
          let data = { partial: true, id: job.id }
          //convert object-strings to objects
          for (var name in event.data.$set) {
            let obj = objectify(name, event.data.$set[name])
            //console.log(obj)
            data = merge(data, obj)
          }

          debug('Update! %s', JSON.stringify(data));
          joblog.emit('set', data)
        });
      } else {
        // whole document has been updated.
        debug('document');
        event.data.partial = false
        joblog.emit('document', event.data);
      }
    }
  });

  callback(null);
}

// connect to DB with retries
var dbBackoff = backoff.fibonacci({
  randomisationFactor: 0,
  initialDelay: config.mongo.initial_connection_initial_delay,
  maxDelay: config.mongo.initial_connection_max_delay
});

dbBackoff.failAfter(config.mongo.initial_connection_attempts);
dbBackoff.on('backoff', function (number, delay) {
  debug('Trying to connect to MongoDB in %sms', delay);
});
dbBackoff.on('ready', function (number, delay) {
  debug('Connect to MongoDB (#%s) ...', number);
  mongoose.connect(dbURI, (err) => {
    if (err) {
      debug('Error during connect: %s', err);
      mongoose.disconnect(() => {
        debug('Mongoose: Disconnected all connections.');
      });
      dbBackoff.backoff();
    } else {
      // delay app startup to when MongoDB is available
      debug('Initial connection open to %s: %s', dbURI, mongoose.connection.readyState);
      initWatch((err) => {
        if (err) {
          debug('Error during init!\n%s', err);
          mongoose.disconnect(() => {
            debug('Mongoose: Disconnected all connections.');
          });
          dbBackoff.backoff();
        }

        debug('informer %s with API version %s waiting for requests on port %s',
          c.version,
          c.api_version,
          c.net.port);
      });
    }
  });
});
dbBackoff.on('fail', function () {
  debug('Eventually giving up to connect to MongoDB');
  process.exit(1);
});

dbBackoff.backoff();
