API for ChatBox : express service backed by Postgres

# To start Everything up

You will need to run `npm install` in the folder to install the dependencies locally to run the tests. You will need [node install](https://nodejs.org/en/download/) to do this.

To run locally or run the tests you will need to run `docker-compose up -d` to start the containers including postgres. You will need to have [docker setup](https://www.docker.com/products/docker-desktop) to do this.

Everything should be listening on `http://localhost:3001`

If you want to run it locally you can as well by running `node server` but that will default to listen on port 3000 vs 3001.

# Run tests

```
npm test
```

# Shut everything down.

To stop all the docker containers just run the following

```
docker-compose down
```