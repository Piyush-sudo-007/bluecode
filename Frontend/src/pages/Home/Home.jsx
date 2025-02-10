import SideBar from "../../components/SideBar/SideBar";
import Ground from "../../components/Ground/Ground";
import Navbar from "../../components/NavBar/Navbar";
import "./Home.css";
import { useState } from "react";

const Home = ({
  groupId,
  socket,
  username,
  setUsername,
  setGroupId,
  setUser,
  group,
  setGroup,
}) => {
  const [language, setLanguage] = useState("javascript");
  const [typing, setTyping] = useState("");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("Run");
  const [terminal, setTerminal] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedCodes, setSavedCodes] = useState([]);
  const [title, setTitle] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  return (
    <div className="home">
      <SideBar
        groupId={groupId}
        socket={socket}
        setUsername={setUsername}
        setGroupId={setGroupId}
        setUser={setUser}
        setCode={setCode}
        setLanguage={setLanguage}
        group={group}
        setGroup={setGroup}
        savedCodes={savedCodes}
        setSavedCodes={setSavedCodes}
        setSelectedProject={setSelectedProject}
        selectedProject={selectedProject}
      />
      <div className="arena">
        <Navbar
          setLanguage={setLanguage}
          language={language}
          typing={typing}
          socket={socket}
          groupId={groupId}
          output={output}
          setOutput={setOutput}
          code={code}
          setCode={setCode}
          setTerminal={setTerminal}
          setError={setError}
          setLoading={setLoading}
          savedCodes={savedCodes}
          setSavedCodes={setSavedCodes}
          title={title}
          setTitle={setTitle}
          selectedProject={selectedProject}
        />
        <Ground
          groupId={groupId}
          language={language}
          socket={socket}
          username={username}
          setTyping={setTyping}
          code={code}
          setCode={setCode}
          output={output}
          setOutput={setOutput}
          terminal={terminal}
          error={error}
          loading={loading}
          setLoading={setLoading}
          setTerminal={setTerminal}
          setError={setError}
          savedCodes={savedCodes}
          setSavedCodes={setSavedCodes}
          title={title}
          setTitle={setTitle}
        />
      </div>
    </div>
  );
};

export default Home;
