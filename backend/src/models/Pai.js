const RoleEnum = require("./enums/RoleEnum");

class Pai {
  id;
  usuario;
  aluno;
  criadoEm;

  constructor(id, usuario, aluno) {
    this.id = id;
    this.usuario = usuario;
    this.usuario.role = RoleEnum.PAI;
    this.aluno = aluno;
    this.criadoEm = new Date();
  }

  toObject() {
    return {
      id: this.id,
      usuario: this.usuario.toObject ? this.usuario.toObject() : this.usuario,
      aluno: this.aluno.toObject ? this.aluno.toObject() : this.aluno,
      criadoEm: this.criadoEm,
    };
  }

  static fromDoc(doc) {
    if (!doc.exists) return null;
    const d = doc.data();
    return new Pai(
      doc.id,
      d.usuarioId,
      d.alunoId,
      d.criadoEm?.toDate ? d.criadoEm.toDate() : d.criadoEm
    );
  }
}

module.exports = Pai;
