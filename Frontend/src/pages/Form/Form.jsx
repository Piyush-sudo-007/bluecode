import "./Form.css";
import logo from "../../assets/logo.jpg";
import { toast } from "react-toastify";

const Form = ({
  setUser,
  socket,
  groupId,
  setGroupId,
  setUsername,
  username,
  group,
  setGroup,
}) => {
  const joinGroup = () => {
    if (groupId && username) {
      socket.emit("join", { groupId, username });
      socket.on("error", (message) => {
        setUser(false);
        toast.warn(message);
        setGroupId("");
        return;
      });
      toast.success("Joined group");
      setGroupId(groupId);
      setUser(true);
      setGroup(true);
    } else {
      alert("Please enter correct group Id and username !!");
    }
  };

  const createGroup = () => {
    let groupId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    if (username) {
      socket.emit("join", { groupId, username });
      toast.success("Group Created");
      setGroupId(groupId);
      setUser(true);
      setGroup(true);
    } else {
      toast.warn("Please enter Username !!");
    }
  };

  return (
    <div className="form-container">
      <div className="join-form">
        <div className="image">
          <img src={logo} alt="" />
          <h2>BlueCode.</h2>
        </div>
        <input
          type="text"
          placeholder="Your Name"
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
        />
        <hr />
        <input
          type="text"
          placeholder="Group Id"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        />
        <button onClick={joinGroup}>Join</button>
        <hr className="or" />
        <button className="create" onClick={createGroup}>
          Create Group
        </button>
      </div>
      <div className="particle particle1"></div>
      <div className="particle particle2"></div>
      <div className="particle particle3"></div>
      <div className="particle particle4"></div>
      <div className="particle particle5"></div>
      <div className="particle particle6"></div>
      <div className="particle particle7"></div>
      <div className="particle particle8"></div>
    </div>
  );
};

export default Form;
