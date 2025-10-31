// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProvedorAutenticacao } from "./auth/AuthProvider";

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
import MeuPerfil from "./pages/prof/MeuPerfil";

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
            {/* ADM e PROFESSOR têm o mesmo acesso */}
            <Route index element={<DashboardProf />} />
            <Route path="dashboard" element={<DashboardProf />} />
            <Route path="gincana" element={<GincanaProf />} />
            <Route path="equipes" element={<EquipesProf />} />
            <Route path="atividades" element={<AtividadesProf />} />
            <Route path="meu-perfil" element={<MeuPerfil />} />

            {/* Staff (ADM ou Professor) – sua rota já libera ambos */}
            <Route
              path="usuarios"
              element={
                <RotaSomenteStaff>
                  <UsuariosAdmin />
                </RotaSomenteStaff>
              }
            />

            <Route path="*" element={<Navigate to="/prof/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ProvedorAutenticacao>
  );
}
