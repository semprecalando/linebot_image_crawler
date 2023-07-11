import React from 'react';
import { FC } from 'react';
import logo from './logo.svg';
import './App.css';
import SlideshowPage from './pages/SlideshowPage';

const App: FC = () => {
  return (
    <div className="App">
      <SlideshowPage />
    </div>
  );
}

export default App;
