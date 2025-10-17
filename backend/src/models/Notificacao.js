const TipoNotificacaoEnum = require("../enums/TipoNotificacaoEnum");
const StatusNotificacaoEnum = require("../enums/StatusNotificacaoEnum");

class Notificacao {
  id;
  gincana;
  atividade;
  tipo;
  titulo;
  corpo;
  enviadaEm;
  status;

  constructor(id, gincana, atividade, tipo, titulo, corpo, enviadaEm, status) {
    this.id = id;
    this.gincana = gincana;
    this.atividade = atividade;
    this.tipo = tipo;
    this.titulo = titulo;
    this.corpo = corpo;
    this.enviadaEm = enviadaEm ? new Date(enviadaEm) : new Date();
    this.status = status;
  }

  toObject() {
    return {
      id: this.id,
      gincana: this.gincana?.toObject ? this.gincana.toObject() : this.gincana,
      atividade: this.atividade?.toObject
        ? this.atividade.toObject()
        : this.atividade,
      tipo: this.tipo,
      titulo: this.titulo,
      corpo: this.corpo,
      enviadaEm: this.enviadaEm,
      status: this.status,
    };
  }

  static fromDoc(doc) {
    if (!doc.exists) return null;
    const d = doc.data();
    return new Notificacao(
      doc.id,
      d.gincanaId,
      d.atividadeId || null,
      d.tipo,
      d.titulo,
      d.corpo,
      d.enviadaEm?.toDate ? d.enviadaEm.toDate() : d.enviadaEm,
      d.status
    );
  }
}

module.exports = Notificacao;
