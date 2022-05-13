const readline = require("readline");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://127.0.0.1:27017";
const dotenv = require("dotenv").config();
const cookieParser = require('cookie-parser')
let app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const socket = require("socket.io");

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


//    let val = prompt("Enter your name", "");
//             

app.get("/name", async function (req, res) {
    res.render(path.join(__dirname, "./templates/name.ejs"));
});

app.post("/name", async function (req, res) {
    let name = req.body.name;

    res.cookie("name",name);

    return res.redirect('/');
});

  app.get("/", async function (req, res) {
    if(!req.cookies.name|| req.cookies.name === "")
    {
        return res.redirect('/name');
       
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
                        a+= `${ele.name} : ${ele.message}\n`;
                    }
                );
                res.render(path.join(__dirname, "./templates/main.ejs"), { messageList : a , name:req.cookies.name});

                });
          });
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
          //emit("/", req.body);
          
          return;
        });
        res.redirect('/');
  });
//   io.on('connection', () =>{
//     console.log('a user is connected')
//   })
  let serv = app.listen(port);
  const io = socket(serv);


  io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
  });
  

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
