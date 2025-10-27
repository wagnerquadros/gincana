const request = require("supertest");
const BASE_URL = "http://localhost:3000";

const { 
  validCombos, 
  invalidCombos, 
  getRandomValidCombo, 
  getRandomInvalidCombo 
} = require("../data/authData");

const { isSuccess, isClientError, isServerError } = require("../utils/statusHelpers");

describe("🧩 E2E - Auth /login", () => {

  describe("✅ Logins válidos (fixos)", () => {
    test.each(validCombos)("POST /auth/login com credenciais válidas (%o)", async (payload) => {
      const res = await request(BASE_URL).post("/auth/login").send(payload);
      expect(isSuccess(res.statusCode)).toBe(true);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(payload.email);
    });
  });

  describe("❌ Logins inválidos (fixos)", () => {
    test.each(invalidCombos)("POST /auth/login com credenciais inválidas (%o)", async (payload) => {
      const res = await request(BASE_URL).post("/auth/login").send(payload);
      expect(isClientError(res.statusCode)).toBe(true);
      expect(res.body).not.toHaveProperty("token");
    });
  });

  describe("✅ Logins válidos aleatórios", () => {
    it("POST /auth/login com credenciais válidas aleatórias", async () => {
      const payload = getRandomValidCombo();
      const res = await request(BASE_URL).post("/auth/login").send(payload);
      expect(isSuccess(res.statusCode)).toBe(true);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(payload.email);
    });
  });

  describe("❌ Logins inválidos aleatórios", () => {
    it("POST /auth/login com credenciais inválidas aleatórias", async () => {
      const payload = getRandomInvalidCombo();
      const res = await request(BASE_URL).post("/auth/login").send(payload);
      expect(isClientError(res.statusCode)).toBe(true);
      expect(res.body).not.toHaveProperty("token");
    });
  });

  describe("⚠️ Casos extras", () => {
    it("deve retornar erro se o corpo não for JSON", async () => {
      const res = await request(BASE_URL)
        .post("/auth/login")
        .set("Content-Type", "text/plain")
        .send("email=teste&password=123");
      expect(isClientError(res.statusCode) || isServerError(res.statusCode)).toBe(true);
    });

    it("deve retornar erro se o corpo for vazio", async () => {
      const res = await request(BASE_URL).post("/auth/login").send({});
      expect(isClientError(res.statusCode)).toBe(true);
    });

    it("deve retornar erro se faltar senha", async () => {
      const res = await request(BASE_URL)
        .post("/auth/login")
        .send({ email: validCombos[0].email });
      expect(isClientError(res.statusCode)).toBe(true);
    });

    it("deve retornar erro se faltar email", async () => {
      const res = await request(BASE_URL)
        .post("/auth/login")
        .send({ password: validCombos[0].password });
      expect(isClientError(res.statusCode)).toBe(true);
    });
  });

});
