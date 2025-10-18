const TipoAtividadeEnum = require("./enums/TipoAtividadeEnum");
const StatusAtividadeEnum = require("./enums/StatusAtividadeEnum");

class Atividade {
  id;
  gincana;
  titulo;
  descricao;
  tipo;
  inicio;
  fim;
  pontosPrimeiro;
  pontosSegundo;
  pontosTerceiro;
  criterios;
  statusAtividade;
  ativa;
  criadoEm;
  atualizadoEm;

  constructor(
    id,
    gincana,
    titulo,
    descricao,
    tipo,
    inicio,
    fim,
    pontosPrimeiro,
    pontosSegundo,
    pontosTerceiro,
    criterios,
    statusAtividade,
    ativa
  ) {
    this.id = id;
    this.gincana = gincana;
    this.titulo = titulo;
    this.descricao = descricao;
    this.tipo = tipo;
    this.inicio = new Date(inicio);
    this.fim = new Date(fim);
    this.pontosPrimeiro = pontosPrimeiro;
    this.pontosSegundo = pontosSegundo;
    this.pontosTerceiro = pontosTerceiro;
    this.criterios = criterios;
    this.statusAtividade = statusAtividade;
    this.ativa = ativa;
    this.criadoEm = new Date();
    this.atualizadoEm = new Date();
  }

  toObject() {
    return {
      id: this.id,
      gincana: this.gincana,
      titulo: this.titulo,
      descricao: this.descricao,
      tipo: this.tipo,
      inicio: this.inicio,
      fim: this.fim,
      pontosPrimeiro: this.pontosPrimeiro,
      pontosSegundo: this.pontosSegundo,
      pontosTerceiro: this.pontosTerceiro,
      criterios: this.criterios,
      statusAtividade: this.statusAtividade,
      ativa: this.ativa,
      criadoEm: this.criadoEm,
      atualizadoEm: this.atualizadoEm,
    };
  }

  static fromDoc(doc) {
    if (!doc.exists) return null;
    const d = doc.data();
    return new Atividade(
      doc.id,
      d.gincanaId,
      d.titulo,
      d.descricao,
      d.tipo,
      d.inicio?.toDate ? d.inicio.toDate() : d.inicio,
      d.fim?.toDate ? d.fim.toDate() : d.fim,
      d.pontosPrimeiro,
      d.pontosSegundo,
      d.pontosTerceiro,
      d.criterios,
      d.statusAtividade,
      d.ativa,
      d.criadoEm?.toDate ? d.criadoEm.toDate() : d.criadoEm,
      d.atualizadoEm?.toDate ? d.atualizadoEm.toDate() : d.atualizadoEm
    );
  }
}

module.exports = Atividade;
