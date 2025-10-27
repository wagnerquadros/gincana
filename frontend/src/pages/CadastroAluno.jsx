import { useState } from "react";
import api from "../api/client";
import "../styles/CadastroAluno.css";
import { useNavigate, Link } from "react-router-dom";

export default function CadastroAluno() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const navigate = useNavigate();

  async function handleCadastro(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    try {
      const novoAluno = {
        nome,
        email,
        senha,
        role: "ALUNO",
        ativo: true,
      };

      await api.post("/auth/signup", novoAluno);
      setSucesso("Cadastro realizado com sucesso!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error("Erro no cadastro:", err);
      setErro("Não foi possível realizar o cadastro.");
    }
  }

  return (
    <div className="cadastro-bg">
      <div
        className="cadastro-card"
        role="dialog"
        aria-labelledby="titulo-cadastro"
      >
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

        <h1 id="titulo-cadastro" className="cadastro-title">
          Cadastro de Aluno
        </h1>
        <p className="cadastro-subtitle">
          Preencha os campos para se cadastrar
        </p>

        {erro && <div className="alert-erro">{erro}</div>}
        {sucesso && <div className="alert-sucesso">{sucesso}</div>}

        <form onSubmit={handleCadastro} className="cadastro-form">
          <label className="label" htmlFor="nome">
            Nome completo
          </label>
          <input
            id="nome"
            type="text"
            placeholder="Seu nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

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
          />

          <label className="label" htmlFor="confirmarSenha">
            Confirmar senha
          </label>
          <input
            id="confirmarSenha"
            type="password"
            placeholder="********"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />

          <button type="submit" className="btn-cadastro">
            Cadastrar
          </button>
        </form>

        <p className="cadastro-foot">
          Já tem uma conta?{" "}
          <Link to="/" className="link-login">
            Entre
          </Link>
        </p>
      </div>
    </div>
  );
}
