import React from "react";
import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import { Statistics } from './pages/Statistics'
import { AuthProvider } from "./components/AuthProvider";
import { Shell } from "./components/Shell";

export default function App() {
  return (
    <AuthProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Shell>
    </AuthProvider>
  );
}
