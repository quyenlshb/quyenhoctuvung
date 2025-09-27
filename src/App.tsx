import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
// import các page khác khi cần
// import Learn from './components/LearningMode';
// import Vocabulary from './components/VocabularyManager';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar bên trái */}
        <Sidebar />

        {/* Nội dung chính */}
        <div className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Các route khác */}
            {/* <Route path="/learn" element={<Learn />} /> */}
            {/* <Route path="/vocabulary" element={<Vocabulary />} /> */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
