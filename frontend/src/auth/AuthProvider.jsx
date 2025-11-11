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
        
        // Se não tiver usuário completo na resposta, busca do backend
        // Isso garante que temos informações completas como equipeId
        if (!bruto || !bruto.id) {
            try {
                const me = await api.get("/auth/me");
                bruto = me.data?.user || me.data;
            } catch {
                // Se /auth/me falhar, tenta buscar pelo ID do token
                if (data?.user?.id) {
                    try {
                        const usuarioCompleto = await api.get(`/usuarios/${data.user.id}`);
                        bruto = usuarioCompleto.data;
                    } catch {
                        bruto = data ?? null;
                    }
                } else {
                    bruto = data ?? null;
                }
            }
        } else {
            // Se já temos o ID, busca dados completos do usuário para ter equipeId
            try {
                const usuarioCompleto = await api.get(`/usuarios/${bruto.id}`);
                bruto = usuarioCompleto.data;
            } catch {
                // Se falhar, usa o que já temos
                console.warn("Não foi possível buscar dados completos do usuário");
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

    function atualizarUsuario(usuarioAtualizado) {
        const userNorm = normalizarUsuario(usuarioAtualizado);
        localStorage.setItem("usuario", JSON.stringify(userNorm));
        setUsuario(userNorm);
    }

    const value = useMemo(
        () => ({ usuario, carregando, entrar, sair, atualizarUsuario }),
        [usuario, carregando]
    );

    return (
        <AutenticacaoContext.Provider value={value}>
            {children}
        </AutenticacaoContext.Provider>
    );
}
