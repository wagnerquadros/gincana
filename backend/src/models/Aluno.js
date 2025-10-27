const RoleEnum = require("./enums/RoleEnum");

class Aluno {
  id;
  usuario;
  equipe;
  criadoEm;

  constructor(id, usuario, equipe) {
    this.id = id;
    this.usuario = usuario;
    this.usuario.role = RoleEnum.ALUNO;
    this.equipe = equipe;
    this.criadoEm = new Date();
  }

  toObject() {
    return {
      id: this.id,
      usuario: this.usuario.toObject ? this.usuario.toObject() : this.usuario,
      equipe: this.equipe,
      criadoEm: this.criadoEm,
    };
  }

  static fromDoc(doc) {
    if (!doc.exists) return null;
    const d = doc.data();
    return new Aluno(
      doc.id,
      d.usuarioId,
      d.equipeId,
      d.criadoEm?.toDate ? d.criadoEm.toDate() : d.criadoEm
    );
  }
}

module.exports = Aluno;
