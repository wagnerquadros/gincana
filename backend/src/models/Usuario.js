const RoleEnum = require("../enums/RoleEnum");

class Usuario {
  id;
  nome;
  foto;
  email;
  senha;
  role;
  ativo;
  criadoEm;

  constructor(id, nome, foto, email, senha, role, ativo) {
    this.id = id;
    this.nome = nome;
    this.foto = foto;
    this.email = email;
    this.senha = senha;
    this.role = role;
    this.ativo = ativo;
    this.criadoEm = new Date();
  }

  toObject() {
    return {
      id: this.id,
      nome: this.nome,
      foto: this.foto,
      email: this.email,
      senha: this.senha,
      role: this.role,
      ativo: this.ativo,
      criadoEm: this.criadoEm,
    };
  }

  static fromDoc(doc) {
    if (!doc.exists) return null;
    const d = doc.data();
    return new Usuario(
      doc.id,
      d.nome,
      d.foto,
      d.email,
      d.senha,
      d.role,
      d.ativo,
      d.criadoEm?.toDate ? d.criadoEm.toDate() : d.criadoEm
    );
  }
}

module.exports = Usuario;
