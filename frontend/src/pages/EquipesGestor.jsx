import React, { useEffect, useState } from "react";
import { Users, Trash2, PlusCircle, Pencil, Award, Eye } from "lucide-react";
import MockedButton from "../components/ui/MockedButton";
import "../styles/EquipesGestor.css"; // Import do CSS

export default function EquipesGestor() {
  const [equipes, setEquipes] = useState([]);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modalNovaEquipeAberto, setModalNovaEquipeAberto] = useState(false);
  const [equipeSelecionada, setEquipeSelecionada] = useState(null);

  const [nomeEditado, setNomeEditado] = useState("");
  const [nomeNovaEquipe, setNomeNovaEquipe] = useState("");
  const [gincanaNovaEquipe, setGincanaNovaEquipe] = useState("");

  const fetchEquipes = async () => {
    setCarregando(true);
    try {
      const res = await fetch("http://localhost:3000/equipes/");
      if (!res.ok) throw new Error("Erro ao carregar equipes");
      const data = await res.json();
      setEquipes(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { fetchEquipes(); }, []);

  const abrirModalVisualizar = async (equipe) => {
    try {
      const res = await fetch(`http://localhost:3000/equipes/${equipe.id}`);
      if (!res.ok) throw new Error("Erro ao buscar informações da equipe");
      const data = await res.json();
      setEquipeSelecionada(data);
      setModalVisualizarAberto(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const abrirModalEditar = (equipe) => {
    setEquipeSelecionada(equipe);
    setNomeEditado(equipe.nome);
    setModalEditarAberto(true);
  };

  const salvarEdicao = async () => {
    const payload = { nome: nomeEditado || equipeSelecionada.nome, gincana: equipeSelecionada.gincana || "", pontuacoes: equipeSelecionada.pontuacoes || [] };
    try {
      const res = await fetch(`http://localhost:3000/equipes/${equipeSelecionada.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erro ao atualizar equipe");
      const dataAtualizada = await res.json();
      setEquipes(equipes.map((e) => (e.id === equipeSelecionada.id ? dataAtualizada : e)));
      setModalEditarAberto(false);
    } catch (err) { alert(err.message); }
  };

  const abrirModalExcluir = (equipe) => { setEquipeSelecionada(equipe); setModalExcluirAberto(true); };
  const confirmarExclusao = async () => {
    try {
      const res = await fetch(`http://localhost:3000/equipes/${equipeSelecionada.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir equipe");
      setEquipes(equipes.filter((e) => e.id !== equipeSelecionada.id));
      setModalExcluirAberto(false);
    } catch (err) { alert(err.message); }
  };

  const abrirModalNovaEquipe = () => { setNomeNovaEquipe(""); setGincanaNovaEquipe(""); setModalNovaEquipeAberto(true); };
  const salvarNovaEquipe = async () => {
    if (!nomeNovaEquipe.trim()) return alert("Nome obrigatório!");
    const payload = { nome: nomeNovaEquipe, gincana: gincanaNovaEquipe || "", pontuacoes: [] };
    try {
      const res = await fetch("http://localhost:3000/equipes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erro ao criar equipe");
      const novaEquipe = await res.json();
      setEquipes([...equipes, novaEquipe]);
      setModalNovaEquipeAberto(false);
    } catch (err) { alert(err.message); }
  };

  if (carregando)
    return (
      <div className="overlay">
        <div style={{ textAlign: "center" }}>
          <div className="spinner" />
          <p>Carregando equipes...</p>
        </div>
      </div>
    );

  if (erro) return <div className="overlay"><p style={{ color: "red" }}>Erro: {erro}</p></div>;

  return (
    <div className="container">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Users size={32} />
            <h1 style={{ fontSize: 32, fontWeight: 700, color: "black" }}>Equipes</h1>
          </div>
          <MockedButton onClick={abrirModalNovaEquipe} variant="primary" icon={PlusCircle}>Nova Equipe</MockedButton>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          {equipes.length === 0 ? (
            <p style={{ color: "#999", textAlign: "center" }}>Nenhuma equipe cadastrada.</p>
          ) : (
            equipes.map((equipe) => (
              <div key={equipe.id} className="card">
                <h2 style={{ fontSize: 20, color: "#3b82f6", marginBottom: 10 }}>{equipe.nome}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
                  <Award size={16} color="#fcd34d" />
                  <span>Pontuações: <strong>{equipe.pontuacoes?.length || 0}</strong></span>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                  <MockedButton onClick={() => abrirModalVisualizar(equipe)} variant="secondary"><Eye size={16} /></MockedButton>
                  <MockedButton onClick={() => abrirModalEditar(equipe)} variant="secondary"><Pencil size={16} /></MockedButton>
                  <MockedButton onClick={() => abrirModalExcluir(equipe)} variant="danger"><Trash2 size={16} /></MockedButton>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modalVisualizarAberto && equipeSelecionada && (
        <Modal>
          <h2>{equipeSelecionada.nome}</h2>
          <p><strong>Gincana:</strong> {equipeSelecionada.gincana || "-"}</p>
          <p><strong>Pontuações:</strong> {equipeSelecionada.pontuacoes?.length || 0}</p>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
            <MockedButton onClick={() => setModalVisualizarAberto(false)}>Fechar</MockedButton>
          </div>
        </Modal>
      )}

      {modalEditarAberto && (
        <Modal>
          <h2>Editar Equipe</h2>
          <input className="input" value={nomeEditado} onChange={(e) => setNomeEditado(e.target.value)} />
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <MockedButton onClick={salvarEdicao}>Salvar</MockedButton>
            <MockedButton onClick={() => setModalEditarAberto(false)}>Cancelar</MockedButton>
          </div>
        </Modal>
      )}

      {modalExcluirAberto && (
        <Modal>
          <h2>Confirmar Exclusão</h2>
          <p>Deseja realmente excluir a equipe {equipeSelecionada?.nome}?</p>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <MockedButton variant="danger" onClick={confirmarExclusao}>Excluir</MockedButton>
            <MockedButton onClick={() => setModalExcluirAberto(false)}>Cancelar</MockedButton>
          </div>
        </Modal>
      )}

      {modalNovaEquipeAberto && (
        <Modal>
          <h2>Nova Equipe</h2>
          <input className="input" placeholder="Nome da equipe" value={nomeNovaEquipe} onChange={(e) => setNomeNovaEquipe(e.target.value)} />
          <input className="input" placeholder="Gincana" style={{ marginTop: 10 }} value={gincanaNovaEquipe} onChange={(e) => setGincanaNovaEquipe(e.target.value)} />
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <MockedButton onClick={salvarNovaEquipe}>Salvar</MockedButton>
            <MockedButton onClick={() => setModalNovaEquipeAberto(false)}>Cancelar</MockedButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

const Modal = ({ children }) => (
  <div className="modal-overlay">
    <div className="modal-content">{children}</div>
  </div>
);
