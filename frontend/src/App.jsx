// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import EquipesGestor from "./pages/EquipesGestor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/equipes" element={<EquipesGestor />} />
        <Route path="*" element={<Navigate to="/equipes" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
