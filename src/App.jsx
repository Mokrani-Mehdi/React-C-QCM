import React, { useState, useEffect } from 'react';

import Quiz from './Components/Quiz'
import Login from './Components/Login';
import NavBar from './Components/NavBar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      <NavBar/>
      {isLoggedIn ? (
        <Quiz />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}
export default App