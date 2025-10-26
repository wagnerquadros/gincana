import { Navigate } from "react-router-dom";
import { useAutenticacao } from "./useAutenticacao";

/**
 * Garante acesso apenas para role ADM.
 * Uso:
 * <RotaSomenteADM><Componente/></RotaSomenteADM>
 */
export default function RotaSomenteADM({ children }) {
  const { usuario, carregando } = useAutenticacao();

  if (carregando) return null; // ou um loader

  // não autenticado → volta para login
  if (!usuario) return <Navigate to="/" replace />;

  // apenas ADM acessa
  const role = (usuario.role || "").toUpperCase();
  if (role !== "ADM") {
    return <Navigate to="/prof/dashboard" replace />;
  }

  return children;
}
