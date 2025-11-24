// src/pages/prof/EquipesProf.jsx
import { useEffect, useMemo, useState } from "react";
import {
  listarEquipes,
  criarEquipe,
  atualizarEquipe,
  obterEquipe,
} from "../../api/equipes";
import { obterGincanaAtiva } from "../../api/gincana";
import api from "../../api/client";
import "../../styles/Equipes.css";

export default function EquipesProf() {
  // ===== State =====
  const [gincanaAtiva, setGincanaAtiva] = useState(null);

  const [equipes, setEquipes] = useState([]); // [{id, nome, ativo, gincanaId, gincanaNome, criadoEm?}]
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("ATIVOS"); // ATIVOS | INATIVOS | TODOS

  // enrichment
  const [membrosAtivos, setMembrosAtivos] = useState({}); // { [equipeId]: number }
  const [pontuacaoTotal, setPontuacaoTotal] = useState({}); // { [equipeId]: number }

  // feedback
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [salvando, setSalvando] = useState(false);

  // modais
  const [modalCriar, setModalCriar] = useState(false);
  const [nova, setNova] = useState({ nome: "", gincanaId: "" });

  const [modalEditar, setModalEditar] = useState(false);
  const [edicao, setEdicao] = useState({ id: "", nome: "", gincanaId: "" });

  // ===== Effects =====
  useEffect(() => {
    (async () => {
      await carregarBase();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarBase() {
    setErro("");
    setOk("");
    try {
      const ativa = await obterGincanaAtiva();
      setGincanaAtiva(ativa || null);

      const data = await listarEquipes();
      const normalizadas = (data || []).map((e) => ({
        id: e.id,
        nome: e.nome || "",
        ativo: !!e.ativo,
        gincanaId: e.gincanaId || e.gincana?.id || "",
        gincanaNome: e.gincana?.nome || "",
        criadoEm: e.criadoEm || e.createdAt || null,
      }));
      setEquipes(normalizadas);

      // Enriquecimento assíncrono (membros ativos e pontuação total)
      await enriquecer(normalizadas, ativa?.id);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar as equipes/gincana ativa.");
    }
  }

  // Busca dados auxiliares para cada equipe
  async function enriquecer(lista, gincanaId) {
    const membrosProms = lista.map(async (eq) => {
      try {
        const { data } = await api.get(`/equipes/${eq.id}/membros/contagem`);
        return { id: eq.id, ativos: Number(data?.totalAtivos || 0) };
      } catch {
        return { id: eq.id, ativos: 0 };
      }
    });

    const pontosProms = lista.map(async (eq) => {
      if (!gincanaId) return { id: eq.id, total: 0 };
      try {
        const { data } = await api.get(
          `/equipes/${eq.id}/pontuacao/gincana/${gincanaId}`
        );
        return { id: eq.id, total: Number(data?.total || 0) };
      } catch {
        return { id: eq.id, total: 0 };
      }
    });

    const membrosRes = await Promise.all(membrosProms);
    const pontosRes = await Promise.all(pontosProms);

    const memMap = {};
    membrosRes.forEach((m) => (memMap[m.id] = m.ativos));
    setMembrosAtivos(memMap);

    const ptsMap = {};
    pontosRes.forEach((p) => (ptsMap[p.id] = p.total));
    setPontuacaoTotal(ptsMap);
  }

  // ===== Helpers =====
  function fmtData(v) {
    if (!v) return "—";
    // aceita ISO string, Date, ou timestamp Firestore {_seconds,_nanoseconds}
    if (typeof v === "string") {
      const d = new Date(v);
      return isNaN(d) ? "—" : d.toLocaleDateString();
    }
    if (v?._seconds) {
      const ms = v._seconds * 1000 + Math.floor((v._nanoseconds || 0) / 1e6);
      const d = new Date(ms);
      return isNaN(d) ? "—" : d.toLocaleDateString();
    }
    try {
      const d = new Date(v);
      return isNaN(d) ? "—" : d.toLocaleDateString();
    } catch {
      return "—";
    }
  }

  // ===== Filtro/Busca/Ordenação =====
  const equipesFiltradas = useMemo(() => {
    let base =
      filtro === "ATIVOS"
        ? equipes.filter((e) => !!e.ativo)
        : filtro === "INATIVOS"
          ? equipes.filter((e) => !e.ativo)
          : equipes.slice();

    if (busca.trim()) {
      const q = busca.trim().toLowerCase();
      base = base.filter(
        (e) =>
          e.nome.toLowerCase().includes(q) ||
          (e.gincanaNome || "").toLowerCase().includes(q)
      );
    }

    return base.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [equipes, filtro, busca]);

  // ===== Ações (Criar / Editar / Inativar) =====
  function abrirModalCriar() {
    setErro("");
    setOk("");
    setNova({
      nome: "",
      gincanaId: gincanaAtiva?.id || "",
    });
    setModalCriar(true);
  }

  function fecharModalCriar() {
    setModalCriar(false);
  }

  async function handleCriar(e) {
    e.preventDefault();
    setErro("");
    setOk("");

    if (!nova.nome.trim()) return setErro("Informe o nome da equipe.");
    if (!nova.gincanaId) return setErro("Selecione a gincana.");

    try {
      setSalvando(true);
      await criarEquipe({
        nome: nova.nome.trim(),
        gincanaId: nova.gincanaId,
        ativo: true,
      });
      setOk("Equipe criada com sucesso!");
      setModalCriar(false);
      await carregarBase();
    } catch (err) {
      console.error(err);
      setErro("Falha ao criar equipe.");
    } finally {
      setSalvando(false);
    }
  }

  async function abrirModalEditar(equipeId) {
    setErro("");
    setOk("");
    try {
      const e = await obterEquipe(equipeId);
      setEdicao({
        id: e.id,
        nome: e.nome || "",
        gincanaId: e.gincanaId || e.gincana?.id || gincanaAtiva?.id || "",
      });
      setModalEditar(true);
    } catch (err) {
      console.error(err);
      setErro("Não foi possível abrir a edição.");
    }
  }

  function fecharModalEditar() {
    setModalEditar(false);
  }

  async function handleSalvarEdicao(e) {
    e.preventDefault();
    setErro("");
    setOk("");

    if (!edicao.nome.trim()) return setErro("Informe o nome da equipe.");
    if (!edicao.gincanaId) return setErro("Selecione a gincana.");

    try {
      setSalvando(true);
      await atualizarEquipe(edicao.id, {
        nome: edicao.nome.trim(),
        gincanaId: edicao.gincanaId,
      });
      setOk("Equipe atualizada com sucesso!");
      setModalEditar(false);
      await carregarBase();
    } catch (err) {
      console.error(err);
      setErro("Falha ao salvar edição.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleInativar(equipeId) {
    setErro("");
    setOk("");
    const confirma = window.confirm("Inativar esta equipe?");
    if (!confirma) return;

    try {
      setSalvando(true);
      await atualizarEquipe(equipeId, { ativo: false });
      setOk("Equipe inativada.");
      await carregarBase();
    } catch (err) {
      console.error(err);
      setErro("Falha ao inativar a equipe.");
    } finally {
      setSalvando(false);
    }
  }

  // ===== UI =====
  return (
    <main
      className="equipes-page"
      style={{ width: "min(1100px, 100%)", margin: "0 auto", padding: 16 }}
    >
      {/* Card principal centralizado */}
      <section className="card card-elev" style={{ padding: 16 }}>
        {/* Toolbar */}
        <header
          className="eq-toolbar"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            justifyContent: "space-between",
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <h1 style={{ margin: 0, fontWeight: 700 }}>Equipes</h1>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {/* Abas */}
            <div className="gincana-tabs" role="tablist" aria-label="Filtro de equipes">
              <button
                className={`tab-chip ${filtro === "ATIVOS" ? "active" : ""}`}
                onClick={() => setFiltro("ATIVOS")}
                role="tab"
                aria-selected={filtro === "ATIVOS"}
              >
                Ativos
              </button>
              <button
                className={`tab-chip ${filtro === "INATIVOS" ? "active" : ""}`}
                onClick={() => setFiltro("INATIVOS")}
                role="tab"
                aria-selected={filtro === "INATIVOS"}
              >
                Inativos
              </button>
              <button
                className={`tab-chip ${filtro === "TODOS" ? "active" : ""}`}
                onClick={() => setFiltro("TODOS")}
                role="tab"
                aria-selected={filtro === "TODOS"}
              >
                Todos
              </button>
            </div>

            {/* Busca */}
            <div className="usuarios-busca" style={{ minWidth: 260 }}>
              <input
                type="text"
                placeholder="Buscar por equipe ou gincana..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            {/* Criar */}
            <button
              className="btn btn-primary"
              onClick={abrirModalCriar}
              disabled={!gincanaAtiva?.id}
              title={gincanaAtiva?.id ? "Cadastrar nova equipe" : "Crie/ative uma gincana primeiro"}
            >
              + Nova Equipe
            </button>
          </div>
        </header>

        {/* Feedback */}
        {erro && (
          <div className="alert-erro" style={{ marginBottom: 10 }}>
            {erro}
          </div>
        )}
        {ok && (
          <div className="alert-ok" style={{ marginBottom: 10 }}>
            {ok}
          </div>
        )}

        {/* Lista de cards (cada card já é o "detalhe" resumido) */}
        {equipesFiltradas.length === 0 ? (
          <div className="eq-vazio">Nenhuma equipe encontrada.</div>
        ) : (
          <ul
            className="eq-ul"
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: 12,
            }}
          >
            {equipesFiltradas.map((e) => {
              const ativos = membrosAtivos[e.id];
              const pontos = pontuacaoTotal[e.id];
              const carregandoM = typeof ativos === "undefined";
              const carregandoP = typeof pontos === "undefined";

              return (
                <li
                  key={e.id}
                  className="eq-card"
                  style={{
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    padding: 14,
                    background: "#fff",
                    boxShadow: "0 4px 10px rgba(2, 6, 23, 0.04)",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 12,
                  }}
                >
                  {/* Bloco esquerdo (identidade) */}
                  <div style={{ minWidth: 0 }}>
                    <div
                      className="eq-nome"
                      style={{
                        fontWeight: 700,
                        color: "var(--text)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontSize: 16,
                      }}
                      title={e.nome}
                    >
                      {e.nome}
                    </div>
                    <div
                      className="eq-sub"
                      style={{
                        fontSize: 13,
                        color: "var(--muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={e.gincanaNome || "—"}
                    >
                      {e.gincanaNome || "—"}
                    </div>

                    {/* Linha de detalhes */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: 10,
                        marginTop: 8,
                      }}
                    >
                      {/* Criada em */}
                      <div
                        className="det-item"
                        style={{
                          border: "1px solid var(--line)",
                          borderRadius: 8,
                          padding: "8px 10px",
                          background: "#fafafa",
                        }}
                      >
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          Criada em
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          {fmtData(e.criadoEm)}
                        </div>
                      </div>

                      {/* Membros (ativos) */}
                      <div
                        className="det-item"
                        style={{
                          border: "1px solid var(--line)",
                          borderRadius: 8,
                          padding: "8px 10px",
                          background: "#fafafa",
                        }}
                      >
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          Membros (ativos)
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          {carregandoM ? "—" : ativos}
                        </div>
                      </div>

                      {/* Pontuação total */}
                      <div
                        className="det-item"
                        style={{
                          border: "1px solid var(--line)",
                          borderRadius: 8,
                          padding: "8px 10px",
                          background: "#fafafa",
                        }}
                      >
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          Pontuação total
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          {carregandoP ? "—" : pontos}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações à direita */}
                  <div
                    className="eq-actions"
                    style={{
                      display: "grid",
                      gap: 8,
                      alignContent: "start",
                      minWidth: 140,
                    }}
                  >
                    <button
                      className="btn btn-secondary"
                      onClick={() => abrirModalEditar(e.id)}
                      title="Editar equipe"
                    >
                      ✏️ Editar
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() => handleInativar(e.id)}
                      disabled={!e.ativo || salvando}
                      title={e.ativo ? "Inativar equipe" : "Já está inativa"}
                    >
                      📴 Inativar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ===== MODAL: Criar ===== */}
      {modalCriar && (
        <div
          className="modal-overlay"
          onClick={fecharModalCriar}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.2)",
            display: "grid",
            placeItems: "center",
            zIndex: 50,
          }}
        >
          <div
            className="modal card-elev"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              border: "1px solid var(--line)",
              borderRadius: 12,
              boxShadow: "0 8px 18px rgba(2,6,23,.08)",
              width: "min(520px, 96vw)",
              padding: 16,
            }}
          >
            <div
              className="modal-head"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <h3 style={{ margin: 0, fontWeight: 600 }}>Nova Equipe</h3>
              <button className="btn btn-secondary" onClick={fecharModalCriar}>
                ✖
              </button>
            </div>

            <form onSubmit={handleCriar} style={{ display: "grid", gap: 12 }}>
              <div className="form-field">
                <label className="label">Nome da equipe</label>
                <input
                  type="text"
                  value={nova.nome}
                  onChange={(e) => setNova({ ...nova, nome: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label className="label">Gincana</label>
                <select
                  value={nova.gincanaId}
                  onChange={(e) =>
                    setNova({ ...nova, gincanaId: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione...</option>
                  {gincanaAtiva?.id && (
                    <option value={gincanaAtiva.id}>{gincanaAtiva.nome}</option>
                  )}
                </select>
              </div>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={salvando || !gincanaAtiva?.id}
              >
                {salvando ? "Criando..." : "Criar"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: Editar ===== */}
      {modalEditar && (
        <div
          className="modal-overlay"
          onClick={fecharModalEditar}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.2)",
            display: "grid",
            placeItems: "center",
            zIndex: 50,
          }}
        >
          <div
            className="modal card-elev"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              border: "1px solid var(--line)",
              borderRadius: 12,
              boxShadow: "0 8px 18px rgba(2,6,23,.08)",
              width: "min(520px, 96vw)",
              padding: 16,
            }}
          >
            <div
              className="modal-head"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <h3 style={{ margin: 0, fontWeight: 600 }}>Editar Equipe</h3>
              <button className="btn btn-secondary" onClick={fecharModalEditar}>
                ✖
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} style={{ display: "grid", gap: 12 }}>
              <div className="form-field">
                <label className="label">Nome</label>
                <input
                  type="text"
                  value={edicao.nome}
                  onChange={(e) =>
                    setEdicao((prev) => ({ ...prev, nome: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label className="label">Gincana</label>
                <select
                  value={edicao.gincanaId}
                  onChange={(e) =>
                    setEdicao((prev) => ({ ...prev, gincanaId: e.target.value }))
                  }
                  required
                >
                  <option value="">Selecione...</option>
                  {gincanaAtiva?.id && (
                    <option value={gincanaAtiva.id}>{gincanaAtiva.nome}</option>
                  )}
                </select>
              </div>

              <button className="btn btn-primary" type="submit" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
