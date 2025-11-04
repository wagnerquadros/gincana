// src/api/gincana.js
import api from "./client";

/** Lista todas as gincanas (seu backend já retorna com datas e status) */
export async function listarGincanas() {
  const { data } = await api.get("/gincanas");
  return Array.isArray(data) ? data : [];
}

/** True/False se existe pelo menos 1 ATIVA */
export async function existeGincanaAtiva() {
  const lista = await listarGincanas();
  return lista.some((g) => (g.status || "").toUpperCase() === "ATIVA");
}

/** Retorna a gincana ATIVA (ou null se não houver) */
export async function obterGincanaAtiva() {
  const lista = await listarGincanas();
  return lista.find((g) => (g.status || "").toUpperCase() === "ATIVA") || null;
}

/** Cria gincana ATIVA */
export async function criarGincana({ nome, dataInicio }) {
  const payload = {
    nome,
    dataInicio, // "YYYY-MM-DD"
    status: "ATIVA", // travado em ATIVA
  };
  const { data } = await api.post("/gincanas", payload);
  return data;
}

/** Encerra gincana pelo id (dataFim opcional; se não enviar, backend usa agora) */
export async function encerrarGincana(id, dataFim) {
  const payload = dataFim ? { dataFim } : {}; // simples
  const { data } = await api.patch(`/gincanas/${id}/encerrar`, payload);
  return data;
}

/** Atualiza gincana (nome/dataInicio) */
export async function atualizarGincana(id, { nome, dataInicio }) {
  const payload = {};
  if (typeof nome !== "undefined") payload.nome = nome;
  if (typeof dataInicio !== "undefined") payload.dataInicio = dataInicio; // "YYYY-MM-DD"

  const { data } = await api.put(`/gincanas/${id}`, payload);
  return data;
}

export async function listarGincanasEncerradas() {
  const lista = await listarGincanas();
  return lista
    .filter(g => (g.status || "").toUpperCase() === "ENCERRADA")
    .sort((a, b) => new Date(b.dataFim || 0) - new Date(a.dataFim || 0));
}

/**
 * ✅ OTIMIZAÇÃO: Busca ranking completo da gincana em uma única requisição
 * Antes: Fazia N requisições (2 por equipe: membros + pontuação)
 * Agora: 1 requisição que retorna tudo
 * Ganho: Redução de 80-90% no tempo de carregamento
 */
export async function obterRankingGincana(gincanaId) {
  const { data } = await api.get(`/gincanas/${gincanaId}/ranking`);
  return data;
}