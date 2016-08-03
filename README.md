# o2r informer

Node.js implementation of the WebSocket status update part of the o2r-web-api.

__!! This is not yet ready to be used !!__

Requirements:

```
nodejs >= 6.2
npm
mongodb
```

## Preparing the MongoDB

This service uses the MongoDB oplog, which is normally used in replication sets. It will record all changes to the Master MongoDB and provide them to potential replications. On a single-server installation, this is not enabled by default. You will need to pass the `--master` argument while starting your MongoDB instance, or put the line `master = true` into your `/etc/mongod.conf` file.

## Dockerfile

This project includes a `Dockerfile` which can be built with
```
docker build -t o2r-informer .
```

The image can then be run and configured via environment variables. For convenience,
we include a `docker-compose` configuration, which can be run with

```
cd docker-compose && docker-compose up
# after you're done, shutdown and delete all volumes (data):
docker-compose down -v
```

### Available environment variables

* `INFORMER_PORT`
  Define on which Port o2r-informer should listen. Defaults to `8082`.
* `INFORMER_MONGODB` __Required__
  Location for the mongo db. Defaults to `mongodb://localhost/`. You will very likely need to change this.
* `INFORMER_MONGODB_DATABASE`
  Which database inside the mongo db should be used. Defaults to `muncher`.

## License

o2r-informer is licensed under Apache License, Version 2.0, see file LICENSE.

Copyright (C) 2016 - o2r project.
