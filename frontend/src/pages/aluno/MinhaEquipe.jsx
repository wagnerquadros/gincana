import { useEffect, useState } from "react";
import { useAutenticacao } from "../../auth/useAutenticacao";
import { obterUsuario } from "../../api/usuarios";
import { obterEquipe, listarMembrosEquipe, obterPontuacaoEquipeGincana } from "../../api/equipes";
import { obterGincanaAtiva } from "../../api/gincana";
import ModalEntrarEquipe from "../../components/ModalEntrarEquipe";
import "../../styles/MinhaEquipe.css";

/**
 * Página que exibe informações da equipe atual do aluno
 * Permite visualizar dados da equipe, membros, pontuação e trocar de equipe
 */
export default function MinhaEquipe() {
    const { usuario, atualizarUsuario } = useAutenticacao();
    
    // Estados
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [equipe, setEquipe] = useState(null);
    const [membros, setMembros] = useState([]);
    const [pontuacao, setPontuacao] = useState({ total: 0, pontos: 0, bonus: 0, penalidades: 0 });
    const [gincana, setGincana] = useState(null);
    
    // Modal de troca de equipe
    const [modalTrocarEquipeAberto, setModalTrocarEquipeAberto] = useState(false);

    // Carrega dados da equipe do aluno
    useEffect(() => {
        async function carregarDadosEquipe() {
            if (!usuario?.id) {
                setCarregando(false);
                return;
            }

            try {
                setErro("");
                setCarregando(true);

                // 1. Busca dados completos do usuário para obter equipeId
                const usuarioCompleto = await obterUsuario(usuario.id);
                const equipeId = usuarioCompleto?.equipeId;

                if (!equipeId) {
                    // Aluno não tem equipe
                    setEquipe(null);
                    setMembros([]);
                    setPontuacao({ total: 0, pontos: 0, bonus: 0, penalidades: 0 });
                    setCarregando(false);
                    return;
                }

                // 2. Busca dados da equipe
                const dadosEquipe = await obterEquipe(equipeId);
                setEquipe(dadosEquipe);

                // 3. Busca gincana ativa (para pontuação)
                const gincanaAtiva = await obterGincanaAtiva();
                setGincana(gincanaAtiva);

                // 4. Busca membros da equipe (apenas ativos)
                const membrosAtivos = await listarMembrosEquipe(equipeId, { ativo: true });
                setMembros(membrosAtivos);

                // 5. Busca pontuação da equipe na gincana ativa (se houver)
                if (gincanaAtiva?.id) {
                    const pontuacaoData = await obterPontuacaoEquipeGincana(equipeId, gincanaAtiva.id);
                    setPontuacao({
                        total: pontuacaoData?.total || 0,
                        pontos: pontuacaoData?.pontos || 0,
                        bonus: pontuacaoData?.bonus || 0,
                        penalidades: pontuacaoData?.penalidades || 0,
                    });
                }
            } catch (error) {
                console.error("Erro ao carregar dados da equipe:", error);
                setErro("Não foi possível carregar os dados da sua equipe. Tente novamente.");
            } finally {
                setCarregando(false);
            }
        }

        carregarDadosEquipe();
    }, [usuario?.id]);

    // Handler para quando o aluno trocar de equipe
    const handleTrocaConfirmada = (usuarioAtualizado) => {
        // Atualiza o contexto de autenticação
        if (atualizarUsuario) {
            atualizarUsuario(usuarioAtualizado);
        }
        
        // Fecha o modal
        setModalTrocarEquipeAberto(false);
        
        // Recarrega a página para atualizar os dados
        window.location.reload();
    };

    // Renderização
    if (carregando) {
        return (
            <div className="minha-equipe-container">
                <div className="card">
                    <div className="card-body">
                        <p>Carregando dados da sua equipe...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Aluno não tem equipe
    if (!equipe) {
        return (
            <div className="minha-equipe-container">
                <div className="card">
                    <div className="card-head">Minha Equipe</div>
                    <div className="card-body">
                        <div className="me-sem-equipe">
                            <p className="me-mensagem">Você não está em nenhuma equipe no momento.</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => setModalTrocarEquipeAberto(true)}
                            >
                                Entrar em uma Equipe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal para entrar em equipe */}
                <ModalEntrarEquipe
                    aberta={modalTrocarEquipeAberto}
                    onClose={() => setModalTrocarEquipeAberto(false)}
                    onEntradaConfirmada={handleTrocaConfirmada}
                />
            </div>
        );
    }

    return (
        <>
                {/* Modal para trocar de equipe - passa equipeIdAtual para ocultar a equipe atual da lista */}
            <ModalEntrarEquipe
                aberta={modalTrocarEquipeAberto}
                onClose={() => setModalTrocarEquipeAberto(false)}
                onEntradaConfirmada={handleTrocaConfirmada}
                equipeIdAtual={equipe?.id || null}
            />

            <div className="minha-equipe-container">
                {/* Cabeçalho com nome da equipe e botão de trocar */}
                <div className="card">
                    <div className="card-head me-header-equipe">
                        <div>
                            <h2 className="me-titulo-equipe">👥 {equipe.nome}</h2>
                            {gincana && (
                                <p className="me-subtitulo">Gincana: {gincana.nome}</p>
                            )}
                        </div>
                        <button
                            className="btn btn-secondary me-btn-trocar"
                            onClick={() => setModalTrocarEquipeAberto(true)}
                        >
                            🔄 Trocar de Equipe
                        </button>
                    </div>
                </div>

                {erro && (
                    <div className="alert-erro">{erro}</div>
                )}

                {/* Pontuação da equipe */}
                {gincana && (
                    <div className="card">
                        <div className="card-head">🏆 Pontuação</div>
                        <div className="card-body">
                            <div className="me-pontuacao-grid">
                                <div className="me-pontuacao-item">
                                    <div className="me-pontuacao-label">Pontos</div>
                                    <div className="me-pontuacao-valor me-pontos">{pontuacao.pontos}</div>
                                </div>
                                <div className="me-pontuacao-item">
                                    <div className="me-pontuacao-label">Bônus</div>
                                    <div className="me-pontuacao-valor me-bonus">+{pontuacao.bonus}</div>
                                </div>
                                <div className="me-pontuacao-item">
                                    <div className="me-pontuacao-label">Penalidades</div>
                                    <div className="me-pontuacao-valor me-penalidades">-{pontuacao.penalidades}</div>
                                </div>
                                <div className="me-pontuacao-item me-total">
                                    <div className="me-pontuacao-label">Total</div>
                                    <div className="me-pontuacao-valor me-total-valor">{pontuacao.total}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Membros da equipe */}
                <div className="card">
                    <div className="card-head">
                        👥 Membros da Equipe ({membros.length} {membros.length === 1 ? "membro" : "membros"})
                    </div>
                    <div className="card-body">
                        {membros.length === 0 ? (
                            <p className="me-vazio">Nenhum membro ativo nesta equipe.</p>
                        ) : (
                            <div className="me-membros-lista">
                                {membros.map((membro) => (
                                    <div key={membro.id} className="me-membro-item">
                                        <div className="me-membro-avatar">
                                            {membro.foto ? (
                                                <img src={membro.foto} alt={membro.nome} />
                                            ) : (
                                                <div className="me-avatar-placeholder">
                                                    {membro.nome?.charAt(0)?.toUpperCase() || "?"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="me-membro-info">
                                            <div className="me-membro-nome">
                                                {membro.nome}
                                                {membro.id === usuario?.id && (
                                                    <span className="me-badge-eu">Você</span>
                                                )}
                                            </div>
                                            <div className="me-membro-email">{membro.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}