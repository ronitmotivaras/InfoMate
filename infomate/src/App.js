import React, { useEffect } from 'react';
import InfoMate from './InfoMate';
import { initializeFirestore } from './utils/initializeFirestore';
import './index.css';

function App() {
  useEffect(() => {
    // Initialize Firestore data (runs once)
    initializeFirestore();
  }, []);

  return (
    <div className="App">
      <InfoMate />
    </div>
  );
}

export default App;