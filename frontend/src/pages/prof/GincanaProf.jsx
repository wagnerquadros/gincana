import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  obterGincanaAtiva,
  criarGincana,
  encerrarGincana,
  atualizarGincana,
  listarGincanas,
} from "../../api/gincana";
import { listarEquipes } from "../../api/equipes";
import "../../styles/Gincana.css";
import api from "../../api/client";

export default function GincanaProf() {
  const navigate = useNavigate();

  // ===== Estado geral / abas =====
  const [aba, setAba] = useState("ATIVA"); // "ATIVA" | "ENCERRADAS"

  // ===== Estado gincana ativa =====
  const [ativa, setAtiva] = useState(null);
  const [equipesAtiva, setEquipesAtiva] = useState([]);
  const [carregandoAtiva, setCarregandoAtiva] = useState(true);

  // ===== Estado gincanas encerradas =====
  const [encerradas, setEncerradas] = useState([]);
  const [carregandoEncerradas, setCarregandoEncerradas] = useState(true);

  // ===== Mensagens =====
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");

  // ===== Criação/edição =====
  const [nome, setNome] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [editando, setEditando] = useState(false);
  const [editNome, setEditNome] = useState("");
  const [editDataInicio, setEditDataInicio] = useState("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  // ===== Estado atividades da gincana ativa =====
  const [atividadesAtiva, setAtividadesAtiva] = useState([]);
  const [carregandoAtividades, setCarregandoAtividades] = useState(false);

  const [encerrando, setEncerrando] = useState(false);

  // ===== Helper de data/hora (para atividades) =====
  function fmtDataHora(v) {
    if (!v) return "-";
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    // simples e local — inclui hora:minuto
    return d.toLocaleString();
  }

  // ===== Carregamento inicial =====
  useEffect(() => {
    carregarAbaAtiva();
    carregarAbaEncerradas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Helpers de data =====
  function toDateInputValue(v) {
    if (!v) return "";
    let d = new Date(v);
    if (isNaN(d.getTime()) && typeof v === "string" && v.includes("/")) {
      const [dd, mm, yyyy] = v.split("/");
      if (dd && mm && yyyy) d = new Date(+yyyy, +mm - 1, +dd);
    }
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  }

  function fmtData(v) {
    if (!v) return "-";
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString();
  }

  // ===== Carregar dados da aba ATIVA =====
  async function carregarAbaAtiva() {
    setCarregandoAtiva(true);
    setErro("");
    setOk("");
    try {
      const g = await obterGincanaAtiva();
      setAtiva(g || null);

      if (g?.id) {
        const todas = await listarEquipes();
        const daAtiva = (todas || []).filter(
          (e) => (e.gincanaId || e?.gincana?.id) === g.id
        );
        setEquipesAtiva(
          daAtiva.map((e) => ({
            id: e.id,
            nome: e.nome || "",
            ativo: !!e.ativo,
          }))
        );
        await carregarAtividadesAtiva(g.id);
      } else {
        setEquipesAtiva([]);
        setAtividadesAtiva([]);
      }
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar a gincana ativa.");
    } finally {
      setCarregandoAtiva(false);
    }
  }

  // ===== Carregar dados da aba ENCERRADAS =====
  async function carregarAbaEncerradas() {
    setCarregandoEncerradas(true);
    try {
      const todas = await listarGincanas();
      const encerr = (todas || []).filter(
        (g) => (g.status || "").toUpperCase() === "ENCERRADA"
      );
      // ordena por dataFim desc (mais recente primeiro)
      encerr.sort((a, b) => new Date(b.dataFim || 0) - new Date(a.dataFim || 0));
      setEncerradas(encerr);
    } catch (e) {
      console.error(e);
      setErro((prev) => prev || "Não foi possível carregar gincanas encerradas.");
    } finally {
      setCarregandoEncerradas(false);
    }
  }

  // ===== Criar gincana ATIVA =====
  async function handleCriar(e) {
    e.preventDefault();
    setErro("");
    setOk("");

    if (!nome.trim()) return setErro("Informe o nome da gincana.");
    if (!dataInicio) return setErro("Informe a data de início.");

    try {
      setSalvando(true);
      const criada = await criarGincana({ nome: nome.trim(), dataInicio });
      setOk("Gincana criada com sucesso!");
      setAtiva(criada);
      setNome("");
      setDataInicio("");
      await carregarAbaAtiva();
      setAba("ATIVA");
      // se quiser voltar para dashboard:
      // setTimeout(() => navigate("/prof/dashboard"), 600);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível criar a gincana.");
    } finally {
      setSalvando(false);
    }
  }

  // ===== Editar gincana ATIVA =====
  function abrirEdicao() {
    setErro("");
    setOk("");
    setEditNome(ativa?.nome ?? "");
    setEditDataInicio(toDateInputValue(ativa?.dataInicio));
    setEditando(true);
  }
  function cancelarEdicao() {
    setEditando(false);
    setEditNome("");
    setEditDataInicio("");
  }

  async function handleSalvarEdicao(e) {
    e.preventDefault();
    setErro("");
    setOk("");

    if (!ativa?.id) return setErro("Gincana ativa não encontrada.");
    if (!editNome.trim()) return setErro("Informe o nome da gincana.");
    if (!editDataInicio) return setErro("Informe a data de início.");

    try {
      setSalvandoEdicao(true);
      const atualizada = await atualizarGincana(ativa.id, {
        nome: editNome.trim(),
        dataInicio: editDataInicio,
      });
      setOk("Gincana atualizada com sucesso!");
      setAtiva(atualizada);
      setEditando(false);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível atualizar a gincana.");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  // ===== Encerrar gincana ATIVA =====
  async function handleEncerrar() {
    setErro("");
    setOk("");

    if (!ativa?.id) return setErro("Gincana ativa não encontrada.");
    const confirmar = window.confirm(
      "Encerrar a gincana agora?\nEssa ação marca a gincana como ENCERRADA."
    );
    if (!confirmar) return;

    try {
      setEncerrando(true);
      await encerrarGincana(ativa.id);
      setOk("Gincana encerrada com sucesso!");
      setAtiva(null);
      setEquipesAtiva([]);
      await carregarAbaEncerradas();
      setAba("ENCERRADAS");
    } catch (e) {
      console.error(e);
      setErro("Não foi possível encerrar a gincana.");
    } finally {
      setEncerrando(false);
    }
  }

  // ===== Equipes: ordenação por nome =====
  const equipesOrdenadas = useMemo(
    () => [...equipesAtiva].sort((a, b) => a.nome.localeCompare(b.nome)),
    [equipesAtiva]
  );

  async function carregarAtividadesAtiva(gincanaId) {
    if (!gincanaId) {
      setAtividadesAtiva([]);
      return;
    }
    setCarregandoAtividades(true);
    try {
      const { data } = await api.get(`/atividades/gincana/${gincanaId}`);
      const lista = Array.isArray(data) ? data : [];
      // Ordena por início (mais próxima primeiro)
      lista.sort((a, b) => new Date(a.inicio || 0) - new Date(b.inicio || 0));
      setAtividadesAtiva(
        lista.map((a) => ({
          id: a.id,
          titulo: a.titulo || "",
          tipo: a.tipo || "",
          inicio: a.inicio || null,
          fim: a.fim || null,
          statusAtividade: a.statusAtividade || "",
          ativa: !!a.ativa,
        }))
      );
    } catch (e) {
      console.error(e);
      setAtividadesAtiva([]);
    } finally {
      setCarregandoAtividades(false);
    }
  }


  // ===== UI =====
  return (
    <main className="page-wrap">
      <header className="gincana-header">


        <div className="gincana-tabs" role="tablist" aria-label="Seções da gincana">
          <button
            className={`tab-chip ${aba === "ATIVA" ? "active" : ""}`}
            onClick={() => setAba("ATIVA")}
            role="tab"
            aria-selected={aba === "ATIVA"}
          >
            🟢 Ativa
          </button>
          <button
            className={`tab-chip ${aba === "ENCERRADAS" ? "active" : ""}`}
            onClick={() => setAba("ENCERRADAS")}
            role="tab"
            aria-selected={aba === "ENCERRADAS"}
          >
            🏁 Encerradas
          </button>
        </div>
      </header>

      {erro && <div className="alert-erro">{erro}</div>}
      {ok && <div className="alert-ok">{ok}</div>}

      {/* ===== ABA ATIVA ===== */}
      {aba === "ATIVA" && (
        <>
          {carregandoAtiva ? null : ativa ? (
            <section className="card card-elev">
              <header className="card-header">
                <h2 className="gincana-title" style={{ margin: 0, fontWeight: 600 }}>
                  {ativa?.nome || "Gincana ativa"}
                </h2>
                <span className="status-pill--ativa">ATIVA</span>
              </header>

              {!editando ? (
                <>
                  <div className="grid-2">
                    <div className="field-read">
                      <span className="label">Nome</span>
                      <div className="value">{ativa.nome ?? "-"}</div>
                    </div>

                    <div className="field-read">
                      <span className="label">Início</span>
                      <div className="value">{fmtData(ativa.dataInicio)}</div>
                    </div>

                    <div className="field-read">
                      <span className="label">Término</span>
                      <div className="value">{fmtData(ativa.dataFim)}</div>
                    </div>

                    <div className="field-read">
                      <span className="label">Status</span>
                      <div className="value">{ativa.status ?? "-"}</div>
                    </div>
                  </div>

                  <div className="btn-row">
                    <button type="button" onClick={abrirEdicao} className="btn btn-primary">
                      ✏️ Editar
                    </button>
                    <button
                      type="button"
                      onClick={handleEncerrar}
                      disabled={encerrando}
                      className="btn btn-danger"
                    >
                      {encerrando ? "Encerrando..." : "🏁 Encerrar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/prof/ranking")}
                      className="btn btn-secondary"
                    >
                      🏆 Ver Ranking
                    </button>
                    <button
                      type="button"
                      onClick={carregarAbaAtiva}
                      className="btn btn-secondary"
                      title="Recarregar informações"
                    >
                      🔄 Atualizar
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSalvarEdicao} className="grid-2" style={{ marginTop: 16 }}>
                  <div className="field">
                    <label className="label" htmlFor="editNome">
                      Nome da gincana
                    </label>
                    <input
                      id="editNome"
                      type="text"
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      className="input"
                      required
                    />
                  </div>

                  <div className="field">
                    <label className="label" htmlFor="editDataInicio">
                      Data de início
                    </label>
                    <input
                      id="editDataInicio"
                      type="date"
                      value={editDataInicio}
                      onChange={(e) => setEditDataInicio(e.target.value)}
                      className="input"
                      required
                    />
                  </div>

                  <div className="btn-row" style={{ gridColumn: "1 / -1" }}>
                    <button type="submit" disabled={salvandoEdicao} className="btn btn-primary">
                      {salvandoEdicao ? "Salvando..." : "Salvar alterações"}
                    </button>
                    <button type="button" onClick={cancelarEdicao} className="btn btn-secondary">
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </section>
          ) : (
            // ===== MODO CRIAÇÃO (sem ATIVA) =====
            <section className="card card-elev">
              <header className="card-header">
                <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="ico-title">🚀</span> Criar nova gincana
                </h2>
              </header>
              <p>Crie uma nova gincana. O status será <strong>ATIVA</strong>.</p>

              <form onSubmit={handleCriar} className="grid-2" style={{ marginTop: 16 }}>
                <div className="field">
                  <label className="label" htmlFor="nome">
                    Nome da gincana
                  </label>
                  <input
                    id="nome"
                    type="text"
                    placeholder="Ex.: Gincana Cultural 2025"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="input"
                    required
                  />
                </div>

                <div className="field">
                  <label className="label" htmlFor="dataInicio">
                    Data de início
                  </label>
                  <input
                    id="dataInicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="input"
                    required
                  />
                </div>

                <div className="btn-row" style={{ gridColumn: "1 / -1" }}>
                  <button type="submit" disabled={salvando} className="btn btn-primary">
                    {salvando ? "Criando..." : "Criar gincana (ATIVA)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/prof/dashboard")}
                    className="btn btn-secondary"
                  >
                    Voltar ao Dashboard
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* ===== EQUIPES DA GINCANA ATIVA ===== */}
          <section className="card card-elev eqs-card">
            <header className="card-header">
              <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span className="ico-title">👥</span> Equipes inscritas
              </h2>
              <small className="eq-tip">
                {carregandoAtiva
                  ? ""
                  : ativa
                    ? `${equipesOrdenadas.length} equipe(s)`
                    : "Crie/ative uma gincana para cadastrar equipes."}
              </small>
            </header>

            {carregandoAtiva ? null : ativa ? (
              equipesOrdenadas.length ? (
                <ul className="teams-grid">
                  {equipesOrdenadas.map((t) => (
                    <li key={t.id} className="team-card">
                      <div className="team-top">
                        <span className="team-emoji" aria-hidden="true">🛡️</span>
                        <span className={`team-badge ${t.ativo ? "on" : "off"}`}>
                          {t.ativo ? "Ativa" : "Inativa"}
                        </span>
                      </div>
                      <div className="team-name">{t.nome}</div>
                      <div className="team-id">#{t.id.slice(0, 6)}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="eq-vazio">Nenhuma equipe cadastrada nesta gincana.</div>
              )
            ) : null}

            <div className="btn-row">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/prof/equipes")}
              >
                ➕ Gerenciar Equipes
              </button>
              <button type="button" className="btn btn-secondary" onClick={carregarAbaAtiva}>
                🔄 Atualizar Lista
              </button>
            </div>
          </section>
          {/* ===== ATIVIDADES DA GINCANA ATIVA ===== */}
          <section className="card card-elev acts-card">
            <header className="card-header">
              <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span className="ico-title">📅</span> Atividades da gincana
              </h2>
              <small className="eq-tip">
                {carregandoAtividades
                  ? ""
                  : ativa
                    ? `${atividadesAtiva.length} atividade(s)`
                    : "Crie/ative uma gincana para cadastrar atividades."}
              </small>
            </header>

            {carregandoAtividades ? null : ativa ? (
              atividadesAtiva.length ? (
                <ul className="acts-grid">
                  {atividadesAtiva.map((a) => (
                    <li key={a.id} className="act-card">
                      <div className="act-top">
                        <span className="act-emoji" aria-hidden="true">🎯</span>
                        <span className={`act-badge ${a.statusAtividade?.toLowerCase() || ""}`}>
                          {a.statusAtividade || "—"}
                        </span>
                      </div>
                      <div className="act-title">{a.titulo}</div>
                      <div className="act-meta">
                        <span className="act-tipo">{a.tipo || "—"}</span>
                        <span className="act-sep">•</span>
                        <span>{fmtDataHora(a.inicio)} — {fmtDataHora(a.fim)}</span>
                      </div>
                      <div className="act-id">#{a.id.slice(0, 6)}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="eq-vazio">Nenhuma atividade cadastrada nesta gincana.</div>
              )
            ) : null}

            <div className="btn-row">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/prof/atividades")}
              >
                🛠️ Gerenciar Atividades
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => carregarAtividadesAtiva(ativa?.id)}
                disabled={!ativa}
                title="Recarregar atividades"
              >
                🔄 Atualizar Lista
              </button>
            </div>
          </section>

        </>
      )}

      {/* ===== ABA ENCERRADAS ===== */}
      {aba === "ENCERRADAS" && (
        <section className="card card-elev">
          <header className="card-header">
            <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <span className="ico-title">📚</span> Eventos encerrados
            </h2>
            <button className="btn btn-secondary" onClick={carregarAbaEncerradas}>
              🔄 Atualizar
            </button>
          </header>

          {carregandoEncerradas ? null : encerradas.length ? (
            <ul className="ended-grid">
              {encerradas.map((g) => (
                <li key={g.id} className="ended-card">
                  <div className="ended-top">
                    <span className="ended-emoji" aria-hidden="true">🏁</span>
                    <span className="status-pill--ended">ENCERRADA</span>
                  </div>
                  <div className="ended-name">{g.nome}</div>
                  <div className="ended-dates">
                    {fmtData(g.dataInicio)} — {fmtData(g.dataFim)}
                  </div>
                  <div className="btn-row">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      // placeholder para futuro: ver detalhes/relatórios
                      onClick={() => alert("Em breve: detalhes da gincana encerrada")}
                    >
                      🔍 Ver detalhes
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="eq-vazio">Nenhum evento encerrado encontrado.</div>
          )}
        </section>
      )}
    </main>
  );
}