// src/auth/AuthProvider.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { AutenticacaoContext } from "./AutenticacaoContext";

function normalizarUsuario(u) {
    if (!u) return null;
    const id = u.id ?? u.uid ?? u._id ?? u.userId ?? null;
    return {
        id,
        nome: u.nome ?? u.name ?? "",
        email: u.email ?? "",
        role: (u.role ?? "").toUpperCase(),
        foto: u.foto ?? null,
        ativo: u.ativo ?? true,
        ...u,
    };
}

export function ProvedorAutenticacao({ children }) {
    const [usuario, setUsuario] = useState(() => {
        const salvo = localStorage.getItem("usuario");
        return salvo ? normalizarUsuario(JSON.parse(salvo)) : null;
    });
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        setCarregando(false);
    }, []);

    // payload que você mostrou:
    // { token, user: { id, email, nome, role } }
    async function entrar(email, senha) {
        const { data } = await api.post("/auth/login", { email, password: senha });
        const token = data?.token;
        const userRaw = data?.user ?? data?.usuario ?? null;

        if (token) localStorage.setItem("token", token);

        const userNorm = normalizarUsuario(userRaw);
        localStorage.setItem("usuario", JSON.stringify(userNorm));
        setUsuario(userNorm);
    }

    function sair() {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setUsuario(null);
    }

    const value = useMemo(
        () => ({ usuario, carregando, entrar, sair }),
        [usuario, carregando]
    );

    return (
        <AutenticacaoContext.Provider value={value}>
            {children}
        </AutenticacaoContext.Provider>
    );
}
