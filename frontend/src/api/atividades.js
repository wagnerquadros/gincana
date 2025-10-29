
import api from "./client";

// Atualiza campos de uma atividade
export async function atualizarAtividade(id, payload) {
    const { data } = await api.put(`/atividades/${id}`, payload);
    return data;
}

export async function criarAtividade(payload) {
    const { data } = await api.post("/atividades", payload);
    return data;
}

