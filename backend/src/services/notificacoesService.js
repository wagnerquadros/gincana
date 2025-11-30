const { db } = require("../../firebase");

const COLL = "notificacoes";

function isStr(v) { return typeof v === "string" && v.trim().length > 0; }

async function criarNotificacao({ gincanaId, atividadeId = null, tipo, titulo, corpo, status = "PENDENTE" }) {
  if (!db) throw new Error("Firebase não inicializado");
  if (!isStr(gincanaId)) throw new Error("gincanaId é obrigatório");
  if (!isStr(tipo)) throw new Error("tipo é obrigatório");
  if (!isStr(titulo)) throw new Error("titulo é obrigatório");
  if (!isStr(corpo)) throw new Error("corpo é obrigatório");

  const ref = db.collection(COLL).doc();
  const payload = {
    id: ref.id,
    gincanaId: gincanaId.trim(),
    atividadeId: atividadeId ? String(atividadeId).trim() : null,
    tipo,
    titulo,
    corpo,
    enviadaEm: new Date(),
    status,
  };
  await ref.set(payload);
  return payload;
}

async function listarNotificacoes({ gincanaId, limit = 50 } = {}) {
  if (!db) throw new Error("Firebase não inicializado");
  let q = db.collection(COLL);
  if (isStr(gincanaId)) q = q.where("gincanaId", "==", gincanaId.trim());
  q = q.orderBy("enviadaEm", "desc");
  if (limit) q = q.limit(Number(limit) || 50);
  let snap;
  try {
    snap = await q.get();
  } catch (e) {
    snap = await db.collection(COLL).get();
  }
  const lista = snap.docs.map((d) => {
    const v = d.data() || {};
    let dt = null;
    try {
      const maybe = v.enviadaEm?.toDate
        ? v.enviadaEm.toDate()
        : (v.enviadaEm instanceof Date ? v.enviadaEm : new Date(v.enviadaEm));
      if (maybe instanceof Date && !isNaN(maybe)) dt = maybe;
    } catch {}
    return {
      id: d.id,
      gincanaId: v.gincanaId,
      atividadeId: v.atividadeId || null,
      tipo: v.tipo,
      titulo: v.titulo,
      corpo: v.corpo,
      enviadaEm: dt ? dt.toISOString() : null,
      status: v.status,
    };
  });
  lista.sort((a, b) => {
    const ta = a.enviadaEm ? new Date(a.enviadaEm).getTime() : 0;
    const tb = b.enviadaEm ? new Date(b.enviadaEm).getTime() : 0;
    return tb - ta;
  });
  return lista;
}

module.exports = { criarNotificacao, listarNotificacoes };