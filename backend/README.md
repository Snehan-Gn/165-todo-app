# Backend Usage Guide

Go to `backend` folder:

## Project Setup

```sh
npm install
```

## DB connection

The backend uses MongoDB. Before starting the Node application, copy the
example environment file and adjust it if needed:

```sh
cp .env.example .env
```

The `.env` file must contain a `MONGO_URI` variable pointing to your MongoDB server:

```sh
MONGO_URI="mongodb://app_backend:app_password@localhost:27017/db_todoapp?authSource=db_todoapp"
```

The default credentials match those defined in `docker-entrypoint-initdb.d/mongo-init.js`.

## Redis

```sh
REDIS_URL="redis://:admin_pwd@localhost:6379"
```

## Run and Hot-Reload for Development

```sh
npm run dev
```

For testing the frontend (e2e:open or e2e:run) a custom route `/test/reset` is necessary to cleanup the DB before each test.

To active such route, start the backend with:

```sh
npm run dev:e2e
```
