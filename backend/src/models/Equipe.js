class Equipe {
  id;
  gincana;
  nome;
  ativo;
  pontuacoes;
  criadoEm;
  atualizadoEm;

  constructor(id, gincana, nome, ativo, pontuacoes = []) {
    this.id = id;
    this.gincana = gincana;
    this.nome = nome;
    this.ativo = ativo;
    this.pontuacoes = pontuacoes;
    this.criadoEm = new Date();
    this.atualizadoEm = new Date();
  }

  toObject() {
    return {
      id: this.id,
      gincana: this.gincana?.toObject ? this.gincana.toObject() : this.gincana,
      nome: this.nome,
      ativo: this.ativo,
      pontuacoes: this.pontuacoes.map((p) => (p.toObject ? p.toObject() : p)),
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
      d.criadoEm?.toDate ? d.criadoEm.toDate() : d.criadoEm,
      d.atualizadoEm?.toDate ? d.atualizadoEm.toDate() : d.atualizadoEm
    );
  }
}

module.exports = Equipe;
