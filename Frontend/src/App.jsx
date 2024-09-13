import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://chat-app-1cam.onrender.com');

function App() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [isNameEntered, setIsNameEntered] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on('receiveMessage', (msg) => {
      setChat((prevChat) => [...prevChat, msg]);
    });

    socket.on('chatHistory', (history) => {
      setChat(history); // Load chat history when the user connects
    });

    socket.on('updateUserCount', (count) => {
      setUserCount(count);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('chatHistory');
      socket.off('updateUserCount');
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const submitName = () => {
    if (name.trim()) {
      setIsNameEntered(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      const messageData = { name, message };
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
          <p className="text-gray-600 mb-2">Users online: {userCount}</p>
          <div className="chat-box border p-4 my-4 h-64 overflow-auto bg-gray-100">
            {chat.map((msg, index) => (
              <div key={index} className="my-2">
                <strong className="text-blue-500">{msg.name}:</strong> {msg.message}
              </div>
            ))}
            <div ref={chatEndRef} />
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
