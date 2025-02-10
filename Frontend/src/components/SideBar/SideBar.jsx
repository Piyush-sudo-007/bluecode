import "./SideBar.css";
import logo from "../../assets/logo.jpg";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const SideBar = ({
  groupId,
  socket,
  setUsername,
  setGroupId,
  setUser,
  setLanguage,
  setCode,
  group,
  setGroup,
  savedCodes,
  setSavedCodes,
  selectedProject,
  setSelectedProject,
}) => {
  const [copy, setCopy] = useState("");
  const [users, setUsers] = useState([]);
  const [sidebar, setSidebar] = useState(false);

  const handleLeave = () => {
    socket.emit("leaveGroup");
    setCode("");
    setLanguage("javascript");
    setUsername("");
    setGroupId("");
    setGroup(false);
  };

  useEffect(() => {
    socket.on("UserJoined", (users) => {
      setUsers(users);
    });

    return () => {
      socket.off("join");
    };
  }, []);

  useEffect(() => {
    const handleUser = () => {
      socket.emit("leaveGroup");
    };

    window.addEventListener("beforeunload", handleUser);

    return () => {
      window.removeEventListener("beforeunload", handleUser);
    };
  }, []);

  const copyId = () => {
    navigator.clipboard.writeText(groupId);
    setCopy("Copied");
    setTimeout(() => {
      setCopy("");
    }, 2000);
  };

  const handleLoadCode = (codeSnippet) => {
    setCode(codeSnippet.code);
    setSelectedProject(codeSnippet.title);
  };

  const handleRemove = (titleToRemove) => {
    const savedCodesFromStorage =
      JSON.parse(localStorage.getItem("savedCodes")) || [];

    const updatedSavedCodes = savedCodesFromStorage.filter(
      (codeSnippet) => codeSnippet.title !== titleToRemove
    );

    localStorage.setItem("savedCodes", JSON.stringify(updatedSavedCodes));

    setSavedCodes(updatedSavedCodes);

    toast.warning("Code removed!");
  };

  return (
    <>
      {sidebar ? (
        <div className="sidebar open">
          <div className="images">
            <img src={logo} alt="" />
            <h2>BlueCode.</h2>
            <h2
              style={{
                marginLeft: "25px",
                color: "red",
                cursor: "pointer",
              }}
              onClick={() => setSidebar(false)}
            >
              X
            </h2>
          </div>
          <hr />
          {group ? (
            <>
              <div className="group">
                <p>Group ID : {groupId}</p>
                <button onClick={copyId}>Copy ID</button>
                {copy && <span className="copy">{copy}</span>}
              </div>
              <div className="groups">
                <h3>GROUP MEMBERS</h3>
                <ol className="user-list">
                  {users.map((user, index) => (
                    <li key={index}>{user}</li>
                  ))}
                </ol>
              </div>
            </>
          ) : (
            <button
              onClick={() => {
                setGroup(true);
                setUser(false);
              }}
            >
              Create/Join Group
            </button>
          )}
          <div className="projects">
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              PROJECTS
            </h3>
            <ol className="project-list">
              {savedCodes.map((codeSnippet, index) => (
                <li
                  key={index}
                  onClick={() => handleLoadCode(codeSnippet)}
                  style={{
                    backgroundColor:
                      selectedProject === codeSnippet.title
                        ? "#d3d3d3"
                        : "transparent",
                    color:
                      selectedProject === codeSnippet.title
                        ? "black"
                        : "inherit",
                  }}
                >
                  {codeSnippet.title}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(codeSnippet.title);
                    }}
                  >
                    <box-icon
                      name="trash"
                      type="solid"
                      color="#ff0000"
                    ></box-icon>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <button className="leave" onClick={handleLeave}>
            Leave Group
          </button>
        </div>
      ) : (
        <div className="menu" onClick={() => setSidebar(true)}>
          <box-icon name="menu-alt-left" color="#f7f4f4"></box-icon>
        </div>
      )}
    </>
  );
};

export default SideBar;
