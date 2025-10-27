class Pontuacao {
  id;
  equipeId;
  atividadeId;
  pontosObtidos;
  bonus;
  penalidade;
  criadoEm;

  constructor(
    id,
    equipeId,
    atividadeId,
    pontosObtidos = 0,
    bonus = 0,
    penalidade = 0
  ) {
    this.id = id;
    this.equipeId = equipeId;
    this.atividadeId = atividadeId;
    this.pontosObtidos = pontosObtidos || 0;
    this.bonus = bonus || 0;
    this.penalidade = penalidade || 0;
    this.criadoEm = new Date();
  }

  toObject() {
    return {
      id: this.id,
      equipeId: this.equipeId,
      atividadeId: this.atividadeId,
      pontosObtidos: this.pontosObtidos,
      bonus: this.bonus,
      penalidade: this.penalidade,
      criadoEm: this.criadoEm,
    };
  }

  static fromDoc(doc) {
    if (!doc.exists) return null;
    const d = doc.data();
    return new Pontuacao(
      doc.id,
      d.equipeId,
      d.atividadeId,
      d.pontosObtidos,
      d.bonus,
      d.penalidade
    );
  }
}

module.exports = Pontuacao;
