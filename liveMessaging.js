const readline = require("readline");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
let app = express();
var socket = require("socket.io");
const myArgs = process.argv.slice(2);
const jsdom = require("jsdom");
const dom = new jsdom.JSDOM("");
const jquery = require("jquery")(dom.window);
const axios = require("axios");

const prompts = readline.createInterface(process.stdin, process.stdout);

async function apiCallBadWordFilter(msg) {
  return new Promise((resolve) => {
    const encodedParams = new URLSearchParams();

    const options = {
      method: "GET",
      url: `https://www.purgomalum.com/service/json?text=${msg}`,
    };

    axios
      .request(options)
      .then(function (response) {
        resolve(response.data["result"]);
      })
      .catch(function (error) {
        console.error(error);
      });
  });
}

// if (myArgs.length !== 1) {
//   console.log("Usage liveMessaging.js port");
//   process.exit();
// }
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
  app.use(express.static(__dirname + "/"));

  var port = process.env.PORT || Number(myArgs[0]);

  app.get("/name", async function (req, res) {
    res.render(path.join(__dirname, "./templates/name.ejs"));
  });

  app.post("/name", async function (req, res) {
    let name = req.body.name;
    if (!req.cookies.name || req.cookies.name === "") {
      res.cookie("name", name);
    }
    return res.redirect("/");
  });

  app.get("/", async function (req, res) {
    if (!req.cookies.name || req.cookies.name === "") {
      return res.redirect("/name");
    }
    let asd = "";
    MongoClient.connect(
      process.env.MONGO_URL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      (err, client) => {
        if (err) {
          return console.log(err);
        }
        conn = client;
        // Specify database you want to access
        let db = client.db(process.env.MONGO_DB_NAME);
        let collection = db.collection(process.env.MONGO_COLLECTION);

        let rn = new Date();
        let dateTime = rn.toLocaleDateString() + " " + rn.toLocaleTimeString();
        collection.insertOne(
          {
            name: req.cookies.name,
            message: `${req.cookies.name} has Joined`,
            time: dateTime,
          },
          (err, result) => {}
        );
        collection.find({}).toArray(function (err, items) {
          if (err) throw err;
          asd = "";
          items.forEach((ele) => {
            asd += `<div class="box sb2"> [${ele.time}]${ele.name} : ${ele.message}</div><br>`;
          });
          asd += "";
          io.sockets.emit("new user", {
            name: req.cookies.name,
            time: dateTime,
          });
          client.close();
          res.render(path.join(__dirname, "./templates/main.ejs"), {
            messageList: asd,
            name: `Hi ${req.cookies.name}!`,
          });
        });
      }
    );
  });

  app.post("/deleteMessages", async function (req, res) {
    if (req.body.pass !== "1234") {
      res.end();
      return;
    }
    MongoClient.connect(
      process.env.MONGO_URL,
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
        await collection.deleteMany({});
        io.sockets.emit("refresh", {});
        client.close();
        console.log("ASD");
        res.end();
      }
    );
  });

  app.post("/updateMessages", async function (req, res) {
    let message = req.body["text"];
    let rn = new Date();
    let dateTime = rn.toLocaleDateString() + " " + rn.toLocaleTimeString();
    if(message !== ""){
      message = await apiCallBadWordFilter(message);
    }
    
    io.sockets.emit("chat message", {
      message: message,
      name: req.cookies.name,
      time: dateTime,
    });
    await MongoClient.connect(
      process.env.MONGO_URL,
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
        await collection.insertOne(
          { name: req.cookies.name, message: message, time: dateTime },
          (err, result) => {}
        );
        client.close();
        res.end();
      }
    );
    //res.redirect('/');
  });
  //   io.on('connection', () =>{
  //     console.log('a user is connected')
  //   })

  app.post("/leaving", async function (req, res) {
    let rn = new Date();
    let dateTime = rn.toLocaleDateString() + " " + rn.toLocaleTimeString();
    io.sockets.emit("remove user", { name: req.cookies.name, time: dateTime });
    await MongoClient.connect(
      process.env.MONGO_URL,
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
        await collection.insertOne(
          {
            name: req.cookies.name,
            message: `${req.cookies.name} has Left`,
            time: dateTime,
          },
          (err, result) => {}
        );
        client.close();
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
