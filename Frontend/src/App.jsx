import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import Picker from 'emoji-picker-react';

// const socket = io('http://localhost:5000');
const socket = io('https://chat-app-1cam.onrender.com');


function App() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [isNameEntered, setIsNameEntered] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on('receiveMessage', (msg) => {
      setChat((prevChat) => [...prevChat, msg]);
    });

    socket.on('chatHistory', (history) => {
      setChat(history);
    });

    socket.on('updateUserCount', (count) => {
      setUserCount(count);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('chatHistory');
      socket.off('updateUserCount');
    };
  }, [isNameEntered]);

  const submitName = () => {
    if (name.trim()) {
      setIsNameEntered(true);
    }
  };

  const sendMessage = useCallback(() => {
    if (message.trim() && name.trim()) {
      const timestamp = new Date().toISOString();
      const messageData = { name, message, created_at: timestamp };
      socket.emit('sendMessage', messageData);
      setMessage('');
      console.log(messageData);
    } else {
      console.error('Name or message is undefined or empty');
    }
  }, [message, name]);

  const onEmojiClick = (emojiObject) => {
    if (emojiObject && emojiObject.emoji) {
      setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    } else {
      console.error('Emoji object is undefined or invalid:', emojiObject);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && message.trim()) {
        sendMessage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sendMessage, message]);

  const formatDate = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Scroll to the bottom of the chat container when chat updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [chat]);

  return (
    <div className='bg-gray-700 w-screen h-screen flex items-center justify-center'>
      <div className="flex flex-col max-w-4xl w-full h-full bg-gray-800">
        <p className="text-white text-center py-4 bg-gray-400">Users online: {userCount}</p>

        <div className='chatBox bg-white h-full overflow-y-auto p-4 flex flex-col'>
          {chat.map((msg, index) => (
            <div
              key={index}
              className={`my-2 p-2 rounded ${msg.name === name ? 'self-end bg-blue-100 text-right' : 'self-start bg-gray-200 text-left'}`}
            >
              <strong className={`block ${msg.name === name ? 'text-blue-500' : 'text-gray-700'}`}>{msg.name}:</strong>
              {msg.message}
              <p className="text-xs text-gray-500 mt-1">{formatDate(msg.created_at)}</p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {isNameEntered ? (
          <div className="w-full max-w-md p-4 flex flex-col">
            <div className="message-input mb-4 flex-grow">
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
              <button
                className="emoji-button bg-gray-300 py-2 px-4 rounded ml-2"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                😊
              </button>
            </div>
            {showEmojiPicker && (
              <Picker onEmojiClick={onEmojiClick} />
            )}
          </div>
        ) : (
          <div className="w-full max-w-md p-4">
            <h2 className="text-xl font-bold mb-2">Enter Your Name</h2>
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
        )}
      </div>
    </div>
  );
}

export default App;
