var socket = io();

    var messages = document.getElementById("msgs");
    var input = document.getElementById('text');
    let subButton = document.getElementById("submit1");
    window.onbeforeunload = null;
    $(window).bind(
    "beforeunload", 
    function() { 
        var req = new XMLHttpRequest();
        req.open("POST", "/leaving", true);
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.send("");
        return false;
    }
    );

    function delMessage()
    {
        let pass = prompt("Password:");
        var req = new XMLHttpRequest();
        req.open("POST", "/deleteMessages", true);
        req.send("");
        messages.innerHTML = "";
        return false;
    }

    function subasd()
    {
        var input = document.getElementById('text');
        var req = new XMLHttpRequest();
        req.open("POST", "/updateMessages", true);
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.send("text="+input.value);
        input.value = '';
        return false;
    }
   
    socket.on("refresh", function(msg)
    {
        messages.innerHTML = "";
    });

    socket.on("chat message", function (msg) {
        console.log("Got it");
      messages = document.getElementById("msgs");

      var item = "";

      item.textContent = `<div class="box sb2">[${msg["time"]}] ${msg["name"]} : ${msg["message"]}</div>`;
      messages.appendChild(item);
      window.scrollTo(0, document.body.scrollHeight);
    });
    socket.on("new user", function (msg) {
      messages = document.getElementById("msgs");

      var item = document.createElement("li");

      item.textContent = `[${msg["time"]}] ${msg["name"]} has Joined`;
      messages.appendChild(item);
      window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on("remove user", function (msg) {
      messages = document.getElementById("msgs");

      var item = document.createElement("li");

      item.textContent = `[${msg["time"]}] ${msg["name"]} has Left`;
      messages.appendChild(item);
      window.scrollTo(0, document.body.scrollHeight);
    });