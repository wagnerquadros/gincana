// src/models/Equipe.js
class Equipe {
  id;
  gincanaId;
  nome;
  ativo;
  pontuacoesIds;
  criadoEm;
  atualizadoEm;

  // 👇 adiciona criadoEm/atualizadoEm como params opcionais
  constructor(
    id,
    gincanaId,
    nome,
    ativo = true,
    pontuacoesIds = [],
    criadoEm = null,
    atualizadoEm = null
  ) {
    this.id = id;
    this.gincanaId = gincanaId; 
    this.nome = nome;
    this.ativo = !!ativo;
    this.pontuacoesIds = Array.isArray(pontuacoesIds) ? pontuacoesIds : [];
    // 👇 usa o valor vindo do BD; se não houver, mantém null (não inventa data agora)
    this.criadoEm = criadoEm || null;
    this.atualizadoEm = atualizadoEm || null;
  }

  toObject() {
    return {
      id: this.id,
      gincanaId: this.gincanaId,
      nome: this.nome,
      ativo: this.ativo,
      pontuacoesIds: this.pontuacoesIds,
      criadoEm: this.criadoEm,
      atualizadoEm: this.atualizadoEm,
    };
  }

  static fromDoc(doc) {
    if (!doc.exists) return null;
    const d = doc.data();

    const criadoEm =
      d.criadoEm?.toDate ? d.criadoEm.toDate() : d.criadoEm ?? null;
    const atualizadoEm =
      d.atualizadoEm?.toDate ? d.atualizadoEm.toDate() : d.atualizadoEm ?? null;

    return new Equipe(
      doc.id,
      d.gincanaId,
      d.nome,
      d.ativo,
      d.pontuacoesIds || [],
      criadoEm,
      atualizadoEm
    );
  }
}
module.exports = Equipe;