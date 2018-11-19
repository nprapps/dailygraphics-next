var endpoint = `ws://${location.host}`;

var connect = function() {

  console.info("Connecting to server console...");

  var socket = new WebSocket(endpoint);
  socket.onmessage = function(event) {
    var { method, args} = JSON.parse(event.data);

    console[method](...args);
  }

  socket.onopen = () => console.info("Server console connected!");

  socket.onclose = reconnect;

  socket.onerror = reconnect;
};

var reconnect = () => setTimeout(connect, 1000);

connect();