import React, { useState, useRef, useEffect } from "react";
import './index.css';

const App = () => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const surpriseOptions = [
    'Who won the latest Nobel Peace Prize?',
    'Where does pizza come from?',
    'How do you make a BLT sandwich?',
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const surprise = () => {
    const randomValue = surpriseOptions[Math.floor(Math.random() * surpriseOptions.length)];
    setValue(randomValue);
  };

  const cleanResponse = (text) => {
    return text.replace(/[*]/g, '').trim();
  };

  const getResponse = async () => {
    if (!value.trim()) {
      setError("Please enter a question!");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify({
          history: chatHistory,
          message: value,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const response = await fetch('http://localhost:8000/gemini', options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const cleanedResponse = cleanResponse(data.response);
      setChatHistory((oldChatHistory) => [
        ...oldChatHistory,
        {
          role: 'user',
          parts: value,
        },
        {
          role: 'model',
          parts: cleanedResponse,
        },
      ]);
      setValue("");
    } catch (error) {
      console.error(error);
      setError("Something went wrong! Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    setValue("");
    setError("");
    setChatHistory([]);
  };

  return (
    <div className="app-container">
      <div className="chat-interface">
        <h1>Gemini AI Chat</h1>
        <div className="chat-history" ref={chatContainerRef}>
          {chatHistory.map((chatItem, index) => (
            <div key={index} className={`chat-item ${chatItem.role}`}>
              <div className="chat-bubble">
                <p className="parts">{chatItem.parts}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="input-area">
          <div className="input-container">
            <input
              value={value}
              placeholder="Ask Gemini anything..."
              onChange={(e) => setValue(e.target.value)}
              disabled={isLoading}
              onKeyPress={(e) => e.key === 'Enter' && getResponse()}
            />
            <button className="send-button" onClick={getResponse} disabled={isLoading}>
              {isLoading ? "Thinking..." : "Send"}
            </button>
          </div>
          <div className="action-buttons">
            <button className="surprise-button" onClick={surprise} disabled={isLoading}>
              Surprise Me
            </button>
            <button className="clear-button" onClick={clear} disabled={isLoading}>
              Clear Chat
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default App;