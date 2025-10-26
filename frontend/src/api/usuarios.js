// src/api/usuarios.js
import api from "./client";

// Lista todos os usuários — ADM e PROF usam a MESMA rota
export async function listarUsuarios() {
  const { data } = await api.get("/usuarios");
  return Array.isArray(data) ? data : [];
}

// Obter um usuário
export async function obterUsuario(id) {
  const { data } = await api.get(`/usuarios/${id}`);
  return data;
}

// Atualizar usuário (sem alterar role)
export async function atualizarUsuario(id, payload) {
  const { data } = await api.put(`/usuarios/${id}`, payload);
  return data;
}

export async function criarUsuario(payload) {
  const { data } = await api.post("/usuarios", payload);
  return data;
}

export async function inativarUsuario(id) {
  const { data } = await api.delete(`/usuarios/${id}`);
  return data;
}