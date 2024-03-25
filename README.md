# authentication-service

## Description
A service that can be used by 3rd parties to register and log in users.

## Dependencies
It needs to connect to a user-service. This can be specified using the "USER-SERVICE" env var.
It also needs a PORT env variable - defaults to :8000

It needs 2 endpoints
1) **POST /check** - which returns a user from the database. This is used to verify if the user exists or not.
2) **POST /** - This is used to create a new user on register.

## Build
Run `docker build -t <name> .`

## Development
To build `npm run build`

To run `npm start`