// src/api/usuarios.js
import api from "./client";

export async function obterUsuario(id) {
  const r = await api.get(`/usuarios/${id}`);
  return r.data;
}

export async function listarUsuarios() {
  const r = await api.get("/usuarios");
  return r.data;
}

export async function criarUsuario(dados) {
  const r = await api.post("/usuarios", dados);
  return r.data;
}

export async function atualizarUsuario(id, dados) {
  const r = await api.put(`/usuarios/${id}`, dados);
  return r.data;
}

/** Helper: torna URL relativa em absoluta usando a base do axios */
export function absolutizarUrlTalvez(urlRelativaOuAbsoluta) {
  if (!urlRelativaOuAbsoluta) return null;
  if (/^https?:\/\//i.test(urlRelativaOuAbsoluta)) return urlRelativaOuAbsoluta;
  const base = (api.defaults.baseURL || "").replace(/\/+$/, "");
  const path = urlRelativaOuAbsoluta.startsWith("/")
    ? urlRelativaOuAbsoluta
    : `/${urlRelativaOuAbsoluta}`;
  return `${base}${path}`;
}

/** Envio de foto: POST /usuarios/:id/foto (campo "foto") */
export async function atualizarFotoUsuario(id, arquivo) {
  const form = new FormData();
  form.append("foto", arquivo);

  const r = await api.post(`/usuarios/${id}/foto`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const data = r.data || {};
  return {
    ...data,
    urlAbsoluta: absolutizarUrlTalvez(data.url),
    usuario: data.usuario
      ? { ...data.usuario, foto: absolutizarUrlTalvez(data.usuario.foto) }
      : undefined,
  };
}

/**
 * Alterar senha do usuário
 * PATCH /usuarios/:id/senha
 * Body: { senhaAtual, novaSenha, confirmarNovaSenha }
 */
export async function atualizarSenhaUsuario(
  id,
  { senhaAtual, novaSenha, confirmarNovaSenha }
) {
  const r = await api.patch(`/usuarios/${id}/senha`, {
    senhaAtual,
    novaSenha,
    confirmarNovaSenha,
  });
  return r.data;
}
