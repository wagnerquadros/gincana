class Equipe {
  id;
  gincanaId;
  nome;
  ativo;
  pontuacoes;
  criadoEm;
  atualizadoEm;

  constructor(id, gincanaId, nome, ativo, pontuacoes = []) {
    this.id = id;
    this.gincanaId = gincanaId;
    this.nome = nome;
    this.ativo = !!ativo;
    this.pontuacoes = pontuacoes;
    this.criadoEm = criadoEm;
    this.atualizadoEm = atualizadoEm;
  }

  toObject() {
    return {
      id: this.id,
      gincanaId: this.gincanaId,
      nome: this.nome,
      ativo: this.ativo,
      pontuacoes: this.pontuacoes.map((p) => ({
        id: p.id || null,
        equipeId: p.equipeId,
        atividadeId: p.atividadeId,
        pontosObtidos: p.pontosObtidos || 0,
        bonus: p.bonus || 0,
        penalidade: p.penalidade || 0,
        criadoEm: p.criadoEm || new Date(),
      })),
      criadoEm: this.criadoEm,
      atualizadoEm: this.atualizadoEm,
    };
  }

  static fromDoc(doc) {
    if (!doc.exists) return null;
    const d = doc.data();
    return new Equipe(doc.id, d.gincanaId, d.nome, d.ativo, d.pontuacoes || []);
  }
}

module.exports = Equipe;
