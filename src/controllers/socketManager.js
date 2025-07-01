import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};
let usernames = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      // TO BE CHANGED IN PRODUCTION
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // console.log("something is connected");
    // console.log("Connected clients on connect :", io.engine.clientsCount);
    socket.on("join-call", (path, username, name) => {
      if (connections[path] === undefined) {
        connections[path] = [];
      }
      if (!usernames[path]) {
        usernames[path] = {};
      }
      usernames[path][socket.id] = name;

      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date();

      connections[path].forEach((element) => {
        io.to(element).emit(
          "user-joined",
          socket.id,
          connections[path],
          username,
          name,
          usernames[path]
        );
      });
      if (messages[path] != undefined) {
        messages[path].forEach((element) => {
          io.to(socket.id).emit(
            "chat-message",
            element["sender"],
            element["data"],
            element["socket-id-sender"]
          );
        });
      }
    });
    socket.on("signal", (toId, message) => {
      // console.log("toId : " + toId);
      // console.log("message : ", message);
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (sender, data, time) => {
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }
          return [room, isFound];
        },
        ["", false]
      );
      if (found === true) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }

        messages[matchingRoom].push({
          sender: sender,
          data: data,
          time: time,
          "socket-id-sender": socket.id,
        });
        // console.log("message", matchingRoom, ":", sender, data, time);
        connections[matchingRoom].forEach((elem) => {
          io.to(elem).emit("chat-message", sender, data, time, socket.id);
        });
      }
    });

    socket.on("disconnect", () => {
      // console.log(
      //   "Connected clients after disconnect:",
      //   io.engine.clientsCount
      // );
      let diffTime = Math.abs(timeOnline[socket.id] - new Date());
      let key;

      for (const [k, v] of Object.entries(connections)) {
        for (let a = 0; a < v.length; ++a) {
          if (v[a] === socket.id) {
            key = k;
            const leftUsername = usernames[key]?.[socket.id] || "A user";
            for (let a = 0; a < connections[key].length; ++a) {
              io.to(connections[key][a]).emit(
                "user-left",
                socket.id,
                leftUsername
              );
            }
            let index = connections[key].indexOf(socket.id);
            connections[key].splice(index, 1);
            if (usernames[key]) {
              delete usernames[key][socket.id];
              if (Object.keys(usernames[key]).length === 0) {
                delete usernames[key];
              }
            }
            if (connections[key].length === 0) {
              delete connections[key];
              delete messages[key];
              delete usernames[key];
            }
          }
        }
      }
    });
  });
  return io;
};
