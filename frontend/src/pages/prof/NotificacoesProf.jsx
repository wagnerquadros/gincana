import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import { obterGincanaAtiva } from "../../api/gincana";

export default function NotificacoesProf() {
  const [gincana, setGincana] = useState(null);
  const [itens, setItens] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tituloNovo, setTituloNovo] = useState("");
  const [corpoNovo, setCorpoNovo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErro("");
        setCarregando(true);
        const ativa = await obterGincanaAtiva();
        setGincana(ativa || null);
        if (!ativa?.id) {
          setItens([]);
          setErro("Nenhuma gincana ativa.");
          return;
        }
        const { data } = await api.get(`/notificacoes?gincanaId=${ativa.id}`);
        const lista = Array.isArray(data) ? data : [];
        setItens(lista);
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar notificações.");
        setItens([]);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const tituloTopo = useMemo(() => {
    if (gincana?.id) return gincana.nome ?? "Gincana Ativa";
    return "Nenhuma gincana em andamento";
  }, [gincana]);

  const ordenadas = useMemo(() => {
    return [...itens].sort((a, b) => new Date(b.enviadaEm) - new Date(a.enviadaEm));
  }, [itens]);

  async function salvarNotificacao() {
    try {
      setErroForm("");
      if (!gincana?.id) {
        setErroForm("Nenhuma gincana ativa.");
        return;
      }
      const t = tituloNovo.trim();
      const c = corpoNovo.trim();
      if (!t || !c) {
        setErroForm("Preencha título e corpo.");
        return;
      }
      setSalvando(true);
      const { data } = await api.post("/notificacoes", {
        gincanaId: gincana.id,
        tipo: "COMUNICADO",
        titulo: t,
        corpo: c,
        status: "ENVIADA",
      });
      setItens((prev) => [data, ...prev]);
      setShowModal(false);
      setTituloNovo("");
      setCorpoNovo("");
    } catch (e) {
      console.error(e);
      setErroForm("Falha ao criar notificação.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="page-wrap" style={{ width: "min(1100px, 100%)", margin: "0 auto", padding: 16 }}>
      <header className="gincana-header" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <strong style={{ fontWeight: 600, fontSize: 20 }}>{tituloTopo}</strong>
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Nova Notificação</button>
        </div>
      </header>

      {erro && <div className="alert-erro">{erro}</div>}
      {carregando && <p>Carregando...</p>}

      {!carregando && (
        <div style={{ display: "grid", gap: 12 }}>
          {ordenadas.length === 0 ? (
            <div className="card"><div className="card-body">Nenhuma notificação</div></div>
          ) : (
            ordenadas.map((n) => (
              <section key={n.id} className="card card-elev">
                <div className="card-head" style={{ alignItems: "center", justifyContent: "space-between" }}>
                  <span className="lista-titulo-icone"><span className="emoji">🔔</span> {n.titulo || n.tipo}</span>
                  <span className="muted">{new Date(n.enviadaEm).toLocaleString()}</span>
                </div>
                <div className="card-body">
                  <div>{n.corpo}</div>
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-bg" role="dialog" aria-modal="true" aria-label="Nova notificação">
          <div className="modal-card" style={{ width: 520 }}>
            <div className="modal-head">
              <h3 style={{ margin: 0, fontWeight: 700 }}>Nova notificação</h3>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} aria-label="Fechar">✖</button>
            </div>
            {erroForm && <div className="alert-erro" role="alert">{erroForm}</div>}
            <div className="modal-body" style={{ display: "grid", gap: 10 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 600, color: "#374151" }}>Título</span>
                <input type="text" value={tituloNovo} onChange={(e) => setTituloNovo(e.target.value)} placeholder="Título da notificação" />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 600, color: "#374151" }}>Corpo</span>
                <textarea value={corpoNovo} onChange={(e) => setCorpoNovo(e.target.value)} placeholder="Mensagem para os participantes" rows={5} />
              </label>
            </div>
            <div className="btn-row" style={{ marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={salvando}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvarNotificacao} disabled={salvando}>{salvando ? "Enviando..." : "Enviar"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}