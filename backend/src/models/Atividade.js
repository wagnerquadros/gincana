const TipoAtividadeEnum = require("./enums/TipoAtividadeEnum");
const StatusAtividadeEnum = require("./enums/StatusAtividadeEnum");

// helper de datas seguro
const toDate = (v) => {
  if (!v) return null;
  if (v?.toDate) return v.toDate();
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

class Atividade {
  id;
  gincanaId;
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
    gincanaId,
    titulo,
    descricao,
    tipo,
    inicio,
    fim,
    pontosPrimeiro = 0,
    pontosSegundo = 0,
    pontosTerceiro = 0,
    criterios = [],
    statusAtividade = StatusAtividadeEnum.ABERTA,
    ativa = true
  ) {
    this.id = id;
    this.gincanaId = gincanaId;
    this.titulo = titulo;
    this.descricao = descricao || null;
    this.tipo = tipo;
    this.inicio = toDate(inicio);
    this.fim = toDate(fim);
    this.pontosPrimeiro = Number(pontosPrimeiro) || 0;
    this.pontosSegundo = Number(pontosSegundo) || 0;
    this.pontosTerceiro = Number(pontosTerceiro) || 0;
    this.criterios = Array.isArray(criterios)
      ? criterios
      : criterios
      ? [criterios]
      : [];
    this.statusAtividade = statusAtividade;
    this.ativa = !!ativa;
    this.criadoEm = new Date();
    this.atualizadoEm = new Date();
  }

  toObject() {
    return {
      id: this.id,
      gincanaId: this.gincanaId,
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
      d.inicio,
      d.fim,
      d.pontosPrimeiro,
      d.pontosSegundo,
      d.pontosTerceiro,
      d.criterios,
      d.statusAtividade,
      d.ativa
    );
  }
}

module.exports = Atividade;
