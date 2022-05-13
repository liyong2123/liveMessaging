const readline = require("readline");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://127.0.0.1:27017";
const dotenv = require("dotenv").config();

const myArgs = process.argv.slice(2);

if (myArgs.length !== 1) {
  console.log("Usage liveMessaging.js port");
  process.exit();
}

ask();

function serveExpress() {
  //TODO: Implement
  var app = express();
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.set("view engine", "ejs");
  var port = process.env.PORT || Number(myArgs[0]);

  app.get("/", function (req, res) {
    res.render(path.join(__dirname, "./templates/main.ejs"));
  });


  app.listen(port);
  console.log(
    `Web server started and running at http://localhost:${myArgs[0]}`
  );
}

function ask() {
  prompts.question("Type stop to shutdown the server: ", (response) => {
    // check the response.
    if (response === "stop") {
      console.log("Exiting");
      process.exit();
    }
  });
}
