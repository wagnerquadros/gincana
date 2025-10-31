import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import "../../styles/Atividades.css";
import { obterGincanaAtiva } from "../../api/gincana";
import { atualizarAtividade, criarAtividade } from "../../api/atividades";
import ModalAtividade from "../../components/ModalAtividade";
import ModalEncerrarAtividade from "../../components/ModalEncerrarAtividade";
import ModalPontuacoesAtividade from "../../components/ModalPontuacoesAtividade";


export default function AtividadesProf() {
  const [gincanaAtiva, setGincanaAtiva] = useState(null);
  const [atividades, setAtividades] = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [mostrarPontuacoes, setMostrarPontuacoes] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [mostrarEncerrar, setMostrarEncerrar] = useState(false);
  const [modalEditarVisivel, setModalEditarVisivel] = useState(false);
  const [atividadeEmEdicao, setAtividadeEmEdicao] = useState(null);

  const [filtro, setFiltro] = useState("TODAS"); // TODAS | AGENDADA | EM ANDAMENTO | ENCERRADA
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [processando, setProcessando] = useState(false);

  const [ok, setOk] = useState("");
  console.log(ok);

  useEffect(() => {
    (async () => {
      setCarregando(true);
      await carregarAtivaEAtividades();
      setCarregando(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // limpamos a seleção quando a lista muda (evita item “fantasma”)
    setSelecionada(null);
  }, [atividades]);

  function abrirModalEncerrar() {
    if (!selecionada) return;
    setMostrarEncerrar(true);
  }

  function fecharModalEncerrar() {
    setMostrarEncerrar(false);
  }
  function abrirModalPontuacoes() {
    if (!selecionada) return;
    setMostrarPontuacoes(true);
  }
  function fecharModalPontuacoes() {
    setMostrarPontuacoes(false);
  }

  // abrir modal criar
  function abrirModalCriar() {
    setModalVisivel(true);
  }

  // fechar modal criar
  function fecharModal() {
    setModalVisivel(false);
  }

  // salvar nova atividade
  async function salvarNovaAtividade(payload) {
    await criarAtividade(payload);
    await carregarAtividades(payload.gincanaId);
    setModalVisivel(false);
  }


  // === EDIÇÃO ===
  function abrirModalEditar(atividade) {
    if (!atividade) return;
    setAtividadeEmEdicao(atividade);
    setModalEditarVisivel(true);
  }

  function fecharModalEditar() {
    setModalEditarVisivel(false);
    setAtividadeEmEdicao(null);
  }

  async function salvarEdicaoAtividade(payload) {
    if (!atividadeEmEdicao?.id) return;
    // Atualiza somente os campos editáveis; backend ignora gincanaId se não permitir troca
    const atualizada = await atualizarAtividade(atividadeEmEdicao.id, payload);
    // Atualiza lista em memória
    setAtividades((prev) =>
      prev.map((a) => (a.id === atualizada.id ? { ...a, ...atualizada } : a))
    );
    // Atualiza painel de detalhes se for a selecionada
    setSelecionada((prev) =>
      prev && prev.id === atualizada.id ? { ...prev, ...atualizada } : prev
    );
    fecharModalEditar();
  }


  function fmtData(v) {
    if (!v) return "-";
    const d = new Date(v);
    return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
  }

  function safeHtml(html = "") {
    // remove scripts
    let s = String(html).replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
    // remove atributos on*=
    s = s.replace(/\son\w+="[^"]*"/gi, "").replace(/\son\w+='[^']*'/gi, "");
    return s;
  }

  const atividadesFiltradas = useMemo(() => {
    if (filtro === "TODAS") return atividades;
    const alvo = filtro.toUpperCase();
    return atividades.filter(
      (a) => (a.statusAtividade || "").toUpperCase() === alvo
    );
  }, [atividades, filtro]);

  async function carregarAtivaEAtividades() {
    try {
      setErro("");
      const ativa = await obterGincanaAtiva();
      setGincanaAtiva(ativa || null);

      if (!ativa?.id) {
        setAtividades([]);
        setErro("Nenhuma gincana ativa no momento. Crie/ative uma para listar atividades.");
        return;
      }
      await carregarAtividades(ativa.id);
    } catch (e) {
      console.error(e);
      setErro("Erro ao carregar dados da gincana/atividades.");
      setAtividades([]);
    }
  }

  async function carregarAtividades(idGincana) {
    try {
      setErro("");
      const { data } = await api.get(`/atividades/gincana/${idGincana}`);
      const lista = Array.isArray(data) ? data : [];
      lista.sort((a, b) => new Date(a.inicio || 0) - new Date(b.inicio || 0));
      setAtividades(lista);
    } catch (e) {
      console.error(e);
      setErro("Erro ao carregar atividades.");
      setAtividades([]);
    }
  }

  async function handleIniciarAtividade() {
    if (!selecionada) return;
    const confirma = window.confirm(
      "Iniciar esta atividade agora?\nIsso definirá o início como o momento atual e colocará a atividade EM ANDAMENTO."
    );
    if (!confirma) return;

    try {
      setProcessando(true);
      setErro("");
      setOk("");

      const agoraISO = new Date().toISOString();
      const atualizada = await atualizarAtividade(selecionada.id, {
        inicio: agoraISO,
        statusAtividade: "EM ANDAMENTO",
      });

      setAtividades((prev) =>
        prev.map((a) => (a.id === atualizada.id ? { ...a, ...atualizada } : a))
      );
      setSelecionada((prev) =>
        prev && prev.id === atualizada.id ? { ...prev, ...atualizada } : prev
      );

      setOk("Atividade iniciada com sucesso!");
    } catch (e) {
      console.error(e);
      setErro("Não foi possível iniciar a atividade.");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <main className="page-wrap">
      {/* ===== FILTROS + NOME DA GINCANA ===== */}
      <header className="gincana-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <strong style={{ fontWeight: 600, fontSize: 20 }}>
            {gincanaAtiva?.nome ? `🎉 ${gincanaAtiva.nome}` : "—"}
          </strong>
        </div>

        <div className="gincana-tabs" role="tablist" aria-label="Filtros de atividades">
          <button
            className={`tab-chip ${filtro === "TODAS" ? "active" : ""}`}
            onClick={() => setFiltro("TODAS")}
            role="tab"
            aria-selected={filtro === "TODAS"}
          >
            Todas
          </button>
          <button
            className={`tab-chip ${filtro === "AGENDADA" ? "active" : ""}`}
            onClick={() => setFiltro("AGENDADA")}
            role="tab"
            aria-selected={filtro === "AGENDADA"}
          >
            Agendadas
          </button>
          <button
            className={`tab-chip ${filtro === "EM ANDAMENTO" ? "active" : ""}`}
            onClick={() => setFiltro("EM ANDAMENTO")}
            role="tab"
            aria-selected={filtro === "EM ANDAMENTO"}
          >
            Em andamento
          </button>
          <button
            className={`tab-chip ${filtro === "ENCERRADA" ? "active" : ""}`}
            onClick={() => setFiltro("CONCLUIDA")}
            role="tab"
            aria-selected={filtro === "CONCLUIDA"}
          >
            Encerradas
          </button>
        </div>
      </header>

      {erro && <div className="alert-erro">{erro}</div>}
      {carregando && <p>Carregando...</p>}

      {!carregando && gincanaAtiva && (
        <div className="atividades-layout">
          {/* ===== LISTA ===== */}
          <section className="card card-elev lista-atividades">
            <header className="card-header" style={{ alignItems: "center" }}>
              <h2 style={{ margin: 0, fontWeight: 600 }}>Atividades</h2>
            </header>

            <div className="btn-row" style={{ justifyContent: "flex-start", marginBottom: 16 }}>
              <button className="btn btn-primary" onClick={abrirModalCriar}>
                ➕ Nova Atividade
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => carregarAtividades(gincanaAtiva.id)}
                title="Atualizar lista"
              >
                🔄 Atualizar
              </button>
            </div>

            {atividadesFiltradas.length === 0 ? (
              <div className="eq-vazio">Nenhuma atividade encontrada neste filtro.</div>
            ) : (
              <ul className="lista-cards-atividades">
                {atividadesFiltradas.map((a) => (
                  <li
                    key={a.id}
                    className={`item-atividade ${selecionada?.id === a.id ? "ativo" : ""}`}
                    onClick={() => setSelecionada(a)}
                  >
                    <div className="atividade-topo">
                      <strong className="atividade-titulo">{a.titulo}</strong>
                      <span className="atividade-pontos">{a.pontosPrimeiro} pts</span>
                    </div>
                    <p
                      className="atividade-descricao"
                      dangerouslySetInnerHTML={{ __html: safeHtml(a.descricao || "") }}
                    />
                    <div className="atividade-infos">
                      <span>{a.tipo}</span> • <span>{fmtData(a.inicio)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ===== DETALHES ===== */}
          <aside className="card card-elev detalhes-atividade">
            {selecionada ? (
              <>
                <div className="atividade-topo">
                  <h2 className="atividade-titulo">{selecionada.titulo}</h2>
                  <span className="atividade-pontos">
                    {selecionada.pontosPrimeiro} pts
                  </span>
                </div>

                <p className="atividade-status">{selecionada.statusAtividade}</p>

                <div className="atividade-campo">
                  <span className="campo-label">Descrição</span>
                  <div
                    className="campo-valor"
                    dangerouslySetInnerHTML={{ __html: safeHtml(selecionada.descricao || "") }}
                  />
                </div>

                <div className="atividade-campo">
                  <span className="campo-label">Categoria</span>
                  <p className="campo-valor">{selecionada.tipo}</p>
                </div>

                <div className="atividade-campo">
                  <span className="campo-label">Período</span>
                  <p className="campo-valor">
                    {fmtData(selecionada.inicio)} — {fmtData(selecionada.fim)}
                  </p>
                </div>

                <div className="pontuacao-card">
                  <div className="pontuacao-col">
                    <span className="campo-label">1º lugar</span>
                    <div className="pontuacao-valor">{selecionada.pontosPrimeiro} pts</div>
                  </div>
                  <div className="pontuacao-col">
                    <span className="campo-label">2º lugar</span>
                    <div className="pontuacao-valor">{selecionada.pontosSegundo} pts</div>
                  </div>
                  <div className="pontuacao-col">
                    <span className="campo-label">3º lugar</span>
                    <div className="pontuacao-valor">{selecionada.pontosTerceiro} pts</div>
                  </div>
                </div>

                {/* --- CRITÉRIOS (render rico) --- */}
                <div className="atividade-campo">
                  <span className="campo-label">Critérios</span>
                  <div
                    className="campo-valor"
                    dangerouslySetInnerHTML={{ __html: safeHtml(selecionada.criterios || "") }}
                  />
                </div>

                <div className="atividade-campo">
                  <span className="campo-label">Criado em</span>
                  <p className="campo-valor">{fmtData(selecionada.criadoEm)}</p>
                </div>

                <div className="atividade-campo">
                  <span className="campo-label">Atualizado em</span>
                  <p className="campo-valor">{fmtData(selecionada.atualizadoEm)}</p>
                </div>


                <div className="btn-row">
                  {String(selecionada.statusAtividade).toUpperCase() === "AGENDADA" && (
                    <button
                      className="btn btn-success"
                      onClick={handleIniciarAtividade}
                      disabled={processando}
                      title="Definir início agora e colocar EM ANDAMENTO"
                    >
                      {processando ? "Iniciando..." : "▶️ Iniciar atividade"}
                    </button>
                  )}

                  {String(selecionada.statusAtividade).toUpperCase() === "EM ANDAMENTO" && (
                    <button
                      className="btn btn-danger"
                      title="Encerrar atividade"
                      onClick={abrirModalEncerrar}
                    >
                      🏁 Encerrar Atividade
                    </button>
                  )}

                  {String(selecionada.statusAtividade).toUpperCase() === "CONCLUIDA" && (
                    <button className="btn btn-secondary" title="Ver pontuação/ranking" onClick={abrirModalPontuacoes}>
                      🏆 Ver pontuação
                    </button>
                  )}

                  {/* Botão editar só aparece se NÃO estiver concluída */}
                  {String(selecionada.statusAtividade).toUpperCase() !== "CONCLUIDA" && (
                    <button
                      className="btn btn-primary"
                      onClick={() => abrirModalEditar(selecionada)}
                    >
                      ✏️ Editar
                    </button>
                  )}
                </div>

              </>
            ) : (
              <div className="eq-vazio">
                Selecione uma atividade na lista para ver os detalhes.
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ===== MODAIS ===== */}
      <ModalAtividade
        visivel={modalVisivel}
        onFechar={fecharModal}
        onSalvar={salvarNovaAtividade}
        gincanaAtiva={gincanaAtiva}
      />

      <ModalAtividade
        visivel={modalEditarVisivel}
        onFechar={fecharModalEditar}
        onSalvar={salvarEdicaoAtividade}
        gincanaAtiva={gincanaAtiva}
        modo="editar"
        dadosIniciais={atividadeEmEdicao}
      />


      {mostrarEncerrar && (
        <ModalEncerrarAtividade
          aberta={mostrarEncerrar}
          onClose={fecharModalEncerrar}
          atividade={selecionada}
          gincanaId={gincanaAtiva?.id}
          onSucesso={() => {
            if (gincanaAtiva?.id) carregarAtividades(gincanaAtiva.id);
            setSelecionada(null);
          }}
        />
      )}

      {mostrarPontuacoes && (
        <ModalPontuacoesAtividade
          aberta={mostrarPontuacoes}
          onClose={fecharModalPontuacoes}
          atividade={selecionada}
        />
      )}
    </main>
  );
}