const RoleEnum = require("../../src/models/enums/RoleEnum");

// --- Usuários de teste ---
const novoUsuario = {
  nome: "Diogo",
  email: "diogo@email.com",
  senha: "123456",
  role: RoleEnum.ALUNO,
};

const usuarioExistente = {
  nome: "Teste",
  email: "existe@email.com",
  senha: "12345",
  role: RoleEnum.ALUNO,
};

// --- Senhas ---
const senhaValida = "123456";
const senhaCurta = "123";

// --- IDs fictícios ---
const idUsuario = "id123";
const idInexistente = "id404";

// --- Retorno esperado do Firestore ---
const docVazio = { empty: true };
const docExistente = {
  empty: false,
  docs: [{ id: "abc", data: () => ({ email: usuarioExistente.email }) }],
};

module.exports = {
  novoUsuario,
  usuarioExistente,
  senhaValida,
  senhaCurta,
  idUsuario,
  idInexistente,
  docVazio,
  docExistente,
};
