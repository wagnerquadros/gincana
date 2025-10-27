// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProvedorAutenticacao } from "./auth/useAutenticacao";
import Login from "./pages/Login";
import CadastroAluno from "./pages/CadastroAluno";

import ProfessorLayout from "./layouts/ProfessorLayout";
import RotaPrivada from "./auth/RotaPrivada";
import RotaSomenteADM from "./auth/RotaSomenteADM";

import DashboardProf from "./pages/prof/DashboardProf";
import GincanaProf from "./pages/prof/GincanaProf";
import EquipesProf from "./pages/prof/EquipesProf";
import AtividadesProf from "./pages/prof/AtividadesProf";
import RankingProf from "./pages/prof/RankingProf";
import SetupAdmin from "./pages/prof/SetupAdmin";
import GerenciamentoAdmin from "./pages/prof/GerenciamentoAdmin";

export default function App() {
  return (
    <ProvedorAutenticacao>
      <BrowserRouter>
        <Routes>
          {/* público */}
          <Route path="/" element={<Login />} />
          <Route path="/cadastro-aluno" element={<CadastroAluno />} />

          {/* painel do professor/adm */}
          <Route
            path="/prof"
            element={
              <RotaPrivada>
                <ProfessorLayout />
              </RotaPrivada>
            }
          >
            {/* Só ADM */}
            <Route
              path="gerenciamento"
              element={
                <RotaSomenteADM>
                  <GerenciamentoAdmin />
                </RotaSomenteADM>
              }
            />
            <Route
              path="setup"
              element={
                <RotaSomenteADM>
                  <SetupAdmin />
                </RotaSomenteADM>
              }
            />

            {/* Comuns */}
            <Route path="dashboard" element={<DashboardProf />} />
            <Route path="gincana" element={<GincanaProf />} />
            <Route path="equipes" element={<EquipesProf />} />
            <Route path="atividades" element={<AtividadesProf />} />
            <Route path="ranking" element={<RankingProf />} />
            <Route index element={<DashboardProf />} />
          </Route>

          {/* fallback */}
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </ProvedorAutenticacao>
  );
}
