import { Navigate } from "react-router-dom";
import { useAutenticacao } from "./useAutenticacao";

export default function RotaPrivada({ children }) {
  const { usuario } = useAutenticacao();

  // Se o usuário não estiver autenticado, volta para login
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  // Se estiver autenticado, mostra o conteúdo
  return children;
}
