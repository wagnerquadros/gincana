import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAutenticacao } from "../auth/useAutenticacao";
import { existeGincanaAtiva } from "../api/gincana";
import "../styles/Login.css";

export default function Login() {
  const { entrar } = useAutenticacao();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      // 1) autentica
      await entrar(email, senha);

      // 2) checa no backend se há gincana ATIVA
      const temAtiva = await existeGincanaAtiva();

      // 3) decide rota
      if (temAtiva) {
        navigate("/prof/dashboard");
      } else {
        navigate("/prof/gincana");
      }
    } catch (err) {
      console.error(err);
      setErro("Não foi possível entrar. Verifique e-mail e senha.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card" role="dialog" aria-labelledby="titulo-login">
        {/* Ícone da taça */}
        <div className="trophy-wrap" aria-hidden="true">
          <svg
            className="trophy"
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 21h8" />
            <path d="M12 17v4" />
            <path d="M7 4h10v3a5 5 0 0 1-10 0V4Z" />
            <path d="M5 7a3 3 0 0 1-3-3h3" />
            <path d="M19 7a3 3 0 0 0 3-3h-3" />
          </svg>
        </div>

        <h1 id="titulo-login" className="login-title">
          Gincanas Escolares
        </h1>
        <p className="login-subtitle">Entre na sua conta</p>

        {erro && <div className="alert-erro">{erro}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <label className="label" htmlFor="senha">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            placeholder="********"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            autoComplete="current-password"
          />

          <button type="submit" className="btn-login" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="login-foot">
          Não tem uma conta?{" "}
          <Link to="/cadastro-aluno" className="link-cadastro">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
