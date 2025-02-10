import { useEffect, useRef, useState } from "react";
import "./Ground.css";
import { Editor } from "@monaco-editor/react";
import { CODE_SNIPPETS } from "../../constant";
import { toast } from "react-toastify";
import { executeCode } from "../../api";

const Ground = ({
  language,
  groupId,
  socket,
  username,
  setTyping,
  code,
  setCode,
  output,
  terminal,
  error,
  loading,
  setLoading,
  setTerminal,
  setError,
  setSavedCodes,
}) => {
  const onChangeHandler = (newCode) => {
    setCode(newCode);
    socket.emit("code-change", { groupId, code: newCode });
    socket.emit("typing", groupId, username);

    localStorage.setItem("savedCode", newCode);
  };

  useEffect(() => {
    const savedCodesFromStorage =
      JSON.parse(localStorage.getItem("savedCodes")) || [];
    setSavedCodes(savedCodesFromStorage);
    const savedCode = localStorage.getItem("savedCode");
    if (savedCode) {
      setCode(savedCode);
    }

    socket.on("code-update", (updatedCode) => {
      setCode(updatedCode);
    });

    socket.on("userTyping", (user) => {
      setTyping(`${user.slice(0, 8)} is typing...`);
      setTimeout(() => {
        setTyping("");
      }, 1000);
    });

    return () => {
      socket.off("code-update");
      socket.off("userTyping");
    };
  }, [socket]);

  const editorRef = useRef();

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  var newLan;
  if (language === "c++") {
    newLan = "cpp";
  } else {
    newLan = language;
  }

  const handleRunAgain = async () => {
    const sourceCode = code;
    if (!sourceCode) {
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
    } catch (error) {
      console.log(error);
      toast.warn(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-editor">
      <Editor
        height={"83%"}
        width={"100%"}
        defaultValue={CODE_SNIPPETS[language]}
        defaultLanguage={language}
        language={newLan}
        value={code}
        onChange={onChangeHandler}
        theme="vs-dark"
        onMount={onMount}
        options={{
          minimap: { enabled: false },
          fontSize: 16,
        }}
      />
      <div className={`output-area ${output === "Back" ? "showOutput" : ""}`}>
        {loading ? (
          <div className="loader"></div>
        ) : (
          <>
            <div
              className={`run-btn ${output === "Back" ? "run" : ""}`}
              onClick={handleRunAgain}
              style={{ width: "110px", float: "left" }}
            >
              Run Again
            </div>
            <div className={`main-output ${error && "error-output"}`}>
              <p style={{ textAlign: "center" }}>
                Please use pre-defined user inputs !!
              </p>{" "}
              <br />
              {terminal.map((line, index) => (
                <p style={{ fontSize: "18px" }} key={index}>
                  {line}
                </p>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Ground;
