// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CodeForm from './components/CodeForm';
import CodeEntriesTable from './components/CodeEntriesTable';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CodeForm />} />
        <Route path="/entries" element={<CodeEntriesTable />} />
      </Routes>
    </Router>
  );
}

export default App;
