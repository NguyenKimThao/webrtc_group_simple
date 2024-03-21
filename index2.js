const http = require("http");
const express = require("express");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});
var roomManager = {};
var socketMenager = {};
var PORT = 8080;

io.on("connection", (socket) => {
  // convenience function to log server messages on the client
  console.log('co socker coonet')
  function log() {
    var array = ['Message from server:'];
    // array.push.apply(array, arguments);
    // socket.emit('log', array);
  }

  socket.on('message', function (data) {
    log('Client said: ', data.message);
    // for a real app, would be room-only (not broadcast)
    socket.broadcast.to(data.room).emit('message', data.message);
  });

  socket.on('init', function (data) {

  })

  socket.on('join', function (data) {
    console.log('co josn')
    if (!roomManager[data.room]) {
      roomManager[data.room] = {};
    }

    var loopBack = parseInt(data.loopBack)
    if (loopBack > 0 && loopBack <= 100) {
      roomManager[data.room] = {};
      for (var i = 0; i < loopBack; i++) {
        var index = 10000 + i;
        roomManager[data.room][index] = { userid: index, video: true, audio: true };
      }
    }

    var room = roomManager[data.room];
    console.log("co user tham gia phong:", data.room, " slht:", room, " userid:", data.userid)
    socket.emit('listuid', room);
    room[data.userid] = { userid: data.userid };
    io.sockets.in(data.room).emit('user_join', room);
    socket.join(data.room);
    socketMenager[data.userid] = socket;
  });

  socket.on('candidate', function (data) {
    if (!roomManager[data.room] || !socketMenager[data.peerId]) {
      return;
    }
    console.log('candidate:', data);
    var room = roomManager[data.room];
    // socket.broadcast.to(data.room).emit('candidate', data);
    socketMenager[data.peerId].emit('candidate', data);
  });


  socket.on('bye', function (data) {
    console.log('received bye');
    // io.sockets.in(data.room).emit('bye');
    socket.leave(data.room)
    var room = roomManager[data.room];

    if (room) {
      delete room[data.userid]
      delete socketMenager[data.userid];
      io.sockets.in(data.room).emit('user_join', room);
    }

  });
});


server.listen(PORT, () => console.log(`Server is Quannected to Port ${PORT}`));