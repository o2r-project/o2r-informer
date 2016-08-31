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

const config = require('./config/config');
const debug = require('debug')('informer');

// Socket.io
debug("Connecting to socket.io at port %s and namespaces %s", config.net.port, JSON.stringify(config.socketio.namespaces));
const socketio = require('socket.io')(config.net.port);
const joblog = socketio.of(config.socketio.namespaces.job);
socketio.serveClient(true);

// Watch for changes in MongoDB oplog
debug("Connecting with MongoWatch using host '%s'", config.mongo.location.hostonly);
const MongoWatch = require('mongo-watch');
var watcher = new MongoWatch({
  format: 'pretty',
  host: config.mongo.location.hostonly
});

// Mongoose
debug("Connecting with mongoose using host and database '%s'", config.mongo.location.full + config.mongo.database);
const mongoose = require('mongoose');
mongoose.connect(config.mongo.location.full + config.mongo.database);

const Job = require('./lib/model/job');

/**
 * turns a string like "a.b.c" into a object "{a:{b:{c: value}}}"
 * @param  {string} str string with object path
 * @param  {Object} val value of the referenced object.
 * @return {Object}     new object according to path with the provided value set.
 */
objectify = (str, val) => {
  let obj = {}
  str.split('.').reduce(function (cur, next, i, arr) {
    if (!cur[next]) cur[next] = {}
    if (i === arr.length - 1) cur[next] = val
    return cur[next]
  }, obj)
  return obj
}

/**
 * merge all fields from obj2 into obj1 and return obj1
 * @param  {Object} obj1 object
 * @param  {Object} obj2 object
 * @return {Object} object containing obj1 and all fields of obj2
 */
merge = (obj1, obj2) => {
  for (var attr in obj2) {
    obj1[attr] = obj2[attr]
  }
  return obj1
}

if (!joblog) {
  console.log('joblog does not exist, ABORT: ' + joblog);
  process.exit(2);
}

joblog.on('connection', function (socket) {
  debug("Someone connected to joblog: %s", socket.id);
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

        debug("Update! %s", JSON.stringify(data));
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

debug('informer ' + config.version.major + '.' + config.version.minor + '.' +
  config.version.bug + ' with api version ' + config.version.api +
  ' waiting for requests on port ' + config.net.port);
