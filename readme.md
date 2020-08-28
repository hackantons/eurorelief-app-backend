# Eurorelief  - Backend
This is a Restful Backend for the Eurorelief PWA based on NodeJS and MongoDB

## Security

The APP is connected to a Filemaker Database. To keep the users' personal data as secure as possible, the app works with only two values from this database.

### Registration Number
The "registration number" (05/00000000) is a unique ID for each Refugee. Therefore it is extremely sensitive and we don't store this number anywhere. Neither in the client, nor in our database.

Instead we resolve the registration number to a user ID (UUID). Inside the filemaker database there is of course a connection between the user ID and the registration number, but not in our App database.

There is one endpoint (/auth/resolve-camp-id/) the accepts a registration number and resolves it to the user ID.

### User ID
We get the User ID from the Filemaker Database and we use it as the unique identifier. To strengthen the security, we will not expose the user ID directly to the client (except for the initial /auth/resolve-camp-id/ request). Whenever we send the user ID to the client it will be encrypted using the "aes-256-ctr" algorythm.

### Authentication
To authenticate the client against the App we use a Json Web Token sent via the authorization header as a Bearer Token with every request. The token stays valid for 30 days and will be generated using the /auth/signin/ Endpoint.

### Signin
To sign in we use a standard username/password combination.
- **Username**: encrypted Filemaker user ID
- **Password**: a 20 characters long random string whose sha256 hash will be compared to the hash in the database

Both, username and password will be returned by the PUT /user/ request and stored persistent inside the indexedDB of the client for later usage.

## Authentication as Admin
Several endpoints have a restricted Admin access. To authenticate as admin an "ADMIN_KEY" ENV needs to be specified and sent via the authorization header as a Bearer Token. If you need to mimic a specific user the user ID (not encrypted) cand be sent as a GET parameter:
```
curl --location --request GET '{base}/user/?user={userID}' --header 'Authorization: Bearer {ADMIN_KEY}'
// same as
curl --location --request GET '{base}/user/' --header 'Authorization: Bearer {jwt for userID}'
```

## send message
```
curl --location --request PUT '{base}/message/' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {ADMIN_KEY}' \
--data-raw '{
    "user": ["{userID (filemaker record ID)}"], // one or more userIDs
    "title": "message title",
    "message": "this is a message",
    "sms": true // if set to false, only push will be sent, not sms (no expanses)
}'
```
