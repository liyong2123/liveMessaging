const readline = require("readline");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://127.0.0.1:27017";
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
let app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var socket = require("socket.io");
const myArgs = process.argv.slice(2);
const jsdom = require("jsdom");
const dom = new jsdom.JSDOM("");
const jquery = require("jquery")(dom.window);

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

    res.cookie("name", name);

    return res.redirect("/");
  });

  app.get("/", async function (req, res) {
    if (!req.cookies.name || req.cookies.name === "") {
      return res.redirect("/name");
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
          let a = "<pre>";
          items.forEach((ele) => {
            a += ` [${ele.time}]${ele.name} : ${ele.message}<br>`;
          });
          a += "</pre>";
          let rn = new Date();
          let dateTime =
            rn.toLocaleDateString() + " " + rn.toLocaleTimeString();
          io.sockets.emit("new user", {
            name: req.cookies.name,
            time: dateTime,
          });

          collection.insertOne(
            {
              name: req.cookies.name,
              message: `${req.cookies.name} has Joined`,
              time: dateTime,
            },
            (err, result) => {}
          );
          //emit("/", req.body);

          res.render(path.join(__dirname, "./templates/main.ejs"), {
            messageList: a,
            name: req.cookies.name,
          });
        });
      }
    );
  });

  app.post("/updateMessages", function (req, res) {
    console.log(req.body);
    let message = req.body["text"];
    let rn = new Date();
    let dateTime = rn.toLocaleDateString() + " " + rn.toLocaleTimeString();
    io.sockets.emit("chat message", {
      message: message,
      name: req.cookies.name,
      time: dateTime,
    });
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
          { name: req.cookies.name, message: message, time: dateTime },
          (err, result) => {}
        );
        //emit("/", req.body);
      }
    );
    //res.redirect('/');
    res.end();
  });
  //   io.on('connection', () =>{
  //     console.log('a user is connected')
  //   })

  app.post("/leaving", function (req, res) {
    let rn = new Date();
    let dateTime = rn.toLocaleDateString() + " " + rn.toLocaleTimeString();
    io.sockets.emit("remove user", { name: req.cookies.name, time: dateTime });
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
          {
            name: req.cookies.name,
            message: `${req.cookies.name} has Left`,
            time: dateTime,
          },
          (err, result) => {}
        );
      }
    );
    res.end();
  });
  let serv = app.listen(port);
  const io = socket(serv);

  io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  io.on("connection", (socket) => {
    socket.on("chat message", (msg) => {
      socket.emit("chat message", msg);
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
