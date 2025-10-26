// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProvedorAutenticacao } from "./auth/useAutenticacao";

import Login from "./pages/Login";
import CadastroAluno from "./pages/CadastroAluno";

import ProfessorLayout from "./layouts/ProfessorLayout";
import RotaPrivada from "./auth/RotaPrivada";
import RotaSomenteStaff from "./auth/RotaSomenteStaff";

import DashboardProf from "./pages/prof/DashboardProf.jsx";
import GincanaProf from "./pages/prof/GincanaProf";
import EquipesProf from "./pages/prof/EquipesProf";
import AtividadesProf from "./pages/prof/AtividadesProf";
import UsuariosAdmin from "./pages/prof/UsuariosAdmin";


export default function App() {
  return (
    <ProvedorAutenticacao>
      <BrowserRouter>
        <Routes>
          {/* Público */}
          <Route path="/" element={<Login />} />
          <Route path="/cadastro-aluno" element={<CadastroAluno />} />

          {/* Painel do professor/adm */}
          <Route
            path="/prof"
            element={
              <RotaPrivada>
                <ProfessorLayout />
              </RotaPrivada>
            }
          >
            {/* Acesso para ADM e PROFESSOR */}
            <Route
              path="usuarios"
              element={
                <RotaSomenteStaff>
                  <UsuariosAdmin />
                </RotaSomenteStaff>
              }
            />

            {/* Rotas comuns */}
            <Route path="dashboard" element={<DashboardProf />} />
            <Route path="gincana" element={<GincanaProf />} />
            <Route path="equipes" element={<EquipesProf />} />
            <Route path="atividades" element={<AtividadesProf />} />

            {/* Rota padrão ao entrar em /prof */}
            <Route index element={<DashboardProf />} />

            {/* Fallback interno de /prof */}
            <Route path="*" element={<Navigate to="/prof/dashboard" replace />} />
          </Route>

          {/* Fallback global */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ProvedorAutenticacao>
  );
}
