import { Navigate } from "react-router-dom";
import { useAutenticacao } from "./useAutenticacao";

export default function RotaSomenteAluno({ children }) {
    const { usuario, carregando } = useAutenticacao();

    if (carregando) return null; // opcional: loading spinner
    if (!usuario) return <Navigate to="/" replace />;

    const role = (usuario.role || "").toUpperCase();
    // permite ALUNO (e, se quiser, ADM/PROF também enxergarem as páginas do aluno, deixe aqui)
    if (role === "ALUNO") return children;

    // fallback para o painel do professor/adm
    return <Navigate to="/prof/dashboard" replace />;
}
