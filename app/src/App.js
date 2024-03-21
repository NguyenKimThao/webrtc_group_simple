import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./components/Home";
import Chat from "./components/Chat";

const ENDPOINT = "http://localhost:8080";

const App = () => {
  const socketIo = useRef(null);
  const [userId, setUserId] = useState("");
  useEffect(() => {
    if (!io) return;
    socketIo.current = io(ENDPOINT).connect();
    setUserId(new Date().getTime());
  }, []);
  return (
    <Router>
      <Route
        path="/"
        exact
        component={() => <Home userid={userId} socket={socketIo.current} />}
      />
      <Route
        path="/chat"
        component={(props) => {
          return <Chat {...props} userid={userId} socket={socketIo.current} />;
        }}
      />
    </Router>
  );
};

export default App;
