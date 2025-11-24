
import { useEffect, useState } from "react";
import api from "../api/client";
import "../styles/ModalAtividade.css";

export default function ModalPontuacoesAtividade({
    aberta,
    onClose,
    atividade,
}) {
    const [lista, setLista] = useState([]);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        if (!aberta || !atividade?.id) return;
        setErro("");
        setCarregando(true);
        carregarPontuacoes(atividade.id)
            .finally(() => setCarregando(false));
    }, [aberta, atividade?.id]);

    async function carregarPontuacoes(atividadeId) {
        try {
            const { data } = await api.get(`/atividades/${atividadeId}/pontuacoes`);
            const arr = Array.isArray(data) ? data.slice() : [];
            // Ordena por colocação crescente (1º, 2º, 3º…)
            arr.sort((a, b) => (a.colocacao ?? 999) - (b.colocacao ?? 999));
            setLista(arr);
        } catch (e) {
            console.error(e);
            setErro("Não foi possível carregar as pontuações.");
            setLista([]);
        }
    }

    function medalha(colocacao) {
        if (colocacao === 1) return "🥇";
        if (colocacao === 2) return "🥈";
        if (colocacao === 3) return "🥉";
        return "🎖️";
    }

    if (!aberta) return null;

    return (
        <div className="modal-bg" role="dialog" aria-modal="true" aria-label="Pontuações da atividade">
            <div className="modal-card card-elev" style={{ maxWidth: 720 }}>
                <header className="modal-head">
                    <h3 style={{ margin: 0, fontWeight: 600 }}>
                        Pontuações {atividade?.titulo ? `— ${atividade.titulo}` : ""}
                    </h3>
                    <button className="btn btn-secondary" onClick={onClose}>✖</button>
                </header>

                {erro && <div className="alert-erro" style={{ marginTop: 8 }}>{erro}</div>}

                <div className="modal-body">
                    {carregando ? (
                        <p style={{ margin: 0 }}>Carregando...</p>
                    ) : lista.length === 0 ? (
                        <div className="eq-vazio">Nenhuma pontuação registrada para esta atividade.</div>
                    ) : (
                        <ul className="pontuacoes-lista">
                            {lista.map((p) => (
                                <li key={p.id} className="pontuacao-item">
                                    <div className="pontuacao-left">
                                        <div className={`podio-medal ${p.colocacao <= 3 ? `pos-${p.colocacao}` : ""}`}>
                                            {medalha(p.colocacao)}
                                        </div>
                                        <div className="podio-info">
                                            <div className="podio-equipe" title={p?.equipe?.nome || ""}>
                                                {p?.equipe?.nome || "(Equipe)"}
                                            </div>
                                            <div className="podio-sub">
                                                Colocação: {p.colocacao ?? "—"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pontuacao-right">
                                        <div className="podio-campo">
                                            <span className="podio-label">Pontos</span>
                                            <div className="podio-valor">{p.pontosObtidos ?? 0}</div>
                                        </div>
                                        <div className="podio-campo">
                                            <span className="podio-label">Bônus</span>
                                            <div className="podio-valor">{p.bonus ?? 0}</div>
                                        </div>
                                        <div className="podio-campo">
                                            <span className="podio-label">Penalidade</span>
                                            <div className="podio-valor">{p.penalidade ?? 0}</div>
                                        </div>
                                        <div className="podio-campo total">
                                            <span className="podio-label">Total</span>
                                            <div className="podio-valor">{p.total ?? 0}</div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="btn-row" style={{ justifyContent: "flex-end" }}>
                    <button className="btn btn-secondary" onClick={onClose}>Fechar</button>
                </div>
            </div>
        </div>
    );
}
