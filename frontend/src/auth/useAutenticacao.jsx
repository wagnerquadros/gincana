/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AutenticacaoContext = createContext(null);

export function ProvedorAutenticacao({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // valida sessão rapidamente (opcional: ping em /auth/me)
    setCarregando(false);
  }, []);

  async function entrar(email, senha) {
    const { data } = await api.post("/auth/login", { email, password: senha });
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.user));
    setUsuario(data.user);
  }

  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  }

  const value = useMemo(() => ({ usuario, carregando, entrar, sair }), [usuario, carregando]);

  return (
    <AutenticacaoContext.Provider value={value}>
      {children}
    </AutenticacaoContext.Provider>
  );
}

export function useAutenticacao() {
  return useContext(AutenticacaoContext);
}
