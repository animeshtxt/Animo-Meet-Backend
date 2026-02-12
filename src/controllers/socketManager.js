import { Server } from "socket.io";
import logger from "../utils/logger.js";

let connections = {};
let messages = {};
let timeOnline = {};
let usernames = {};
let names = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.FRONTEND_URL || "https://yourdomain.com"
          : "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const rooms = Object.keys(connections);

    console.log("something is connected");

    console.log("Connected clients on connect :", io.engine.clientsCount);
    socket.on(
      "join-call",
      ({
        roomID,
        username,
        name,
        audioEnabled,
        audioAvailable,
        videoEnabled,
        videoAvailable,
      }) => {
        socket.join(roomID);
        logger.dev(
          `User with name: ${name}, username: ${username}, socketID: ${socket.id} joined room: ${roomID} \n audioEnabled: ${audioEnabled} \naudioAvailable: ${audioAvailable} \nvideoEnabled: ${videoEnabled} \nvideoAvailable: ${videoAvailable}`,
        );

        if (connections[roomID] === undefined) {
          connections[roomID] = [];
        }
        if (!usernames[roomID]) {
          usernames[roomID] = {};
        }
        usernames[roomID][socket.id] = username;
        if (!names[roomID]) {
          names[roomID] = {};
        }
        names[roomID][socket.id] = name;

        connections[roomID].push(socket.id);
        timeOnline[socket.id] = new Date();

        /*
      connections[roomID].forEach((element) => {
        io.to(element).emit(
          "user-joined",
          socket.id,
          connections[roomID],
          username,
          name,
          usernames[roomID],
        );
      });
      */
        /*

     |------------------------------------------------------------------------------------------------------------------|
     | METHOD                       | DESCRIPTION                                          | RECEIPIENTS                |
     |------------------------------|------------------------------------------------------|----------------------------|
     | socket.emit()	              | Sends an event only to the                           | Only the sender.           |
     |                              | individual client associated with                    |                            |
     |                              | that specific socket object.	                       |                            |
     |------------------------------|------------------------------------------------------|----------------------------|
     | io.emit()    	              | Sends an event to all connected clients, including   | All clients, including the |
     |                              | the one that initiated the action (if applicable).   | sender.                    |
     |                              | io refers to the overall server instance.            |                            |
     |------------------------------|------------------------------------------------------|----------------------------|
     | socket.to('room').emit()     | Sends an event to all clients in a specific room,    | All clients in the 'room', |
     |                              | except the sender of the original message.           | except the sender.         |
     |------------------------------|------------------------------------------------------|----------------------------|
     | io.to('room').emit()   	    | Sends an event to all clients in a specific room,    | All clients in the room    |       
     |                              | including the sender (if they are in the room).      | including the sender.      |
     |                              | io.in() is an alias for io.to()                      |                            |
     |------------------------------|------------------------------------------------------|----------------------------|

     */

        logger.dev("type of connections[roomID]", typeof connections[roomID]);
        logger.dev(connections[roomID]);
        io.to(roomID).emit("user-joined", {
          id: socket.id,
          clients: connections[roomID],
          username: username,
          name: name,
          usernamesMap: usernames[roomID],
          namesMap: names[roomID],
          peerAudioEnabled: audioEnabled,
          peerAudioAvailable: audioAvailable,
          peerVideoEnabled: videoEnabled,
          peerVideoAvailable: videoAvailable,
        });

        // send preexisting messages
        if (messages[roomID] != undefined) {
          messages[roomID].forEach((element) => {
            io.to(roomID).emit(
              "chat-message",
              element["sender"],
              element["data"],
              element["socket-id-sender"],
            );
          });
        }
      },
    );

    // signalling should be individual for peer to peer
    socket.on("signal", (toId, message) => {
      // console.log("toId : " + toId);
      // console.log("message : ", message);
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on(
      "toggle-media",
      ({
        roomId,
        peerVideoEnabled,
        peerVideoAvailable,
        peerAudioEnabled,
        peerAudioAvailable,
      }) => {
        // kind = 'audio' | 'video'
        // status = true | false

        // DEBUGGING: Check if the socket is actually in the room
        logger.dev("Socket is currently in rooms:", socket.rooms);

        // Check if roomId exists in the set
        // Note: socket.rooms is a Set in Socket.io v3/v4
        if (!socket.rooms.has(roomId)) {
          logger.error(
            `ERROR: Socket ${socket.id} is NOT in room "${roomId}"!`,
          );
          // This means you forgot to call socket.join(roomId) in your 'join-room' event
          return;
        }

        logger.dev(`Emitting to ${roomId}...`);

        // Note: io.to sends to EVERYONE (including sender).
        // socket.to sends to OTHERS (excluding sender).
        socket.to(roomId).emit("user-media-update", {
          userId: socket.id,
          peerVideoEnabled,
          peerVideoAvailable,
          peerAudioEnabled,
          peerAudioAvailable,
        });
      },
    );

    socket.on("chat-message", (sender, data, time) => {
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }
          return [room, isFound];
        },
        ["", false],
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
        connections[matchingRoom].forEach((elem) => {
          io.to(elem).emit("chat-message", sender, data, time, socket.id);
        });
      }
    });

    socket.on("disconnect", () => {
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
                leftUsername,
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
