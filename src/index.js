// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import MedicalRecords from './components/MedicalRecords';
import DataEntry from './components/DataEntry';
import Navbar from './components/Navbar';
import Home from './components/Home';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/medical-records" element={<MedicalRecords />} />
        <Route path="/data-entry" element={<DataEntry />} />
        {/* Add more routes or a default route as needed */}
      </Routes>
    </Router>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
