// src/pages/aluno/AtividadesAluno.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import "../../styles/Atividades.css";
import { obterGincanaAtiva } from "../../api/gincana";
import ModalPontuacoesAtividade from "../../components/ModalPontuacoesAtividade";
import { useAutenticacao } from "../../auth/useAutenticacao";
import ModalSolicitarRevisao from "../../components/ModalSolicitarRevisao";

export default function AtividadesAluno() {
    // --- Autenticação: pega equipe e id do aluno (se vier do provider)
    const { usuario } = useAutenticacao() || {};
    const equipeIdContext = usuario?.equipeId || usuario?.equipe?.id || null;
    const alunoId = usuario?.id || usuario?.uid || null;

    const [gincanaAtiva, setGincanaAtiva] = useState(null);
    const [atividades, setAtividades] = useState([]);
    const [selecionada, setSelecionada] = useState(null);

    const [mostrarPontuacoes, setMostrarPontuacoes] = useState(false);

    // modal de revisão + equipeId efetivo
    const [mostrarRevisao, setMostrarRevisao] = useState(false);
    const [equipeIdEfetivo, setEquipeIdEfetivo] = useState(equipeIdContext);

    // Abas: TODAS | AGENDADA | EM ANDAMENTO | CONCLUIDA
    const [filtro, setFiltro] = useState("TODAS");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        (async () => {
            setCarregando(true);
            await carregarAtivaEAtividades();
            setCarregando(false);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // se auth atualizar, refletimos no efetivo
        if (equipeIdContext && !equipeIdEfetivo) setEquipeIdEfetivo(equipeIdContext);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [equipeIdContext]);

    useEffect(() => {
        // limpa seleção quando a lista muda
        setSelecionada(null);
    }, [atividades]);

    function abrirModalPontuacoes() {
        if (!selecionada) return;
        setMostrarPontuacoes(true);
    }

    function fecharModalPontuacoes() {
        setMostrarPontuacoes(false);
    }

    function fmtData(v) {
        if (!v) return "-";
        const d = new Date(v);
        return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
    }

    function safeHtml(html = "") {
        // remove scripts e atributos on*=
        let s = String(html).replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
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
                setErro(
                    "Nenhuma gincana ativa no momento. Aguarde a coordenação publicar novas atividades."
                );
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

    // Considera CONCLUIDA OU ENCERRADA
    const isEncerradaOuConcluida =
        !!selecionada &&
        ["CONCLUIDA", "ENCERRADA"].includes(
            String(selecionada?.statusAtividade || "").toUpperCase()
        );

    // Abre o modal de revisão garantindo o equipeId:
    async function handleAbrirRevisao() {
        try {
            // 1) precisamos de uma atividade selecionada
            if (!selecionada?.id) {
                alert("Selecione uma atividade.");
                return;
            }
            // 2) garantir equipe do aluno
            let equipeId = equipeIdContext;
            if (!equipeId) {
                // tenta pegar do backend se o provider não trouxe
                if (alunoId) {
                    try {
                        const { data } = await api.get(`/usuarios/${alunoId}`);
                        equipeId = data?.equipeId || data?.equipe?.id || null;
                    } catch {
                        // se não houver endpoint por id, tenta /usuarios/me
                        const { data: me } = await api.get(`/usuarios/me`);
                        equipeId = me?.equipeId || me?.equipe?.id || null;
                    }
                } else {
                    // sem alunoId, tenta /usuarios/me
                    const { data: me } = await api.get(`/usuarios/me`);
                    equipeId = me?.equipeId || me?.equipe?.id || null;
                }
            }

            if (!equipeId) {
                alert("Não foi possível abrir a solicitação de revisão. Faltando: equipe do aluno.");
                return;
            }

            setEquipeIdEfetivo(equipeId);
            setMostrarRevisao(true);
        } catch (e) {
            console.error(e);
            alert("Não foi possível abrir a solicitação de revisão. Tente novamente.");
        }
    }

    return (
        <main className="page-wrap">
            {/* ===== TÍTULO + FILTROS ===== */}
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
                        className={`tab-chip ${filtro === "CONCLUIDA" ? "active" : ""}`}
                        onClick={() => setFiltro("CONCLUIDA")}
                        role="tab"
                        aria-selected={filtro === "CONCLUIDA"}
                    >
                        Concluídas
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
                                    {isEncerradaOuConcluida && (
                                        <>
                                            <button
                                                className="btn btn-secondary"
                                                title="Ver pontuação/ranking"
                                                onClick={abrirModalPontuacoes}
                                            >
                                                🏆 Ver pontuação
                                            </button>

                                            {/* Abre o modal só depois de garantir equipeId */}
                                            <button
                                                className="btn btn-primary"
                                                title="Solicitar revisão desta atividade"
                                                onClick={handleAbrirRevisao}
                                            >
                                                📨 Solicitar Revisão
                                            </button>
                                        </>
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
            {mostrarPontuacoes && (
                <ModalPontuacoesAtividade
                    aberta={mostrarPontuacoes}
                    onClose={fecharModalPontuacoes}
                    atividade={selecionada}
                />
            )}

            {mostrarRevisao && (
                <ModalSolicitarRevisao
                    aberta={mostrarRevisao}
                    onClose={() => setMostrarRevisao(false)}
                    gincanaId={gincanaAtiva?.id}
                    atividade={selecionada}
                    equipeId={equipeIdEfetivo}            // equipe do autor (aluno) — garantido
                    equipeAlvoIdDefault={equipeIdEfetivo} // alvo padrão = própria equipe
                    onEnviado={() => setMostrarRevisao(false)}
                    showEquipeAlvoSelect={true}
                />
            )}
        </main>
    );
}
