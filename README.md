# Weather Sensor API

This weather sensor API is a secure REST API built with Express.js, MongoDB, and Mongoose. It features a fully functional API where users can query weather information stored in a MongoDB database.<br>
<br>This API was built using the OpenAPI 3 standard and its documentation can be viewed below:
<br><a href="https://app.swaggerhub.com/apis-docs/webDataCluster/WeatherAPI/1.0.0#/">View API Documentation</a><br>

## Features
* 🛡️ Secure authentication with JWT's
* 🔒 Create and use accounts with full password encrytion
* 🚪 Role-based access control to secure endpoints
* ✅ Validation to prevent unexpected data from being inserted
* 🌡️ Add new weather readings
* 👥 Add new users with specified roles
* 📊 Seven different endpoints to query, manipulate, and add weather data
* 🔍 Five different endpoints to filter, create, and manipulate user accounts 

## Endpoints
<img src="https://github.com/NeoFoxxo/weather-api-mongodb/blob/c9ff7b1e749c85d09716de0b71e399771101f721/images/endpoints.png" alt="endpoints" width="100%">

## How To Run It
To run this on your local machine, you will need to have Node.js installed and access to a MongoDB database.

1. Clone the repository to your local machine
2. Import the database folder to your MongoDB server with `mongorestore`
3. Create a `.env` file in the root directory and add a `DATABASE_URL` and `ACCESS_TOKEN_SECRET`
4. Open your terminal and run `npm install`
5. Run the `npm run start` command
6. Access the API on port 5000 and enjoy!