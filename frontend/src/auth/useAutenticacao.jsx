/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import api from "../api/client";

const AutenticacaoContext = createContext(null);

export function ProvedorAutenticacao({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const dadosSalvos = localStorage.getItem("usuario");
    return dadosSalvos ? JSON.parse(dadosSalvos) : null;
  });

  async function entrar(email, senha) {
    const { data } = await api.post("/auth/login", {
      email,
      password: senha,
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.user));
    setUsuario(data.user);
  }

  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  }

  return (
    <AutenticacaoContext.Provider value={{ usuario, entrar, sair }}>
      {children}
    </AutenticacaoContext.Provider>
  );
}

export function useAutenticacao() {
  return useContext(AutenticacaoContext);
}
