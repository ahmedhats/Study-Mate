const axios = require("axios");

// Test connection to the API
async function testApi() {
  try {
    console.log(
      "Testing API connection to http://localhost:5000/api/study-sessions..."
    );
    const response = await axios.get(
      "http://localhost:5000/api/study-sessions"
    );
    console.log("Connection successful!");
    console.log("Response status:", response.status);
    console.log("Data received:", response.data);
  } catch (error) {
    console.error("Connection failed!");
    if (error.code === "ECONNREFUSED") {
      console.error(
        "The server is not running or not accessible at port 5000."
      );
      console.error("Please make sure the backend server is running.");
    } else {
      console.error("Error details:", error.message);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
    }
  }
}

testApi();
