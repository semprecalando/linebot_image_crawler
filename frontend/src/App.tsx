import React from 'react';
import { FC } from 'react';
import logo from './logo.svg';
import './App.css';
import CorkboardPage from './pages/CorkboardPage';

const App: FC = () => {
  return (
    <div className="App">
      <CorkboardPage />
    </div>
  );
}

export default App;
