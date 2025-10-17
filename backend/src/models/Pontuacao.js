class Pontuacao {
  id;
  equipe;
  atividade;
  pontosObtidos;
  bonus;
  penalidade;
  criadoEm;

  constructor(id, equipe, atividade, pontosObtidos, bonus, penalidade) {
    this.id = id;
    this.equipe = equipe;
    this.atividade = atividade;
    this.pontosObtidos = pontosObtidos;
    this.bonus = bonus;
    this.penalidade = penalidade;
    this.criadoEm = new Date();
  }

  toObject() {
    return {
      id: this.id,
      equipe: this.equipe?.toObject ? this.equipe.toObject() : this.equipe,
      atividade: this.atividade?.toObject
        ? this.atividade.toObject()
        : this.atividade,
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
      d.penalidade,
      d.criadoEm?.toDate ? d.criadoEm.toDate() : d.criadoEm
    );
  }
}

module.exports = Pontuacao;
