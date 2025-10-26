// src/pages/prof/EquipesProf.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  listarEquipes,
  obterEquipe,
  criarEquipe,
  atualizarEquipe,
} from "../../api/equipes";
import { obterGincanaAtiva } from "../../api/gincana";
import "../../styles/Equipes.css";

export default function EquipesProf() {
  const [equipes, setEquipes] = useState([]);
  const [selecionada, setSelecionada] = useState(null);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [nova, setNova] = useState({ nome: "", gincanaId: "" });

  const [gincanas, setGincanas] = useState([]); // [{id, nome}]

  // alinhar card de detalhes com o 1º card da lista
  const listaRef = useRef(null);
  const [offsetDetalhes, setOffsetDetalhes] = useState(0);

  useEffect(() => {
    (async () => {
      await carregarGincanas();
      await carregarEquipes();
    })();
  }, []);

  async function carregarGincanas() {
    try {
      const ativa = await obterGincanaAtiva();
      setGincanas(ativa ? [ativa] : []);
    } catch {
      setGincanas([]);
    }
  }

  async function carregarEquipes() {
    setErro("");
    try {
      const data = await listarEquipes();
      const normalizadas = (data || []).map((e) => ({
        id: e.id,
        nome: e.nome || "",
        ativo: !!e.ativo,
        gincanaId: e.gincanaId || e.gincana?.id || "",
        gincanaNome: e.gincana?.nome || "",
      }));
      setEquipes(normalizadas);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar as equipes.");
    }
  }

  // alinhar detalhes com o primeiro card visível
  useEffect(() => {
    function calcularOffset() {
      if (!listaRef.current) return;
      const primeiroCard = listaRef.current.querySelector(".eq-card");
      if (!primeiroCard) {
        setOffsetDetalhes(0);
        return;
      }
      const listaTop =
        listaRef.current.getBoundingClientRect().top + window.scrollY;
      const cardTop = primeiroCard.getBoundingClientRect().top + window.scrollY;
      setOffsetDetalhes(Math.max(0, Math.round(cardTop - listaTop)));
    }
    calcularOffset();
    window.addEventListener("resize", calcularOffset);
    return () => window.removeEventListener("resize", calcularOffset);
  }, [equipes]);

  async function handleSelecionar(id) {
    setErro("");
    setSucesso("");
    try {
      const e = await obterEquipe(id);
      setSelecionada({
        id: e.id,
        nome: e.nome || "",
        ativo: !!e.ativo,
        gincanaId: e.gincanaId || e.gincana?.id || "",
        gincanaNome: e.gincana?.nome || "",
      });
    } catch (err) {
      console.error(err);
      setErro("Falha ao carregar detalhes da equipe.");
    }
  }

  async function handleSalvar(e) {
    e.preventDefault();
    if (!selecionada?.id) return;

    setErro("");
    setSucesso("");
    setSalvando(true);
    try {
      const payload = {
        nome: (selecionada.nome || "").trim(),
        gincanaId: selecionada.gincanaId,
        ativo: !!selecionada.ativo,
      };

      await atualizarEquipe(selecionada.id, payload);

      // reflete alterações localmente
      setEquipes((prev) =>
        prev.map((x) =>
          x.id === selecionada.id
            ? { ...x, nome: payload.nome, gincanaId: payload.gincanaId, ativo: payload.ativo }
            : x
        )
      );

      setSucesso("Equipe atualizada com sucesso!");
    } catch (err) {
      console.error(err);
      setErro("Falha ao salvar alterações.");
    } finally {
      setSalvando(false);
    }
  }

  // criação
  function abrirModal() {
    setErro("");
    setSucesso("");
    setNova({
      nome: "",
      gincanaId: gincanas[0]?.id || "",
    });
    setModalAberto(true);
  }
  function fecharModal() {
    setModalAberto(false);
  }

  async function handleCriar(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!nova.nome.trim()) {
      setErro("Informe o nome da equipe.");
      return;
    }
    if (!nova.gincanaId) {
      setErro("Selecione a gincana.");
      return;
    }

    try {
      setSalvando(true);
      await criarEquipe({
        nome: nova.nome.trim(),
        gincanaId: nova.gincanaId,
        ativo: true, // sempre true conforme pedido
      });
      setSucesso("Equipe criada com sucesso!");
      fecharModal();
      await carregarEquipes();
    } catch (err) {
      console.error(err);
      setErro("Falha ao criar equipe.");
    } finally {
      setSalvando(false);
    }
  }

  const equipesOrdenadas = useMemo(
    () => [...equipes].sort((a, b) => a.nome.localeCompare(b.nome)),
    [equipes]
  );

  return (
    <main className="equipes-wrap">
      {/* LISTA */}
      <section className="equipes-lista" ref={listaRef}>
        <h1 className="eq-titulo">Equipes</h1>

        {equipesOrdenadas.length === 0 ? (
          <div className="eq-vazio">Nenhuma equipe cadastrada.</div>
        ) : (
          <ul className="eq-ul">
            {equipesOrdenadas.map((e) => (
              <li
                key={e.id}
                className={`eq-card ${selecionada?.id === e.id ? "ativo" : ""}`}
                onClick={() => handleSelecionar(e.id)}
              >
                <div className="eq-info">
                  <div className="eq-nome">{e.nome}</div>
                  <div className="eq-sub">
                    {e.gincanaNome ||
                      gincanas.find((g) => g.id === e.gincanaId)?.nome ||
                      "—"}
                  </div>
                </div>
                <span className={`eq-dot ${e.ativo ? "on" : "off"}`} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* DETALHES (sem datas) */}
      <aside className="equipes-detalhes" style={{ marginTop: offsetDetalhes }}>
        <div className="eq-head">
          <h2>Detalhes</h2>
          <button
            className="btn btn-primary btn-sm"
            onClick={abrirModal}
            disabled={!gincanas.length}
            title={
              gincanas.length ? "Cadastrar nova equipe" : "Crie uma gincana primeiro"
            }
          >
            + Nova Equipe
          </button>
        </div>

        {!selecionada ? (
          <p className="eq-help">Selecione uma equipe à esquerda.</p>
        ) : (
          <form onSubmit={handleSalvar}>
            {/* ID */}
            <div className="form-field">
              <label>ID</label>
              <input type="text" value={selecionada.id} readOnly />
            </div>

            {/* Nome (editável) */}
            <div className="form-field">
              <label>Nome</label>
              <input
                type="text"
                value={selecionada.nome}
                onChange={(e) =>
                  setSelecionada({ ...selecionada, nome: e.target.value })
                }
                required
              />
            </div>

            {/* Gincana (editável) */}
            <div className="form-field">
              <label>Gincana</label>
              <select
                value={selecionada.gincanaId}
                onChange={(e) =>
                  setSelecionada({ ...selecionada, gincanaId: e.target.value })
                }
                required
              >
                <option value="">Selecione...</option>
                {gincanas.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Status (editável) */}
            <div className="form-field">
              <label>Status</label>
              <select
                value={String(!!selecionada.ativo)}
                onChange={(e) =>
                  setSelecionada({
                    ...selecionada,
                    ativo: e.target.value === "true",
                  })
                }
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>

            {erro && <div className="alert erro">{erro}</div>}
            {sucesso && <div className="alert sucesso">{sucesso}</div>}

            <button className="btn btn-primary" type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </form>
        )}
      </aside>

      {/* MODAL NOVA EQUIPE */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Nova Equipe</h3>
              <button className="btn-close" onClick={fecharModal} aria-label="Fechar">
                ×
              </button>
            </div>

            <form onSubmit={handleCriar}>
              <div className="form-field">
                <label>Nome da equipe</label>
                <input
                  type="text"
                  value={nova.nome}
                  onChange={(e) => setNova({ ...nova, nome: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label>Gincana</label>
                <select
                  value={nova.gincanaId}
                  onChange={(e) =>
                    setNova({ ...nova, gincanaId: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione...</option>
                  {gincanas.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nome}
                    </option>
                  ))}
                </select>
              </div>

              {erro && <div className="alert erro">{erro}</div>}
              {sucesso && <div className="alert sucesso">{sucesso}</div>}

              <button
                className="btn btn-primary"
                type="submit"
                disabled={salvando || !gincanas.length}
              >
                {salvando ? "Criando..." : "Criar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
