import { Navigate } from "react-router-dom";
import { useAutenticacao } from "./useAutenticacao";

export default function RotaSomenteStaff({ children }) {
  const { usuario, carregando } = useAutenticacao();
  if (carregando) return null;
  if (!usuario) return <Navigate to="/" replace />;

  const role = (usuario?.role || "").toUpperCase();
  if (role === "ADM" || role === "PROFESSOR") return children;

  return <Navigate to="/prof/dashboard" replace />;
}
