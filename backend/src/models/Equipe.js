class Equipe {
  constructor(id, gincana, nome, ativo, pontuacoes = [], criadoEm = new Date(), atualizadoEm = new Date()) {
    this.id = id;
    this.gincana = gincana; 
    this.nome = nome;
    this.ativo = ativo;
    this.pontuacoes = pontuacoes;
    this.criadoEm = criadoEm;
    this.atualizadoEm = atualizadoEm;
  }

  toObject() {
    return {
      id: this.id,
      gincana: typeof this.gincana === "object" ? this.gincana.id : this.gincana,
      nome: this.nome,
      ativo: this.ativo,
      pontuacoes: this.pontuacoes.map((p) => (p.id ? p.id : p)),
      criadoEm: this.criadoEm,
      atualizadoEm: this.atualizadoEm,
    };
  }

  static fromDoc(doc) {
    if (!doc.exists) return null;
    const d = doc.data();
    return new Equipe(
      doc.id,
      d.gincana, // aqui pega o campo correto do Firestore
      d.nome,
      d.ativo,
      d.pontuacoes || [],
      d.criadoEm?.toDate ? d.criadoEm.toDate() : d.criadoEm,
      d.atualizadoEm?.toDate ? d.atualizadoEm.toDate() : d.atualizadoEm
    );
  }
}

module.exports = Equipe;
