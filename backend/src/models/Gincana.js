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

  // aceite createdAt/updatedAt para preservar quando vier do Firestore
  constructor(
    id,
    nome,
    dataInicio,
    dataFim,
    anoReferencia,
    status,
    createdAt,
    updatedAt
  ) {
    this.id = id ?? null;
    this.nome = nome ?? null;
    this.dataInicio = dataInicio ? new Date(dataInicio) : null;
    this.dataFim = dataFim ? new Date(dataFim) : null;
    this.anoReferencia =
      typeof anoReferencia !== "undefined" ? anoReferencia : null;
    this.status = status ?? "ATIVA";
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
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
