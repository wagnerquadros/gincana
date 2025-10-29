import { Navigate } from "react-router-dom";
import { useAutenticacao } from "./useAutenticacao";

export default function RotaPrivada({ children }) {
  const { usuario, carregando } = useAutenticacao();
  if (carregando) return null; // ou um loader
  return usuario ? children : <Navigate to="/" replace />;
}