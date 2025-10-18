const StatusGincanaEnum = require("./enums/StatusGincanaEnum");

class Gincana {
  id;
  nome;
  dataInicio;
  dataFim;
  anoReferencia;
  status;
  createdAt;
  updatedAt;

  constructor(id, nome, dataInicio, dataFim, anoReferencia, status) {
    this.id = id;
    this.nome = nome;
    this.dataInicio = new Date(dataInicio);
    this.dataFim = new Date(dataFim);
    this.anoReferencia = anoReferencia;
    this.status = status;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  toObject() {
    return {
      id: this.id,
      nome: this.nome,
      dataInicio: this.dataInicio,
      dataFim: this.dataFim,
      anoReferencia: this.anoReferencia,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromDoc(doc) {
    if (!doc.exists) return null;
    const d = doc.data();
    return new Gincana(
      doc.id,
      d.nome,
      d.dataInicio?.toDate ? d.dataInicio.toDate() : d.dataInicio,
      d.dataFim?.toDate ? d.dataFim.toDate() : d.dataFim,
      d.anoReferencia,
      d.status,
      d.createdAt?.toDate ? d.createdAt.toDate() : d.createdAt,
      d.updatedAt?.toDate ? d.updatedAt.toDate() : d.updatedAt
    );
  }
}

module.exports = Gincana;
