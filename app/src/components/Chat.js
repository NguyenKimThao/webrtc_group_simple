import React, { useState, useEffect, useRef } from "react";
import queryString from "query-string";

const RemoteVideo = ({ remoteStream }) => {
  const localVideoRef = useRef(null);
  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = remoteStream;
  }, [localVideoRef.current, remoteStream]);

  return (
    <video
      ref={localVideoRef}
      autoPlay
      playsInline
      width={200}
      height={200}
      style={{ border: "1px solid black" }}
    ></video>
  );
};
const Chat = ({ location, socket, name, room, userid }) => {
  const [localStream, setLocalStream] = useState(null);
  const [listPeerConnection, setListPeerConnection] = useState([]);
  const localVideoRef = useRef(null);
  const mapUserPeer = useRef({});
  const listUserId = useRef({});

  function CreateRTCPeerConnection() {
    try {
      var pcConfig = {
        sdpSemantics: "plan-b",
        bundlePolicy: "max-bundle",
      };
      var pc = new RTCPeerConnection(pcConfig);
      pc.onaddstream = function (event) {
        var id = event.stream.id;
        console.log("Remote stream added by peerId:", id, event);
      };
      pc.onicecandidate = function (e) {
        console.log("jas ce", e);
      };
      pc.addStream(localStream);
      return pc;
    } catch (exc) {
      console.log("ex", exc);
    }
  }
  useEffect(() => {
    const { name, room } = queryString.parse(location.search);
    if (!name || !room || !socket || !localStream) {
      return;
    }
    console.log("socker,", socket, name, room);
    socket.on("webrtc_messae", async (message) => {
      const partnerid = message.userid;
      if (message.type == "candidate")
        mapUserPeer.current[message.userid].pc.addIceCandidate(
          message.candidate
        );
      else if (message.type == "createOffer") {
        mapUserPeer.current[message.userid].pc.setRemoteDescription(
          message.sdp
        );
        var sdp = await mapUserPeer.current[message.userid].pc.createAnswer();
        mapUserPeer.current[message.userid].pc.setLocalDescription(sdp);
        socket.emit("webrtc_messae", {
          type: "createAnswer",
          room,
          userid,
          partnerid,
          sdp,
        });
      } else if (message.type == "createAnswer") {
        mapUserPeer.current[message.userid].pc.setRemoteDescription(
          message.sdp
        );
      }
    });
    socket.on("listuid", (message) => {
      console.log("recv: listuid", message);
      listUserId.current = message;
      setListPeerConnection({ ...listPeerConnection });

      Object.keys(message).forEach(async (partnerid) => {
        const partner = message[partnerid];
        console.log("partner", partnerid, partner);
        var pc = CreateRTCPeerConnection();
        pc.onaddstream = function (event) {
          var id = event.stream.id;
          console.log("Remote stream added by peerId:", id, event);
          mapUserPeer.current[partner.userid].remoteStream = event.stream;
          setListPeerConnection({ ...listPeerConnection });
        };
        pc.onicecandidate = function (e) {
          if (e.candidate) {
            const candidate = e.candidate;
            socket.emit("webrtc_messae", {
              type: "candidate",
              room,
              userid,
              partnerid,
              candidate,
            });
          }
          console.log("e", e, e.candidate);
        };
        mapUserPeer.current[partner.userid] = {
          pc: pc,
        };
        var sdp = await pc.createOffer();
        await pc.setLocalDescription(sdp);
        console.log("sdp", sdp);
        socket.emit("webrtc_messae", {
          type: "createOffer",
          room,
          userid,
          partnerid,
          sdp,
        });
      });
    });

    socket.on("user_join", (message) => {
      console.log("userid", message);
      const partnerid = message.userid;
      listUserId.current[partnerid] = message.room[partnerid];
      console.log("join", listUserId.current);
      var pc = CreateRTCPeerConnection();
      pc.onaddstream = function (event) {
        var id = event.stream.id;
        console.log("Remote stream added by peerId:", id, event);
        mapUserPeer.current[partnerid].remoteStream = event.stream;
        setListPeerConnection({ ...listPeerConnection });
      };
      pc.onicecandidate = function (e) {
        if (e.candidate) {
          const candidate = e.candidate;
          socket.emit("candidate", {
            room,
            userid,
            partnerid,
            candidate,
          });
        }
        console.log("e", e, e.candidate);
      };
      mapUserPeer.current[partnerid] = {
        pc: pc,
      };
      setListPeerConnection({ ...listPeerConnection });
    });
    socket.emit("join", { name, room, userid }, (error) => {
      if (error) {
        alert(error);
      }
    });
    return () => {
      socket.emit("bye", { room, userid });
    };
  }, [socket, location.search, localStream]);
  useEffect(() => {
    const gotStream = (stream) => {
      setLocalStream(stream);
    };
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(gotStream)
      .catch(function (e) {
        console.log("getUserMedia() error: " + e.name, e);
      });
  }, []);
  useEffect(() => {
    console.log("video stream", localStream, localVideoRef.current);
    if (!localStream || !localVideoRef.current) {
      return;
    }
    localVideoRef.current.srcObject = localStream;
    console.log("video stream");
  }, [localStream, localVideoRef.current]);

  //   useEffect(() => {
  //     socket.on("message", (message) => {
  //       setMessages((messages) => [...messages, message]);
  //     });
  //     // socket.on("roomData", ({ users }) => {
  //     //   console.log(users);
  //     //   setUsers(users);
  //     // });
  //   }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message) {
      socket.emit("sendMessage", { message });
      setMessage("");
    } else alert("empty input");
  };

  console.log("mapUserPeer.current", listUserId.current, mapUserPeer.current);

  return (
    <div>
      <div>
        <div>
          <div>Your Name: Thaonk</div>
          <video
            ref={localVideoRef}
            width={200}
            height={200}
            autoPlay
            muted
            playsInline
          ></video>
          <div style={{ marginBottom: 20 }}>
            <button>Tắt Mic</button>
            <button>Tắt Video</button>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          {Object.keys(listUserId.current).map((userId, i) => {
            const user = listUserId.current[userId];
            return (
              <div
                key={userId}
                style={{
                  minHeight: "300px",
                  minWidth: "300px",
                  border: "1px solid black",
                }}
              >
                {user.name}
                {mapUserPeer.current &&
                  mapUserPeer.current[user.userid] &&
                  mapUserPeer.current[user.userid].pc && (
                    <RemoteVideo
                      remoteStream={
                        mapUserPeer.current[user.userid].remoteStream
                      }
                    />
                  )}
              </div>
            );
          })}
          {/* <form action="" onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <input type="submit" />
      </form> */}
        </div>
      </div>
    </div>
  );
};

export default Chat;
