import React, { useState, useEffect } from 'react';

const ChatInterface = () => {
  // State for messages and input
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // LOAD messages from sessionStorage when component starts
  useEffect(() => {
    console.log('Loading messages from sessionStorage...');
    const saved = sessionStorage.getItem('chatMessages');
    if (saved) {
      const parsedMessages = JSON.parse(saved);
      setMessages(parsedMessages);
      console.log('Messages loaded:', parsedMessages.length);
    }
  }, []);

  // SAVE messages to sessionStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('chatMessages', JSON.stringify(messages));
      console.log('Messages saved to sessionStorage');
    }
  }, [messages]);

  // Send a new message
  const sendMessage = () => {
    if (inputText.trim() !== '') {
      const newMessage = {
        id: Date.now(),
        text: inputText,
        timestamp: new Date().toLocaleTimeString(),
        sender: 'user'
      };

      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInputText(''); // Clear input
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Clear all messages
  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem('chatMessages');
    console.log('Chat cleared');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h2>Chat Interface</h2>
      
      {/* Messages Display */}
      <div style={{ 
        border: '1px solid #ccc', 
        height: '400px', 
        overflowY: 'scroll', 
        padding: '10px', 
        marginBottom: '10px',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.length === 0 ? (
          <p style={{ color: '#666' }}>No messages yet. Start chatting!</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} style={{ 
              marginBottom: '10px', 
              padding: '8px',
              backgroundColor: 'white',
              borderRadius: '5px',
              border: '1px solid #eee'
            }}>
              <strong>{message.sender}:</strong> {message.text}
              <div style={{ fontSize: '12px', color: '#666' }}>
                {message.timestamp}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px'
          }}
        />
        <button 
          onClick={sendMessage}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </div>

      {/* Clear Button */}
      <button 
        onClick={clearChat}
        style={{
          padding: '8px 16px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Clear Chat
      </button>

      {/* Debug Info */}
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>Messages: {messages.length}</p>
        <p>✅ Refreshing page will keep messages</p>
        <p>✅ Closing tab will clear messages</p>
      </div>
    </div>
  );
};

export default ChatInterface;