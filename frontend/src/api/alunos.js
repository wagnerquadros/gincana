import api from "./client";

/** Entrar na equipe: PATCH /alunos/:id/equipe { equipeId } */
export async function entrarNaEquipeDoAluno(alunoId, equipeId) {
    const r = await api.patch(`/alunos/${alunoId}/equipe`, { equipeId });
    return r.data; // esperado: { ok: true, aluno: {...} }
}

/** Sair da equipe: PATCH /alunos/:id/equipe { equipeId: null } */
export async function sairDaEquipeDoAluno(alunoId) {
    const r = await api.patch(`/alunos/${alunoId}/equipe`, { equipeId: null });
    return r.data; // esperado: { ok: true, aluno: {...} }
}
