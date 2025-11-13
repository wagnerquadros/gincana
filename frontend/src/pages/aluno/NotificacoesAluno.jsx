import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import { obterGincanaAtiva } from "../../api/gincana";

export default function NotificacoesAluno() {
  const [gincana, setGincana] = useState(null);
  const [itens, setItens] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

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

  return (
    <main className="page-wrap" style={{ width: "min(1100px, 100%)", margin: "0 auto", padding: 16 }}>
      <header className="gincana-header" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <strong style={{ fontWeight: 600, fontSize: 20 }}>{tituloTopo}</strong>
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
    </main>
  );
}