import React from "react";
import { render, act } from "@testing-library/react";
import InitiatedVideoCalls from "./InitiatedVideoCalls";

// Mock the simple-peer library
jest.mock("simple-peer", () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    signal: jest.fn(),
  }));
});

// Mock the createPeer function
jest.mock("../utils/createPeer", () => ({
  createPeer: jest.fn(),
}));

describe("InitiatedVideoCalls", () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    };
  });

  it("should set up peer connection and handle answer signal", () => {
    const props = {
      mySocketId: "socket1",
      myStream: {},
      othersSocketIds: "socket2",
      webrtcSocket: mockSocket,
    };

    render(<InitiatedVideoCalls {...props} />);

    // Check if createPeer was called with correct arguments
    expect(require("../utils/createPeer").createPeer).toHaveBeenCalledWith(
      "socket2",
      "socket1",
      mockSocket
    );

    // Simulate receiving an answer signal
    const answerSignalHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "receiveAnswerSignal"
    )[1];

    act(() => {
      answerSignalHandler({
        callFromUserSocketId: "socket2",
        answerSignal: { type: "answer" },
      });
    });

    // Check if peer.signal was called with the answer signal
    const Peer = require("simple-peer");
    expect(Peer.mock.instances[0].signal).toHaveBeenCalledWith({
      type: "answer",
    });
  });

  it("should clean up event listener on unmount", () => {
    const props = {
      mySocketId: "socket1",
      myStream: {},
      othersSocketIds: "socket2",
      webrtcSocket: mockSocket,
    };

    const { unmount } = render(<InitiatedVideoCalls {...props} />);

    unmount();

    // Check if the event listener was removed
    expect(mockSocket.off).toHaveBeenCalledWith("receiveAnswerSignal");
  });
});
