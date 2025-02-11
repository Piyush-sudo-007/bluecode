import { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import Home from "./pages/Home/Home";
import Form from "./pages/Form/Form";
import Logo from "./pages/Logo/Logo";
import { ToastContainer } from "react-toastify";
import { Route, Routes } from "react-router-dom";

const socket = io("https://bluecode-jeds.onrender.com");

function App() {
  const [user, setUser] = useState(true);
  const [groupId, setGroupId] = useState("");
  const [username, setUsername] = useState("");
  const [group, setGroup] = useState(false);
  const [logo, setLogo] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLogo(false);
    }, 5000);
  });

  return (
    <>
      <ToastContainer
        draggable={true}
        theme="dark"
        closeOnClick={true}
        closeButton={false}
      ></ToastContainer>
      <Routes>
        {logo ? (
          <Route path="/" element={<Logo />}></Route>
        ) : (
          <>
            {user ? (
              <Route
                path="/"
                element={
                  <Home
                    groupId={groupId}
                    socket={socket}
                    username={username}
                    setGroupId={setGroupId}
                    setUsername={setUsername}
                    setUser={setUser}
                    group={group}
                    setGroup={setGroup}
                  />
                }
              ></Route>
            ) : (
              <Route
                path="/"
                element={
                  <Form
                    setUser={setUser}
                    socket={socket}
                    groupId={groupId}
                    setGroupId={setGroupId}
                    username={username}
                    setUsername={setUsername}
                    group={group}
                    setGroup={setGroup}
                  />
                }
              ></Route>
            )}
          </>
        )}
      </Routes>
    </>
  );
}

export default App;
