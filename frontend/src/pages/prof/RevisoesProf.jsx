import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import { obterGincanaAtiva } from "../../api/gincana";
import { obterUsuario } from "../../api/usuarios";
import { obterEquipe } from "../../api/equipes";

function normalizarStatus(s) {
  const v = String(s || "").toUpperCase().trim();
  if (v.includes("ANALIS")) return "EM_ANALISE";
  if (v.includes("ABERT")) return "ABERTA";
  if (v.includes("INDEFERID")) return "INDEFERIDA";
  if (v.includes("DEFERID")) return "DEFERIDA";
  if (v.includes("CANCELAD")) return "CANCELADA";
  return v || "DESCONHECIDO";
}

function formatarData(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return String(iso || "-");
  }
}

function ListaStatus({ titulo, emoji, itens, onSelect }) {
  return (
    <section className="card list">
      <div className="card-head">
        <span className="lista-titulo-icone">
          <span className="emoji">{emoji}</span> {titulo}
        </span>
      </div>
      <div className="card-body">
        {(!Array.isArray(itens) || itens.length === 0) ? (
          <div className="estado-vazio">Nenhuma revisão</div>
        ) : (
          <ul className="items">
            {itens.map((r) => (
              <li
                className="item"
                key={r.id}
                onClick={() => onSelect?.(r)}
                role="button"
                tabIndex={0}
                style={{ cursor: "pointer" }}
              >
                <div>
                  <div className="item-title">{r.motivo || "Sem motivo"}</div>
                  <div className="item-sub">#{r.id}</div>
                </div>
                <div className="item-meta">{formatarData(r.criadoEm)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function ModalDetalheRevisao({ id, onClose, onUpdated }) {
  const navigate = useNavigate();
  const [detalhe, setDetalhe] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [autorNome, setAutorNome] = useState("");
  const [equipeAutor, setEquipeAutor] = useState("");
  const [equipeAlvo, setEquipeAlvo] = useState("");
  const [analistaNome, setAnalistaNome] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [parecer, setParecer] = useState("");
  const [bonus, setBonus] = useState(0);
  const [penalidade, setPenalidade] = useState(0);
  const [atividadeId, setAtividadeId] = useState("");
  const [atividadeTitulo, setAtividadeTitulo] = useState("");

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      try {
        setErro("");
        setCarregando(true);
        const { data } = await api.get(`/revisoes/${id}`);
        if (cancelado) return;
        setDetalhe(data || null);

        const autorId = String(data?.autorUsuarioId || "").trim();
        const equipeId = String(data?.equipeId || "").trim();
        const alvoIdRaw = data?.equipeAlvoId;
        const alvoId = (alvoIdRaw && String(alvoIdRaw).trim() !== "undefined") ? String(alvoIdRaw).trim() : null;
        const analistaId = String(data?.analisadoPorUsuarioId || "").trim();
        const atvId = String(data?.atividadeId || data?.atividade?.id || "").trim();

        try {
          if (autorId) {
            const u = await obterUsuario(autorId);
            setAutorNome(u?.nome || autorId);
          }
        } catch {
          setAutorNome(autorId);
        }

        try {
          if (equipeId) {
            const eq = await obterEquipe(equipeId);
            setEquipeAutor(eq?.nome || equipeId);
          }
        } catch {
          setEquipeAutor(equipeId);
        }

        try {
          if (alvoId) {
            const eqA = await obterEquipe(alvoId);
            setEquipeAlvo(eqA?.nome || alvoId);
          } else {
            setEquipeAlvo("");
          }
        } catch {
          setEquipeAlvo(alvoId || "");
        }

        try {
          if (analistaId) {
            const u = await obterUsuario(analistaId);
            setAnalistaNome(u?.nome || analistaId);
          } else {
            setAnalistaNome("");
          }
        } catch {
          setAnalistaNome(analistaId || "");
        }

        try {
          if (atvId) {
            setAtividadeId(atvId);
            const rAtv = await api.get(`/atividades/${atvId}`);
            const atv = rAtv?.data;
            setAtividadeTitulo(atv?.titulo || atvId);
          } else {
            setAtividadeId("");
            setAtividadeTitulo("");
          }
        } catch {
          setAtividadeId(atvId || "");
          setAtividadeTitulo(atvId || "");
        }
      } catch (e) {
        console.log(e);
        setErro("Não foi possível carregar a revisão.");
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, [id]);

  const status = normalizarStatus(detalhe?.status);
  const concluida = status === "DEFERIDA" || status === "INDEFERIDA" || status === "CANCELADA";

  return (
    <div
      className="modal-backdrop"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}
    >
      <div className="modal card card-elev" role="dialog" aria-modal="true" style={{ width: "min(720px, 92vw)", maxHeight: "85vh", overflow: "auto" }}>
        <header className="card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Detalhes da Revisão</h3>
          <button className="btn btn-secondary" onClick={onClose}>Fechar</button>
        </header>
        <div className="card-body" style={{ display: "grid", gap: 12 }}>
          {carregando ? (
            <div>Carregando...</div>
          ) : erro ? (
            <div className="alert-erro">{erro}</div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span className="tab-chip">{status}</span>
                <span className="muted">Criado em {formatarData(detalhe?.criadoEm)}</span>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <div><strong>Autor</strong>: {autorNome || "-"}</div>
                <div><strong>Equipe do autor</strong>: {equipeAutor || "-"}</div>
                <div><strong>Equipe alvo</strong>: {equipeAlvo || "-"}</div>
              </div>

              {concluida && (
                <div style={{ display: "grid", gap: 8 }}>
                  <div><strong>Analisado por</strong>: {analistaNome || "-"}</div>
                  <div><strong>Encerrado em</strong>: {formatarData(detalhe?.atualizadoEm) || "-"}</div>
                </div>
              )}

              <div>
                <div className="section-title">Motivo</div>
                <div>{detalhe?.motivo || "-"}</div>
              </div>

              <div>
                <div className="section-title">Atividade</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{atividadeTitulo || atividadeId || "-"}</span>
                  {atividadeId && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        navigate(`/prof/atividades?selecionada=${atividadeId}`);
                        onClose?.();
                      }}
                    >
                      Abrir na aba Atividades
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="section-title">Parecer</div>
                {status === "EM_ANALISE" ? (
                  <textarea
                    value={parecer}
                    onChange={(e) => setParecer(e.target.value)}
                    rows={3}
                    style={{ width: "100%" }}
                    placeholder="Digite o parecer"
                  />
                ) : (
                  <div>{detalhe?.parecer || "-"}</div>
                )}
              </div>

              <div>
                <div className="section-title">Evidências</div>
                <div>{Array.isArray(detalhe?.evidencias) ? `${detalhe.evidencias.length} anexos` : "-"}</div>
              </div>

              <div>
                <div className="section-title">Ajuste de pontuação</div>
                {status === "EM_ANALISE" ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                    <label>
                      <div><strong>Bônus</strong></div>
                      <input
                        type="number"
                        value={bonus}
                        onChange={(e) => setBonus(Number(e.target.value))}
                        min={0}
                        style={{ width: "100%" }}
                      />
                    </label>
                    <label>
                      <div><strong>Penalidade</strong></div>
                      <input
                        type="number"
                        value={penalidade}
                        onChange={(e) => setPenalidade(Number(e.target.value))}
                        min={0}
                        style={{ width: "100%" }}
                      />
                    </label>
                  </div>
                ) : detalhe?.ajustePontuacao ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                    <div><strong>Bônus</strong>: {Number(detalhe.ajustePontuacao.bonus || 0)}</div>
                    <div><strong>Penalidade</strong>: {Number(detalhe.ajustePontuacao.penalidade || 0)}</div>
                    <div><strong>Total antes</strong>: {Number(detalhe.ajustePontuacao.totalAntes || 0)}</div>
                    <div><strong>Total depois</strong>: {Number(detalhe.ajustePontuacao.totalDepois || 0)}</div>
                  </div>
                ) : (
                  <div>-</div>
                )}
              </div>

              <div className="btn-row">
                {status === "ABERTA" && (
                  <button
                    className="btn btn-primary"
                    disabled={enviando}
                    onClick={async () => {
                      try {
                        setEnviando(true);
                        const { data } = await api.patch(`/revisoes/${id}/status`, { status: "EM_ANALISE" });
                        setDetalhe(data);
                        setParecer("");
                        onUpdated?.(data);
                      } catch (e) {
                        console.log(e);
                        console.log(e);
                        alert("Falha ao marcar como EM ANÁLISE.");
                      } finally {
                        setEnviando(false);
                      }
                    }}
                  >
                    Analisar
                  </button>
                )}

                {status === "EM_ANALISE" && (
                  <>
                    <button
                      className="btn btn-danger"
                      disabled={enviando || !parecer.trim()}
                      onClick={async () => {
                        try {
                          setEnviando(true);
                          const { data } = await api.patch(`/revisoes/${id}/status`, {
                            status: "INDEFERIDA",
                            parecer: parecer.trim(),
                          });
                          setDetalhe(data);
                          onUpdated?.(data);
                        } catch (e) {
                          console.log(e);
                          alert("Falha ao indeferir.");
                        } finally {
                          setEnviando(false);
                        }
                      }}
                    >
                      Indeferir
                    </button>

                    <button
                      className="btn btn-success"
                      disabled={enviando || !parecer.trim()}
                      onClick={async () => {
                        try {
                          setEnviando(true);
                          const { data } = await api.patch(`/revisoes/${id}/status`, {
                            status: "DEFERIDA",
                            parecer: parecer.trim(),
                            ajustePontuacao: { bonus: Number(bonus || 0), penalidade: Number(penalidade || 0) },
                          });
                          setDetalhe(data);
                          onUpdated?.(data);
                        } catch (e) {
                          console.log(e);
                          alert("Falha ao deferir.");
                        } finally {
                          setEnviando(false);
                        }
                      }}
                    >
                      Deferir
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RevisoesProf() {
  const [revisoes, setRevisoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      try {
        setErro("");
        setCarregando(true);
        const ativa = await obterGincanaAtiva();
        if (!ativa?.id) {
          if (!cancelado) {
            setRevisoes([]);
            setErro("Nenhuma gincana ativa.");
          }
          return;
        }
        const { data } = await api.get(`/revisoes?gincanaId=${ativa.id}`);
        if (cancelado) return;
        const arr = Array.isArray(data) ? data : [];
        const norm = arr.map((r) => ({ ...r, _status: normalizarStatus(r.status) }))
          .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
        setRevisoes(norm);
      } catch (e) {
        console.log(e);
        setErro("Não foi possível carregar revisões.");
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, []);

  const abertas = useMemo(() => revisoes.filter((r) => r._status === "ABERTA"), [revisoes]);
  const emAnalise = useMemo(() => revisoes.filter((r) => r._status === "EM_ANALISE"), [revisoes]);
  const deferidas = useMemo(() => revisoes.filter((r) => r._status === "DEFERIDA"), [revisoes]);
  const indeferidas = useMemo(() => revisoes.filter((r) => r._status === "INDEFERIDA"), [revisoes]);
  const canceladas = useMemo(() => revisoes.filter((r) => r._status === "CANCELADA"), [revisoes]);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [selecionada, setSelecionada] = useState(null);

  function handleSelect(r) {
    setSelecionada(r);
    setMostrarModal(true);
  }

  if (carregando) {
    return (
      <main className="page-wrap" style={{ width: "min(1100px, 100%)", margin: "0 auto", padding: 16 }}>
        <section className="card"><div className="card-body">Carregando revisões...</div></section>
      </main>
    );
  }

  return (
    <main className="page-wrap" style={{ width: "min(1100px, 100%)", margin: "0 auto", padding: 16 }}>
      {erro && <div className="alert-erro">{erro}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ListaStatus titulo="Abertas" emoji="🟡" itens={abertas} onSelect={handleSelect} />
        <ListaStatus titulo="Em análise" emoji="🔎" itens={emAnalise} onSelect={handleSelect} />
        <ListaStatus titulo="Deferidas" emoji="✅" itens={deferidas} onSelect={handleSelect} />
        <ListaStatus titulo="Indeferidas" emoji="❌" itens={indeferidas} onSelect={handleSelect} />
        <ListaStatus titulo="Canceladas" emoji="⛔" itens={canceladas} onSelect={handleSelect} />
      </div>

      {mostrarModal && selecionada?.id ? (
        <ModalDetalheRevisao
          id={selecionada.id}
          onClose={() => setMostrarModal(false)}
          onUpdated={(upd) => {
            setRevisoes((prev) => prev.map((r) => (r.id === upd.id ? { ...upd, _status: normalizarStatus(upd.status) } : r)));
          }}
        />
      ) : null}
    </main>
  );
}