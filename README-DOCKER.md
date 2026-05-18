# Docker Services

To run this application, you need the MongoDB and Redis services.

## Environment Variables

All service credentials are configured via the `.env` file at the project root. Docker Compose loads this file automatically.

To get started, copy the example file and adjust values as needed:

```sh
cp .env.example .env
```

## Starting and Stopping Services

To easily install and start these services under Docker on your PC, run the following command:

```sh
docker compose up -d
```

To stop the services, run the following command:

```sh
docker compose down
```

The services store their respective database data in Docker volumes.

To stop the services and also delete the Docker volumes, run the following command:

```sh
docker compose down -v
```

## Default Credentials

The default credentials are defined in `.env`. See `.env.example` for the full list of variables.

### MongoDB

| Variable              | Default     |
| --------------------- | ----------- |
| `MONGO_ROOT_USERNAME` | `admin_user` |
| `MONGO_ROOT_PASSWORD` | `admin_pwd` |

Application users (created by `docker-entrypoint-initdb.d/mongo-init.js`):

| User          | Password          | Role                                      |
| ------------- | ----------------- | ----------------------------------------- |
| `app_backend` | `app_password`    | CRUD + indexes on `db_todoapp`            |
| `admin_app`   | `admin_password`  | dbAdmin + userAdmin on `db_todoapp`       |
| `backup_user` | `backup_password` | readAnyDatabase (lecture seule globale)   |

### Redis

| Variable         | Default     |
| ---------------- | ----------- |
| `REDIS_PASSWORD` | `admin_pwd` |
