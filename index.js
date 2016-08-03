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


const MongoWatch    = require('mongo-watch');
watcher             = new MongoWatch({format: 'pretty', useMasterOplog:true});

watcher.watch('muncher.jobs', event => {
  console.log('something changed:', event);
});

// Express
const express       = require('express');
const compression   = require('compression');
const bodyParser    = require('body-parser');
const app           = express();

app.use(compression());
app.use(bodyParser.json());

// finally start webserver
app.listen(config.net.port, () => {
  console.log('informer v%s.%s.%s, api version %s waiting for requests on %s.',
      config.version.major,
      config.version.minor,
      config.version.bug,
      config.version.api,
      config.net.port );
});
