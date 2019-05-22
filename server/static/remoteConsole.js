var endpoint = `ws://${location.host}`;

var reconnecting = false;
var connect = function() {
  console.info("Connecting to server console...");

  var socket = new WebSocket(endpoint);
  socket.onmessage = function(event) {
    var { method, args } = JSON.parse(event.data);
    console[method](...args);
  };

  socket.onopen = () => {
    reconnecting = false;
    console.info("Server console connected!");
  };

  socket.onclose = reconnect;

  // socket.onerror = reconnect;
};

var reconnect = () => {
  if (reconnecting) return;
  reconnecting = true;
  setTimeout(connect, 1000);
};

connect();
