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
  //TODO: Add better ejs
  var app = express();
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.set("view engine", "ejs");
  var port = process.env.PORT || Number(myArgs[0]);

  app.get("/", function (req, res) {
    MongoClient.connect(
        url,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
        (err, client) => {
          if (err) {
            return console.log(err);
          }
          // Specify database you want to access
          let db = client.db(process.env.MONGO_DB_NAME);
          let collection = db.collection(process.env.MONGO_COLLECTION);
          collection.find({ email: email1 }).toArray(function (err, items) {
            if (err) throw err;
  
            res.render(path.join(__dirname, "./templates/applyResponse.ejs"), {
              name: items[0].name,
              email: items[0].email,
              gpa: items[0].gpa,
              bI: items[0].info,
            });
            return;
          });
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
