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
// this is the event handler for client1 sending offer signal to client2
io.on("connection", (socket) => {
  socket.emit("me", socket.id);
  socket.on(
    "send offer-signal",
    ({ callToUserSocketId, callFromUserSocketId, offerSignal }) => {
      console.log(
        "sending offer-signal from",
        callFromUserSocketId,
        "to",
        callToUserSocketId
      );
      io.to(callToUserSocketId).emit("receive-offer-signal", {
        callFromUserSocketId,
        offerSignal,
      });
    }
  );

  // this is the event handler for client2 sending answer signal to client1
  //this is week 5 task part 1.
  socket.on(
    "send answer-signal",
    ({ callToUserSocketId, callFromUserSocketId, answerSignal }) => {
      console.log(
        "sending answer-signal from",
        callFromUserSocketId,
        "to",
        callToUserSocketId
      );
      io.to(callToUserSocketId).emit("receive-answer-signal", {
        callFromUserSocketId,
        answerSignal,
      });
    }
  );
});
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
