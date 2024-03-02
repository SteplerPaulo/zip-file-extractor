import React from 'react';
import './App.css';
import FileUploaderPage from './pages/FileUploaderPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<FileUploaderPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

