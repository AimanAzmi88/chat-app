import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your server URL

const Chat = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Listen for incoming messages
    socket.on('receiveMessage', (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    // Fetch initial chat history
    socket.on('chatHistory', (chatHistory) => {
      setMessages(chatHistory);
    });

    // Clean up on component unmount
    return () => {
      socket.off('receiveMessage');
      socket.off('chatHistory');
    };
  }, []);

  const handleSendMessage = () => {
    if (name && message) {
      socket.emit('sendMessage', { name, text: message });
      setMessage('');
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.name}:</strong> {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;
