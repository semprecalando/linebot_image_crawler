import React from 'react';
import { FC } from 'react';
import logo from './logo.svg';
import './App.css';
import GalleryPage from './pages/GalleryPage';

const App: FC = () => {
  return (
    <div className="App">
      <GalleryPage />
    </div>
  );
}

export default App;
