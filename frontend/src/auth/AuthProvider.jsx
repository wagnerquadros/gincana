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

    async function entrar(email, senha) {
        const { data } = await api.post("/auth/login", { email, password: senha });
        const token = data?.token;
        if (token) localStorage.setItem("token", token);

        let bruto = data?.user ?? data?.usuario ?? null;
        if (!bruto) {
            try {
                const me = await api.get("/auth/me");
                bruto = me.data;
            } catch {
                bruto = data ?? null;
            }
        }

        const userNorm = normalizarUsuario(bruto);
        localStorage.setItem("usuario", JSON.stringify(userNorm));
        setUsuario(userNorm);

        return userNorm; // <- IMPORTANTE: retornar o usuário!
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
