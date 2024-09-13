import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://chat-app-1cam.onrender.com');

function App() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [isNameEntered, setIsNameEntered] = useState(false);

  // Listen for incoming messages and chat history
  useEffect(() => {
    socket.on('receiveMessage', (msg) => {
      setChat((prevChat) => [...prevChat, msg]);
      console.log(msg);
    });

    socket.on('chatHistory', (history) => {
      setChat(history); // Load chat history when the user connects
      console.log(history);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('chatHistory');
    };
  }, []);

  const submitName = () => {
    if (name.trim()) {
      setIsNameEntered(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      const messageData = { name, message: message };
      socket.emit('sendMessage', messageData);
      setMessage('');
    }
  };

  return (
    <div className="chat-app p-4 max-w-md mx-auto">
      {!isNameEntered ? (
        <div className="name-entry">
          <h2 className="text-xl font-bold">Enter Your Name</h2>
          <input
            type="text"
            className="border p-2 w-full mb-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded"
            onClick={submitName}
          >
            Join Chat
          </button>
        </div>
      ) : (
        <div>
          <h1 className="text-xl font-bold">Chat App</h1>
          <div className="chat-box border p-4 my-4 h-64 overflow-auto">
            {chat.map((msg, index) => (
              <div key={index} className="my-2">
                <strong>{msg.name}:</strong> {msg.message}
              </div>
            ))}
          </div>
          <input
            className="border p-2 w-full mb-2"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
          />
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
