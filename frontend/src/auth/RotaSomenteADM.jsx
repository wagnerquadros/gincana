import { Navigate } from "react-router-dom";
import { useAutenticacao } from "./useAutenticacao";

export default function RotaSomenteADM({ children }) {
  const { usuario, carregando } = useAutenticacao();
  if (carregando) return null;
  if (!usuario) return <Navigate to="/" replace />;

  const role = (usuario.role || "").toUpperCase();
  return role === "ADM" ? children : <Navigate to="/prof/dashboard" replace />;
}
