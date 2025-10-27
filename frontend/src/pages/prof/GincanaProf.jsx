// src/pages/prof/GincanaProf.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  obterGincanaAtiva,
  criarGincana,
  encerrarGincana,
  atualizarGincana,
} from "../../api/gincana";
import "../../styles/Gincana.css";

export default function GincanaProf() {
  const navigate = useNavigate();

  // estado da gincana ativa
  const [ativa, setAtiva] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // criação
  const [nome, setNome] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [salvando, setSalvando] = useState(false);

  // edição
  const [editando, setEditando] = useState(false);
  const [editNome, setEditNome] = useState("");
  const [editDataInicio, setEditDataInicio] = useState("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  // encerrar
  const [encerrando, setEncerrando] = useState(false);

  // carrega gincana ativa ao abrir
  useEffect(() => {
    let vivo = true;
    (async () => {
      setErro("");
      setSucesso("");
      try {
        const g = await obterGincanaAtiva();
        if (vivo) setAtiva(g);
      } catch (e) {
        console.error(e);
        if (vivo) setErro("Não foi possível carregar a gincana ativa.");
      } finally {
        if (vivo) setCarregando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  // util: normaliza data para input[type=date]
  function toDateInputValue(v) {
    if (!v) return "";
    let d = new Date(v);
    if (isNaN(d.getTime()) && typeof v === "string" && v.includes("/")) {
      // tenta dd/MM/yyyy
      const [dd, mm, yyyy] = v.split("/");
      if (dd && mm && yyyy) d = new Date(+yyyy, +mm - 1, +dd);
    }
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  }

  // exibição amigável
  function fmtData(v) {
    if (!v) return "-";
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString();
  }

  // === criar gincana (ATIVA) ===
  async function handleCriar(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!nome.trim()) {
      setErro("Informe o nome da gincana.");
      return;
    }
    if (!dataInicio) {
      setErro("Informe a data de início.");
      return;
    }

    try {
      setSalvando(true);
      const criada = await criarGincana({ nome: nome.trim(), dataInicio });
      setSucesso("Gincana criada com sucesso!");
      setAtiva(criada);
      setNome("");
      setDataInicio("");
      setTimeout(() => navigate("/prof/dashboard"), 800);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível criar a gincana.");
    } finally {
      setSalvando(false);
    }
  }

  // === abrir/fechar edição ===
  function abrirEdicao() {
    setErro("");
    setSucesso("");
    setEditNome(ativa?.nome ?? "");
    setEditDataInicio(toDateInputValue(ativa?.dataInicio));
    setEditando(true);
  }
  function cancelarEdicao() {
    setEditando(false);
    setEditNome("");
    setEditDataInicio("");
  }

  // === salvar edição (PUT) ===
  async function handleSalvarEdicao(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!ativa?.id) {
      setErro("Gincana ativa não encontrada.");
      return;
    }
    if (!editNome.trim()) {
      setErro("Informe o nome da gincana.");
      return;
    }
    if (!editDataInicio) {
      setErro("Informe a data de início.");
      return;
    }

    try {
      setSalvandoEdicao(true);
      const atualizada = await atualizarGincana(ativa.id, {
        nome: editNome.trim(),
        dataInicio: editDataInicio,
      });
      setSucesso("Gincana atualizada com sucesso!");
      setAtiva(atualizada);
      setEditando(false);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível atualizar a gincana.");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  // === encerrar gincana (PATCH) ===
  async function handleEncerrar() {
    setErro("");
    setSucesso("");

    if (!ativa?.id) {
      setErro("Gincana ativa não encontrada.");
      return;
    }
    const confirmar = window.confirm(
      "Encerrar a gincana agora?\nEssa ação marca a gincana como ENCERRADA."
    );
    if (!confirmar) return;

    try {
      setEncerrando(true);
      await encerrarGincana(ativa.id);
      setSucesso("Gincana encerrada com sucesso!");
      setAtiva(null);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível encerrar a gincana.");
    } finally {
      setEncerrando(false);
    }
  }

  return (
    <main className="page-wrap">
      <h1>Gincana</h1>

      {erro && <div className="alert-erro">{erro}</div>}
      {sucesso && <div className="alert-ok">{sucesso}</div>}

      {carregando ? null : (
        <>
          {ativa ? (
            /* ====== MODO VISUALIZAÇÃO/EDIÇÃO ====== */
            <section className="card">
              <header className="card-header">
                <h2 style={{ margin: 0 }}>Gincana ativa</h2>
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
                      <span className="label">Data de início</span>
                      <div className="value">{fmtData(ativa.dataInicio)}</div>
                    </div>

                    <div className="field-read">
                      <span className="label">Data de término</span>
                      <div className="value">{fmtData(ativa.dataFim)}</div>
                    </div>

                    <div className="field-read">
                      <span className="label">Status</span>
                      <div className="value">{ativa.status ?? "-"}</div>
                    </div>
                  </div>

                  <div className="btn-row">
                    <button
                      type="button"
                      onClick={abrirEdicao}
                      className="btn btn-primary"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={handleEncerrar}
                      disabled={encerrando}
                      className="btn btn-danger"
                    >
                      {encerrando ? "Encerrando..." : "Encerrar gincana"}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/prof/ranking")}
                      className="btn btn-secondary"
                    >
                      Ver Ranking
                    </button>
                  </div>
                </>
              ) : (
                <form
                  onSubmit={handleSalvarEdicao}
                  className="grid-2"
                  style={{ marginTop: 16 }}
                >
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
                    <button
                      type="submit"
                      disabled={salvandoEdicao}
                      className="btn btn-primary"
                    >
                      {salvandoEdicao ? "Salvando..." : "Salvar alterações"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelarEdicao}
                      className="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </section>
          ) : (
            /* ====== MODO CRIAÇÃO (sem ATIVA) ====== */
            <section>
              <p>
                Crie uma nova gincana. O status será <strong>ATIVA</strong>.
              </p>

              <form
                onSubmit={handleCriar}
                className="grid-2"
                style={{ marginTop: 16 }}
              >
                <div className="field">
                  <label className="label" htmlFor="nome">
                    Nome da gincana
                  </label>
                  <input
                    id="nome"
                    type="text"
                    placeholder="Ex.: Gincana da Baixaria"
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
                  <button
                    type="submit"
                    disabled={salvando}
                    className="btn btn-primary"
                  >
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
        </>
      )}
    </main>
  );
}
