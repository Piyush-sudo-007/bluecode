import "./Navbar.css";
import icon from "../../assets/logo.jpg";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CODE_SNIPPETS } from "../../constant";
import { executeCode } from "../../api";

const Navbar = ({
  setLanguage,
  language,
  typing,
  socket,
  groupId,
  output,
  setOutput,
  code,
  setCode,
  setTerminal,
  setLoading,
  setError,
  setTitle,
  title,
  setSavedCodes,
  selectedProject,
}) => {
  const [assistantStatus, setAssistantStatus] = useState(false);

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'en-US';  // Set the language to English
    window.speechSynthesis.speak(speech);  // Speak the text
  };

 const startListening = () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("Recognized speech: ", transcript);

    fetch("https://bluecode-jeds.onrender.com/process-audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: transcript }),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch data from backend.");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Response from Jarvis: ", data);
      if (data.output) {
        speak(data.output);  // Speak the output received from Jarvis
      } else {
        toast.warn("No output from Jarvis.");
      }
    })
    .catch((error) => {
      console.error("Error processing audio: ", error);
      toast.error("Something went wrong, please try again.");
    });
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error: ", event.error);
    toast.warn("Sorry, I couldn't understand that.");
  };
};


  const handleLanguage = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", groupId, newLanguage);
    setCode(CODE_SNIPPETS[newLanguage]);
    socket.emit("code-change", { groupId, code: CODE_SNIPPETS[newLanguage] });
    localStorage.setItem("savedCode", CODE_SNIPPETS[newLanguage]);
  };

  useEffect(() => {
    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage);
    });

    socket.on("code-update", (updatedCode) => {
      setCode(updatedCode);
    });

    return () => {
      socket.off("languageUpdate");
      socket.off("code-update");
    };
  }, [socket]);

  const handleRun = async () => {
    if (output === "Run") {
      setOutput("Back");
      const sourceCode = code;
      if (!sourceCode.trim()) {
        toast.warn("Please provide code to run.");
        return;
      }
      try {
        setLoading(true);
        const { run } = await executeCode(language, sourceCode);
        setError(false);
        setTerminal(run.output.split("\n"));
        if (run.stderr !== "") {
          setError(true);
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
        toast.warn(error.message || error.toString());
      } finally {
        setLoading(false);
      }
    } else {
      setOutput("Run");
    }
  };

  const handleSaveWithTitle = () => {
    if (!title || !code.trim()) {
      toast.warn("Please provide a title and code to save.");
      return;
    }

    const savedCodesFromStorage =
      JSON.parse(localStorage.getItem("savedCodes")) || [];

    const titleExists = savedCodesFromStorage.some(
      (savedCode) => savedCode.title === title
    );

    if (titleExists) {
      toast.warn("Please use a unique title.");
      return;
    }

    const newCodeSnippet = { title, code };

    savedCodesFromStorage.push(newCodeSnippet);

    localStorage.setItem("savedCodes", JSON.stringify(savedCodesFromStorage));

    setSavedCodes(savedCodesFromStorage);

    setTitle("");
    toast.success("Code saved!");
  };

  return (
    <div className="navbar">
      <select className="language" value={language} onChange={handleLanguage}>
        <option value="javascript">Javascript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="c++">C++</option>
        <option value="c">C</option>
        <option value="php">php</option>
      </select>
      <div className="mid">
        <input
          type="text"
          placeholder="Enter title for your code"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <h5>{selectedProject}</h5>
        <p>{typing}</p>
      </div>
      <div className="btns">
        <div className="assistant" onClick={startListening}>
          <p className="tag">&#128075; I am Byte, your voice assistant</p>
          <img src={icon} alt="Assistant Icon" />
          {assistantStatus && <p>Assistant is active!</p>}{" "}
        </div>
        <button className="run" onClick={handleRun}>
          {output}
        </button>
        <button className="save" onClick={handleSaveWithTitle}>
          Save
        </button>
      </div>
    </div>
  );
};

export default Navbar;
