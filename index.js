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

// Mongoose
const mongoose      = require('mongoose');
mongoose.connect('mongodb://localhost/muncher');
const Job           = require('./lib/model/job');

// emit changes through socket.io
watcher.watch(config.mongo.database + '.jobs', event => {
  if (event.operation === 'update') {

    // This code needs a lot more logic! Two types of events can happen:
    // * partial update
    // * complete update
    //
    // partial update:
    // In a partial update, the event.data will only hold the $set object with a field
    // that is named after the key, and its new value. You can't access it like event.data.$set.a.b.c,
    // because the field-name is a string, so you need to do event.data.$set[a.b.c].
    // TODO: This should probably be rebuilt to a real object for consistency.
    //
    // also, it will not contain the Job ID, which is saved in the 'id' key. It will contain the targetId though,
    // which references the MongoDB document by its internal primary key '_id'. Through this, we can findById our
    // Document again and from there extract the necessary Job ID and other things that might be relevant.
    //
    // complete update:
    // In a complete update, the document has been saved as a whole. The event.data will then hold the new, complete
    // document, so things like event.data.id are already defined.
    //
    if (event.data.$set) {
      // only partial update, retrieve the job id from the complete document
      Job.findById(event.targetId, (err, job) => {
        event.data.$set.id = job.id; //attach retrieved job id to output
        joblog.emit('set', event.data.$set);
      });
    } else {
      // whole document has been updated.
      debug('document');
      joblog.emit('document', event.data);
    }
  }
});
