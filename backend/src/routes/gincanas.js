const express = require("express");
const router = express.Router();
const { db } = require("../../firebase");
const Gincana = require("../models/Gincana");
const { converterData, formatarData } = require("../utils/date");
const { calcularRankingGincana } = require("../services/ranking");

//POST /gincana
router.post("/", async (req, res) => {
  try {
    const ref = db.collection("gincanas").doc();
    const { nome, dataInicio, dataFim, anoReferencia, status } = req.body;

    const di = converterData(dataInicio);
    const df = converterData(dataFim);

    const g = new Gincana(
      ref.id,
      nome,
      typeof di === "undefined" ? new Date() : di,
      df ?? null,
      anoReferencia,
      status || "ATIVA"
    );

    await ref.set(g.toObject());
    const created = Gincana.fromDoc(await ref.get());
    res.status(201).json(created?.toObject ? created.toObject() : created);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

//PUT /gincana/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const ref = db.collection("gincanas").doc(id);
    const snap = await ref.get();
    if (!snap.exists)
      return res.status(404).json({ erro: "Gincana não encontrada" });

    const current = snap.data();
    const { nome, dataInicio, dataFim, anoReferencia, status } = req.body;

    const di = converterData(dataInicio);
    const df = converterData(dataFim);

    const payload = {
      id,
      nome: typeof nome !== "undefined" ? nome : current.nome,
      dataInicio: typeof di === "undefined" ? current.dataInicio : di,
      dataFim: typeof df === "undefined" ? current.dataFim : df,
      anoReferencia:
        typeof anoReferencia !== "undefined"
          ? anoReferencia
          : current.anoReferencia,
      status: typeof status !== "undefined" ? status : current.status,
      createdAt: current.createdAt,
      updatedAt: new Date(),
    };

    await ref.set(payload, { merge: true });

    const updated = Gincana.fromDoc(await ref.get());
    res.json(updated?.toObject ? updated.toObject() : updated);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// GET por ID — /gincana/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("gincanas").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ erro: "Gincana não encontrada" });
    }

    const g = Gincana.fromDoc(doc);
    let gObj = g?.toObject ? g.toObject() : g;

    if (gObj.dataInicio)
      gObj.dataInicio = formatarData(new Date(gObj.dataInicio));
    if (gObj.dataFim) gObj.dataFim = formatarData(new Date(gObj.dataFim));

    res.json(gObj);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: e.message });
  }
});

// ENCERRAR GINCANA (PATCH /gincanas/:id/encerrar)
router.patch("/:id/encerrar", async (req, res) => {
  try {
    const { id } = req.params;
    const { dataFim } = req.body;

    const ref = db.collection("gincanas").doc(id);
    const snap = await ref.get();
    if (!snap.exists)
      return res.status(404).json({ erro: "Gincana não encontrada" });

    const gincanaAtual = snap.data();

    // Converte a data de fim — se não for enviada, usa a data atual
    const novaDataFim = converterData(dataFim) ?? new Date();

    const payload = {
      status: "ENCERRADA",
      dataFim: novaDataFim,
      updatedAt: new Date(),
    };

    await ref.set(payload, { merge: true });

    const updated = Gincana.fromDoc(await ref.get());
    let gObj = updated?.toObject ? updated.toObject() : updated;

    // Formata datas no retorno
    if (gObj.dataInicio)
      gObj.dataInicio = formatarData(new Date(gObj.dataInicio));
    if (gObj.dataFim) gObj.dataFim = formatarData(new Date(gObj.dataFim));

    res.json(gObj);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: e.message });
  }
});

// DELETAR GINCANA (DELETE /gincanas/:id) - Altera para inativa
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const ref = db.collection("gincanas").doc(id);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.status(404).json({ erro: "Gincana não encontrada" });
    }

    const payload = {
      status: "INATIVA",
      dataFim: new Date(),
      updatedAt: new Date(),
    };

    await ref.set(payload, { merge: true });

    res.json({ ok: true, mensagem: "Gincana inativada com sucesso." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: e.message });
  }
});

// GET /gincanas — listar todas as gincanas
router.get("/", async (_req, res) => {
  try {
    const snap = await db
      .collection("gincanas")
      .orderBy("createdAt", "desc")
      .get();

    const lista = snap.docs.map((doc) => {
      const g = Gincana.fromDoc(doc);
      let gObj = g?.toObject ? g.toObject() : g;

      // Formata datas no retorno
      if (gObj.dataInicio)
        gObj.dataInicio = formatarData(new Date(gObj.dataInicio));
      if (gObj.dataFim) gObj.dataFim = formatarData(new Date(gObj.dataFim));

      return gObj;
    });

    res.json(lista);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: e.message });
  }
});

module.exports = router;

// GET /gincanas/:id/ranking — calcula e retorna ranking atual
router.get("/:id/ranking", async (req, res) => {
  try {
    const { id } = req.params;
    const ranking = await calcularRankingGincana(id);
    res.json({ gincanaId: id, ranking });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: e.message });
  }
});
