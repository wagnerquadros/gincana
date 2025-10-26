const bcrypt = require("bcrypt");
const { db } = require("../../../firebase");
const usuariosService = require("../../../src/services/usuariosService");
const {
  novoUsuario,
  usuarioExistente,
  senhaValida,
  senhaCurta,
  idUsuario,
  idInexistente,
  docVazio,
  docExistente,
} = require("../../data/usuariosData");

// mocks firebase e bcrypt
jest.mock("../../../firebase", () => ({ db: { collection: jest.fn() } }));
jest.mock("bcrypt");

describe("UsuariosService", () => {
  let collectionMock, docMock, getMock, setMock, whereMock, limitMock, orderByMock;

  beforeEach(() => {
    setMock = jest.fn();
    getMock = jest.fn();
    docMock = jest.fn(() => ({ id: idUsuario, get: getMock, set: setMock }));
    whereMock = jest.fn(() => ({ limit: limitMock }));
    limitMock = jest.fn(() => ({ get: getMock }));
    orderByMock = jest.fn(() => ({ limit: limitMock }));
    collectionMock = jest.fn(() => ({
      doc: docMock,
      get: getMock,
      where: whereMock,
      orderBy: orderByMock,
      limit: limitMock,
    }));
    db.collection.mockImplementation(collectionMock);
  });

  afterEach(() => jest.clearAllMocks());

  describe("createUsuario()", () => {
    it("deve criar usuário novo com hash de senha", async () => {
      getMock.mockResolvedValue(docVazio);
      bcrypt.hash.mockResolvedValue("hashed123");

      const res = await usuariosService.createUsuario(novoUsuario);

      expect(db.collection).toHaveBeenCalledWith("usuarios");
      expect(setMock).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(novoUsuario.senha, expect.any(Number));
      expect(res).toMatchObject({
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        role: novoUsuario.role,
      });
      expect(res).not.toHaveProperty("senha");
    });

    it("deve lançar erro se faltar campos obrigatórios", async () => {
      await expect(usuariosService.createUsuario({ nome: "Apenas Nome" })).rejects.toThrow(
        "Campos obrigatórios"
      );
    });

    it("deve lançar erro se email já existir", async () => {
      getMock.mockResolvedValue(docExistente);

      await expect(usuariosService.createUsuario(usuarioExistente)).rejects.toThrow(
        "E-mail já cadastrado"
      );
    });
  });

  describe("updateSenha()", () => {
    it("deve atualizar a senha com hash", async () => {
      bcrypt.hash.mockResolvedValue("hashNova");

      const res = await usuariosService.updateSenha(idUsuario, senhaValida);

      expect(res).toBe(true);
      expect(bcrypt.hash).toHaveBeenCalledWith(senhaValida, expect.any(Number));
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({ senha: "hashNova" }),
        { merge: true }
      );
    });

    it("deve lançar erro se senha for curta", async () => {
      await expect(usuariosService.updateSenha(idUsuario, senhaCurta)).rejects.toThrow(
        "A senha deve ter pelo menos 6 caracteres"
      );
    });
  });

  describe("softDelete()", () => {
    it("deve desativar usuário existente", async () => {
      getMock.mockResolvedValueOnce({ exists: true, id: idUsuario, data: () => ({}) });
      const res = await usuariosService.softDelete(idUsuario);
      expect(res).toBe(true);
      expect(setMock).toHaveBeenCalledWith(expect.objectContaining({ ativo: false }), { merge: true });
    });

    it("deve lançar erro se usuário não existir", async () => {
      getMock.mockResolvedValueOnce({ exists: false });
      await expect(usuariosService.softDelete(idInexistente)).rejects.toThrow(
        "Usuário não encontrado"
      );
    });
  });
});
