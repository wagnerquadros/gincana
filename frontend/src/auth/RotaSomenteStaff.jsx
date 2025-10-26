import { Navigate } from "react-router-dom";
import { useAutenticacao } from "./useAutenticacao";

export default function RotaSomenteStaff({ children }) {
  const { usuario } = useAutenticacao();
  const role = (usuario?.role || "").toUpperCase();

  // Permite ADM e PROFESSOR; bloqueia ALUNO (e outros)
  if (role === "ADM" || role === "PROFESSOR") {
    return children;
  }

  // redireciona aluno (ou não logado) para o dashboard
  return <Navigate to="/prof/dashboard" replace />;
}
