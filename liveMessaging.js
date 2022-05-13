const readline = require("readline");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://127.0.0.1:27017";
const dotenv = require("dotenv").config();
const cookieParser = require('cookie-parser')
const { emit } = require("process");
let app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const myArgs = process.argv.slice(2);



const prompts = readline.createInterface(process.stdin, process.stdout);


if (myArgs.length !== 1) {
  console.log("Usage liveMessaging.js port");
  process.exit();
}
serveExpress();
ask();


function serveExpress() {
  //TODO: Add better ejs
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.set("view engine", "ejs");
  app.use(cookieParser());

  var port = process.env.PORT || Number(myArgs[0]);

  app.get("/", async function (req, res) {
    if(req.cookies.name == undefined || req.cookies.name === "")
    {
        let val = prompt("Enter your name", "");
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
          
            //TODO: Get Messages
            collection.find({}).toArray(function (err, items) {
                if (err) throw err;
                let a = "";
                items.forEach( (ele) =>
                    {
                        a+= `${ele.name} : ${ele.message}`;
                    }
                );
                console.log(a);
                res.render(path.join(__dirname, "./templates/main.ejs"), { messageList : a });

                });
          });
  });


  app.get('/getcookie', async (req, res) => {
      if(req.cookies.name == undefined || req.cookies.name === "")
      {
        const val = await prompt('What\'s your name?', 'Bob');


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

  app.post("/", function (req, res) {
    let message = req.body["text"];

    MongoClient.connect(
      url,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      async (err, client) => {
        if (err) {
          return console.log(err);
        }
        // Specify database you want to access
        let db = client.db(process.env.MONGO_DB_NAME);
        let collection = db.collection(process.env.MONGO_COLLECTION);
        collection.insertOne(
            { name: req.cookies.name, message:message },
            (err, result) => {}
          );
          emit("/", req.body);
          return;
        });

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
