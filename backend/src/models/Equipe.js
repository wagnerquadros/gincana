class Equipe {
  id;
  gincanaId;
  nome;
  ativo;
  pontuacoesIds;
  criadoEm;
  atualizadoEm;

  constructor(id, gincanaId, nome, ativo = true, pontuacoesIds = []) {
    this.id = id;
    this.gincanaId = gincanaId;
    this.nome = nome;
    this.ativo = !!ativo;
    this.pontuacoesIds = Array.isArray(pontuacoesIds) ? pontuacoesIds : [];
    this.criadoEm = new Date();
    this.atualizadoEm = new Date();
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
    return new Equipe(
      doc.id,
      d.gincanaId,
      d.nome,
      d.ativo,
      d.pontuacoesIds || []
    );
  }
}

module.exports = Equipe;
