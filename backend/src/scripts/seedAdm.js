// src/scripts/seedAdm.js
const bcrypt = require("bcrypt");
const { db } = require("../../firebase.js");

const RoleEnum = require("../models/enums/RoleEnum");

const EMAIL_ADM = process.env.ADMIN_EMAIL || "admin@escola.com";
const SENHA_ADM = process.env.ADMIN_PASSWORD || "123123";
const SALT = 12;
const COLECAO = "usuarios";

async function executar() {
  try {
    // 1) verifica se já existe ADM com esse email
    const qs = await db
      .collection(COLECAO)
      .where("email", "==", EMAIL_ADM.toLowerCase().trim())
      .limit(1)
      .get();

    if (!qs.empty) {
      const doc = qs.docs[0];
      console.log(`ADM já existe: ${doc.id} (${EMAIL_ADM})`);
      return;
    }

    // 2) cria hash
    const hash = await bcrypt.hash(SENHA_ADM, SALT);

    // 3) cria doc
    const ref = db.collection(COLECAO).doc(); // id auto
    const payload = {
      id: ref.id,
      nome: "Administrador",
      foto: null,
      email: EMAIL_ADM.toLowerCase().trim(),
      senha: hash, // armazenado criptografado
      role: RoleEnum.ADM, // "ADM"
      ativo: true,
      criadoEm: new Date(),
    };

    await ref.set(payload);
    console.log(`ADM criado com sucesso: ${EMAIL_ADM} (id=${ref.id})`);
  } catch (e) {
    console.error("Erro ao criar ADM:", e.message);
    process.exit(1);
  }
}

executar();
