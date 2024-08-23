const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Hello World");
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.emit("me", socket.id);

  socket.on("initiateCall", ({ to }) => {
    console.log("Initiating call from", socket.id, "to", to);
    socket.to(to).emit("incomingCall", { from: socket.id });
  });

  socket.on(
    "sendOffer",
    ({ callToUserSocketId, callFromUserSocketId, offerSignal }) => {
      console.log(
        "Sending offer from",
        callFromUserSocketId,
        "to",
        callToUserSocketId
      );
      io.to(callToUserSocketId).emit("incomingCall", {
        from: callFromUserSocketId,
        offerSignal: offerSignal,
      });
    }
  );

  socket.on(
    "sendAnswer",
    ({ callFromUserSocketId, callToUserSocketId, answerSignal }) => {
      console.log(
        "Sending answer from",
        callToUserSocketId,
        "to",
        callFromUserSocketId
      );
      io.to(callFromUserSocketId).emit("receiveAnswer", {
        from: callToUserSocketId,
        answerSignal: answerSignal,
      });
    }
  );

  socket.on("declineCall", ({ callFromUserSocketId }) => {
    console.log("Call declined by", socket.id);
    io.to(callFromUserSocketId).emit("callDeclined");
  });

  socket.on("endCall", ({ to }) => {
    console.log("Ending call from", socket.id, "to", to);
    io.to(to).emit("endCall");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
