const readline = require("readline");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://127.0.0.1:27017";
const dotenv = require("dotenv").config();
const cookieParser = require('cookie-parser')
const popup = require('popups');

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
  app.use(cookieParser());

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
            });
            //TODO: Get Messages
            return;
          });
    res.render(path.join(__dirname, "./templates/main.ejs"));
  });

  app.get('/getcookie', (req, res) => {
      if(req.cookies.name == undefined || req.cookies.name === "")
      {
        popupS.prompt({
            content:     'What is your name?',
            placeholder: '>>>',
            onSubmit: function(val) {
                if(val.length !== 0) {
                    popupS.alert({
                        content: 'Hello, ' + val
                    });
                    res.cookie("name",val,
                    {
                        maxAge: 5000,
                        // expires works the same as the maxAge
                        expires: new Date('01 12 2021'),
                        secure: true,
                        httpOnly: true,
                        sameSite: 'lax'
                    });
                } else {
                    popupS.alert({
                        content: ':('
                    });
                    res.cookie("name","anon",
                    {
                        maxAge: 5000,
                        // expires works the same as the maxAge
                        expires: new Date('01 12 2021'),
                        secure: true,
                        httpOnly: true,
                        sameSite: 'lax'
                    });
                }
            }
        });
      }
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
