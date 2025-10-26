import { useState, useMemo } from "react";
import { ContextoAutenticacao } from "./ContextoAutenticacao";
import api from "../api/client"; // usa axios configurado

export function ProvedorAutenticacao({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  });

  async function entrar(email, senha) {
    const resposta = await api.post("/auth/login", { email, password: senha });
    localStorage.setItem("token", resposta.data.token);
    localStorage.setItem("usuario", JSON.stringify(resposta.data.user));
    setUsuario(resposta.data.user);
  }

  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  }

  const valor = useMemo(() => ({ usuario, entrar, sair }), [usuario]);

  return (
    <ContextoAutenticacao.Provider value={valor}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}
