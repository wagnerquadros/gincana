import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import "../styles/ModalAtividade.css"; // reaproveitando o mesmo CSS do modal de criar/editar

export default function ModalEncerrarAtividade({
    aberta,
    onClose,
    atividade,     // objeto da atividade selecionada (precisa de id, pontosPrimeiro/Segundo/Terceiro)
    gincanaId,     // id da gincana ativa
    onSucesso,     // callback para recarregar a lista após encerrar
}) {
    const [equipes, setEquipes] = useState([]);
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);

    // selects
    const [primeiro, setPrimeiro] = useState("");
    const [segundo, setSegundo] = useState("");
    const [terceiro, setTerceiro] = useState("");

    // bônus/penalidades (opcionais)
    const [bonus1, setBonus1] = useState("");
    const [bonus2, setBonus2] = useState("");
    const [bonus3, setBonus3] = useState("");
    const [pen1, setPen1] = useState("");
    const [pen2, setPen2] = useState("");
    const [pen3, setPen3] = useState("");

    // Carregar equipes da gincana quando abrir
    useEffect(() => {
        if (!aberta || !gincanaId) return;
        setErro("");
        carregarEquipes();
        // resetar seleção ao abrir
        setPrimeiro(""); setSegundo(""); setTerceiro("");
        setBonus1(""); setBonus2(""); setBonus3("");
        setPen1(""); setPen2(""); setPen3("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aberta, gincanaId]);

    async function carregarEquipes() {
        try {
            const { data } = await api.get(`/equipes/gincana/${gincanaId}`);
            // Você pode filtrar só ativas se preferir:
            const lista = Array.isArray(data) ? data.filter(e => e?.nome) : [];
            // ordenar por nome
            lista.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
            setEquipes(lista);
        } catch (e) {
            console.error(e);
            setErro("Não foi possível carregar as equipes da gincana.");
        }
    }

    const idsSelecionados = useMemo(() => new Set([primeiro, segundo, terceiro].filter(Boolean)), [primeiro, segundo, terceiro]);

    function optionDisabled(id) {
        // desabilita a opção se já está usada em outro select
        return idsSelecionados.has(id) === true && id !== primeiro && id !== segundo && id !== terceiro;
    }

    function montarPayload() {
        const classificacao = [primeiro, segundo, terceiro].filter(Boolean);

        const bonus = {};
        if (primeiro && bonus1 !== "") bonus[primeiro] = parseInt(bonus1, 10) || 0;
        if (segundo && bonus2 !== "") bonus[segundo] = parseInt(bonus2, 10) || 0;
        if (terceiro && bonus3 !== "") bonus[terceiro] = parseInt(bonus3, 10) || 0;

        const penalidade = {};
        if (primeiro && pen1 !== "") penalidade[primeiro] = parseInt(pen1, 10) || 0;
        if (segundo && pen2 !== "") penalidade[segundo] = parseInt(pen2, 10) || 0;
        if (terceiro && pen3 !== "") penalidade[terceiro] = parseInt(pen3, 10) || 0;

        return { classificacao, bonus, penalidade };
    }

    async function handleConfirmar() {
        setErro("");

        if (!atividade?.id) {
            setErro("Atividade inválida.");
            return;
        }
        // precisa pelo menos do 1º lugar
        if (!primeiro) {
            setErro("Selecione pelo menos o 1º lugar.");
            return;
        }
        // checagem de duplicidade (só por segurança extra)
        const cls = [primeiro, segundo, terceiro].filter(Boolean);
        if (new Set(cls).size !== cls.length) {
            setErro("Há equipes repetidas no pódio. Verifique as seleções.");
            return;
        }

        const payload = montarPayload();

        try {
            setSalvando(true);
            await api.patch(`/atividades/${atividade.id}/encerrar`, payload);
            onClose?.();
            onSucesso?.(); // recarregar a lista no pai
        } catch (e) {
            console.error(e);
            setErro("Falha ao encerrar a atividade.");
        } finally {
            setSalvando(false);
        }
    }

    if (!aberta) return null;

    return (
        <div className="modal-bg" role="dialog" aria-modal="true">
            <div className="modal-card">
                <div className="modal-head">
                    <h3 style={{ margin: 0, fontWeight: 700 }}>Encerrar atividade</h3>
                    <button className="btn btn-secondary" onClick={onClose}>X</button>
                </div>

                {erro && <div className="alert-erro">{erro}</div>}
                <div className="modal-body">
                    {[1, 2, 3].map((pos) => {
                        const label = `${pos}º lugar`;
                        const pontos =
                            pos === 1
                                ? atividade?.pontosPrimeiro ?? 0
                                : pos === 2
                                    ? atividade?.pontosSegundo ?? 0
                                    : atividade?.pontosTerceiro ?? 0;

                        const equipe = pos === 1 ? primeiro : pos === 2 ? segundo : terceiro;
                        const setEquipe = pos === 1 ? setPrimeiro : pos === 2 ? setSegundo : setTerceiro;

                        const bonus = pos === 1 ? bonus1 : pos === 2 ? bonus2 : bonus3;
                        const setBonus = pos === 1 ? setBonus1 : pos === 2 ? setBonus2 : setBonus3;

                        const pen = pos === 1 ? pen1 : pos === 2 ? pen2 : pen3;
                        const setPen = pos === 1 ? setPen1 : pos === 2 ? setPen2 : setPen3;

                        return (
                            <div key={pos} className="bloco-posicao">
                                <div className="bloco-header">
                                    <h4>
                                        {label} <span>{pontos} pontos</span>
                                    </h4>
                                </div>

                                <div className="linha-form">
                                    <div className="col-form">
                                        <span className="label">Equipe</span>
                                        <select
                                            className="input"
                                            value={equipe}
                                            onChange={(e) => setEquipe(e.target.value)}
                                        >
                                            <option value="">Selecione</option>
                                            {equipes.map((eq) => (
                                                <option key={eq.id} value={eq.id} disabled={optionDisabled(eq.id)}>
                                                    {eq.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-form">
                                        <span className="label">Bônus</span>
                                        <input
                                            className="input"
                                            type="number"
                                            placeholder="0"
                                            value={bonus}
                                            onChange={(e) => setBonus(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-form">
                                        <span className="label">Penalidade</span>
                                        <input
                                            className="input"
                                            type="number"
                                            placeholder="0"
                                            value={pen}
                                            onChange={(e) => setPen(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="btn-row" style={{ marginTop: 16 }}>
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={handleConfirmar}
                        disabled={salvando}
                        title="Encerrar a atividade e registrar pódio/bônus/penalidades"
                    >
                        {salvando ? "Encerrando..." : "🏁 Confirmar Encerramento"}
                    </button>
                </div>
            </div>
        </div>
    );
}
