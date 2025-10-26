// src/api/equipes.js
import api from "./client";

// Lista equipes
export async function listarEquipes() {
    const { data } = await api.get("/equipes");
    return Array.isArray(data) ? data : [];
}

// Detalhes de uma equipe
export async function obterEquipe(id) {
    const { data } = await api.get(`/equipes/${id}`);
    return data;
}

// Cria equipe (sempre ativo: true)
export async function criarEquipe({ nome, gincanaId }) {
    const payload = { nome, gincanaId, ativo: true };
    const { data } = await api.post("/equipes", payload);
    return data;
}

// Atualiza equipe (vamos permitir mudar gincanaId e ativo)
export async function atualizarEquipe(id, payload) {
    const { data } = await api.put(`/equipes/${id}`, payload);
    return data;
}

// (Opcional) Pontuação da equipe — se o endpoint ainda não existir, só ignoramos
export async function obterPontuacaoEquipe(id) {
    try {
        const { data } = await api.get(`/equipes/${id}/pontuacao`);
        return typeof data?.pontuacao === "number" ? data.pontuacao : null;
    } catch {
        return null; // endpoint ainda não existe
    }
}
