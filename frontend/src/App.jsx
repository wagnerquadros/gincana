import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProvedorAutenticacao } from "./auth/AuthProvider";

import Login from "./pages/Login";
import CadastroAluno from "./pages/CadastroAluno";

import ProfessorLayout from "./layouts/ProfessorLayout";
import AlunoLayout from "./layouts/AlunoLayout";

import RotaPrivada from "./auth/RotaPrivada";
import RotaSomenteStaff from "./auth/RotaSomenteStaff";
import RotaSomenteAluno from "./auth/RotaSomenteAluno";

import DashboardProf from "./pages/prof/DashboardProf.jsx";
import GincanaProf from "./pages/prof/GincanaProf";
import EquipesProf from "./pages/prof/EquipesProf";
import AtividadesProf from "./pages/prof/AtividadesProf";
import UsuariosAdmin from "./pages/prof/UsuariosAdmin";
import MeuPerfil from "./pages/prof/MeuPerfil";

// páginas do aluno
import DashboardAluno from "./pages/aluno/DashboardAluno";
import GincanaAluno from "./pages/aluno/GincanaAluno";
import MinhaEquipe from "./pages/aluno/MinhaEquipe";
import AtividadesAluno from "./pages/aluno/AtividadesAluno";
import MeuPerfilAluno from "./pages/aluno/MeuPerfilAluno";
import RankingAluno from "./pages/aluno/RankingAluno";

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
            {/* Rotas comuns (PROFESSOR e ADM) */}
            <Route index element={<DashboardProf />} />
            <Route path="dashboard" element={<DashboardProf />} />
            <Route path="gincana" element={<GincanaProf />} />
            <Route path="equipes" element={<EquipesProf />} />
            <Route path="atividades" element={<AtividadesProf />} />
            <Route path="meu-perfil" element={<MeuPerfil />} />

            {/* Somente STAFF/ADM */}
            <Route
              path="usuarios"
              element={
                <RotaSomenteStaff>
                  <UsuariosAdmin />
                </RotaSomenteStaff>
              }
            />

            {/* Fallback interno de /prof */}
            <Route path="*" element={<Navigate to="/prof/dashboard" replace />} />
          </Route>

          {/* Painel do aluno */}
          <Route
            path="/aluno"
            element={
              <RotaPrivada>
                <RotaSomenteAluno>
                  <AlunoLayout />
                </RotaSomenteAluno>
              </RotaPrivada>
            }
          >
            <Route index element={<DashboardAluno />} />
            <Route path="dashboard" element={<DashboardAluno />} />
            <Route path="gincana" element={<GincanaAluno />} />
            <Route path="/aluno/ranking" element={<RankingAluno />} />
            <Route path="minha-equipe" element={<MinhaEquipe />} />
            <Route path="atividades" element={<AtividadesAluno />} />
            <Route path="perfil" element={<MeuPerfilAluno />} />

            <Route path="*" element={<Navigate to="/aluno/dashboard" replace />} />
          </Route>

          {/* Fallback global */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ProvedorAutenticacao>
  );
}
