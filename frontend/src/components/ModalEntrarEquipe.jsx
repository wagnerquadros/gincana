import { useEffect, useState } from "react";
import { listarEquipesCompletas, entrarNaEquipe } from "../api/equipes";
import { obterGincanaAtiva } from "../api/gincana";
import { useAutenticacao } from "../auth/useAutenticacao";
import "../styles/ModalEntrarEquipe.css";

/**
 * Modal para aluno entrar em uma equipe
 * Exibe lista de equipes ativas da gincana com informações de membros e pontuação
 * Permite que o aluno selecione uma equipe e confirme a entrada
 * 
 * @param {boolean} aberta - Controla se o modal está aberto
 * @param {Function} onClose - Callback para fechar o modal
 * @param {Function} onEntradaConfirmada - Callback quando a entrada é confirmada
 * @param {string} equipeIdAtual - ID da equipe atual do aluno (opcional, para ocultar da lista ao trocar)
 */
export default function ModalEntrarEquipe({ aberta, onClose, onEntradaConfirmada, equipeIdAtual = null }) {
    const { usuario } = useAutenticacao();
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [gincana, setGincana] = useState(null);
    const [equipes, setEquipes] = useState([]);
    const [equipeSelecionada, setEquipeSelecionada] = useState(null);

    // Busca gincana ativa e equipes disponíveis quando o modal abre
    useEffect(() => {
        if (!aberta) return;

        async function carregarDados() {
            setErro("");
            setSucesso("");
            setCarregando(true);
            setEquipeSelecionada(null);

            try {
                // 1. Busca gincana ativa
                const gincanaAtiva = await obterGincanaAtiva();
                if (!gincanaAtiva?.id) {
                    setErro("Nenhuma gincana ativa encontrada. Entre em contato com o administrador.");
                    setGincana(null);
                    setEquipes([]);
                    return;
                }
                setGincana(gincanaAtiva);

                // 2. Busca equipes ativas com informações completas
                let equipesCompletas = await listarEquipesCompletas(gincanaAtiva.id);
                
                // Se houver equipeIdAtual, remove ela da lista (para evitar que o aluno "entre" na mesma equipe)
                if (equipeIdAtual) {
                    equipesCompletas = equipesCompletas.filter(eq => eq.id !== equipeIdAtual);
                }
                
                setEquipes(equipesCompletas);

                if (equipesCompletas.length === 0) {
                    if (equipeIdAtual) {
                        setErro("Não há outras equipes disponíveis para trocar no momento.");
                    } else {
                        setErro("Nenhuma equipe disponível no momento. Entre em contato com o administrador.");
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar equipes:", error);
                setErro("Não foi possível carregar as equipes disponíveis. Tente novamente.");
                setEquipes([]);
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, [aberta, equipeIdAtual]);

    // Handler para confirmar entrada na equipe selecionada
    const handleEntrar = async () => {
        if (!equipeSelecionada || !usuario?.id) {
            setErro("Selecione uma equipe para entrar.");
            return;
        }

        setErro("");
        setSucesso("");
        setSalvando(true);

        try {
            // Chama API para atualizar equipe do aluno
            const alunoAtualizado = await entrarNaEquipe(usuario.id, equipeSelecionada.id);
            
            setSucesso(
                equipeIdAtual 
                    ? `Você trocou para a equipe "${equipeSelecionada.nome}" com sucesso!`
                    : `Você entrou na equipe "${equipeSelecionada.nome}" com sucesso!`
            );
            
            // Prepara dados do usuário atualizado
            const usuarioAtualizado = {
                ...usuario,
                equipeId: equipeSelecionada.id,
            };
            
            // Aguarda um pouco para mostrar mensagem de sucesso
            setTimeout(() => {
                // Notifica o componente pai (que atualizará o contexto)
                if (onEntradaConfirmada) {
                    onEntradaConfirmada(usuarioAtualizado);
                }
            }, 1500);
        } catch (error) {
            console.error("Erro ao entrar na equipe:", error);
            setErro(
                error?.response?.data?.error || 
                "Não foi possível entrar na equipe. Tente novamente."
            );
        } finally {
            setSalvando(false);
        }
    };

    // Fecha modal se clicar fora
    const fecharSeClicarFora = (e) => {
        if (e.target.classList.contains("me-modal-overlay")) {
            if (!salvando) {
                onClose();
            }
        }
    };

    if (!aberta) return null;

    return (
        <div
            className="me-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Entrar em uma equipe"
            onClick={fecharSeClicarFora}
        >
            <div className="me-modal-card card-elev" onClick={(e) => e.stopPropagation()}>
                {/* Cabeçalho */}
                <header className="me-modal-head">
                    <div>
                        <h3 className="me-title">
                            {equipeIdAtual ? "🔄 Trocar de Equipe" : "👥 Entrar em uma Equipe"}
                        </h3>
                        <p className="me-sub">
                            {gincana?.nome 
                                ? equipeIdAtual 
                                    ? `Selecione uma nova equipe da gincana "${gincana.nome}"`
                                    : `Selecione uma equipe da gincana "${gincana.nome}"`
                                : "Selecione uma equipe para participar"}
                        </p>
                    </div>
                    {!salvando && (
                        <button 
                            className="me-btn-close" 
                            onClick={onClose} 
                            aria-label="Fechar"
                        >
                            ✖
                        </button>
                    )}
                </header>

                {/* Corpo */}
                <div className="me-modal-body">
                    {erro && <div className="me-alert-erro">{erro}</div>}
                    {sucesso && <div className="me-alert-sucesso">{sucesso}</div>}

                    {carregando ? (
                        <div className="me-loading">
                            <p>Carregando equipes disponíveis...</p>
                        </div>
                    ) : equipes.length === 0 ? (
                        <div className="me-vazio">
                            Nenhuma equipe disponível no momento.
                        </div>
                    ) : (
                        <div className="me-equipes-lista">
                            {equipes.map((equipe) => (
                                <div
                                    key={equipe.id}
                                    className={`me-equipe-item ${
                                        equipeSelecionada?.id === equipe.id ? "me-equipe-selecionada" : ""
                                    }`}
                                    onClick={() => !salvando && setEquipeSelecionada(equipe)}
                                >
                                    <div className="me-equipe-info">
                                        <div className="me-equipe-nome">{equipe.nome}</div>
                                        <div className="me-equipe-detalhes">
                                            <span className="me-detalhe-item">
                                                👥 {equipe.totalMembros} {equipe.totalMembros === 1 ? "membro" : "membros"}
                                            </span>
                                            {equipe.pontuacao !== undefined && (
                                                <span className="me-detalhe-item">
                                                    🏆 {equipe.pontuacao} pontos
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {equipeSelecionada?.id === equipe.id && (
                                        <div className="me-equipe-check">✓</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rodapé */}
                <footer className="me-modal-foot">
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={salvando}
                    >
                        Cancelar
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleEntrar}
                        disabled={!equipeSelecionada || salvando || carregando || equipes.length === 0}
                    >
                        {salvando 
                            ? (equipeIdAtual ? "Trocando..." : "Entrando...") 
                            : (equipeIdAtual ? "Trocar de Equipe" : "Entrar na Equipe")}
                    </button>
                </footer>
            </div>
        </div>
    );
}
