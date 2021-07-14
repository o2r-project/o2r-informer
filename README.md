 :warning: Project discontinued :warning: Funcions now integrated in <https://github.com/o2r-project/o2r-muncher>

# o2r informer

Node.js implementation of the WebSocket status update part of the [o2r-web-api](https://o2r.info/api).

Requirements:

- nodejs
- npm
- MongoDB

## Preparing the MongoDB

This service uses the [MongoDB oplog](https://docs.mongodb.com/manual/core/replica-set-oplog/) (operations log), which is normally used in replication sets, to trigger status events for clients.
The oplog originally records all changes to the master MongoDB and provides them to potential replications.
On a single-server installation, this is not enabled by default, so you will need to [enable replication](https://docs.mongodb.com/manual/replication/) to enable the oplog.

## Dockerfile

This project includes a `Dockerfile` which can be built with

```bash
docker build -t informer .
```

### Available environment variables

- `INFORMER_PORT`
  Define on which Port o2r-informer should listen. Defaults to `8082`.
- `INFORMER_MONGODB` __Required__
  Connection string for the MongoDB. Defaults to `mongodb://localhost:27017/`. You will very likely need to change this.
- `INFORMER_MONGODB_HOST` and `INFORMER_MONGODB_PORT`
  Port for the MongoDB. Defaults to `localhost` respectively `27017`. You will very likely need to change this. This information is duplicated with the previous setting because different packages are used to connect to the MongoDB.
- `INFORMER_MONGODB_DATABASE`
  Which database inside the mongo db should be used. Defaults to `muncher`.

## API endpoint

The current status of a job logs is published using [WebSocket](https://en.wikipedia.org/wiki/WebSocket)s using the [socket.io](http://socket.io/) library. You can connect to the namespace `api/v1/logs/job` with the corresponding Socket.io JavaScript library:

```JavaScript
var socket = io('http://<host>/api/v1/logs/job');
```

See an example in `test/index.html`.

## License

o2r-informer is licensed under Apache License, Version 2.0, see file LICENSE.

Copyright (C) 2017 o2r project.
