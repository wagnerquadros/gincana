import api from "./client";

// Retorna o usuário atual autenticado (inclui equipeId atualizado)
export async function obterMeuUsuario() {
    const { data } = await api.get("/auth/me");
    return data;
}
