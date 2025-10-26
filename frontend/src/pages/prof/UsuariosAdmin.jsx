// src/pages/prof/UsuariosAdmin.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  listarUsuarios,
  obterUsuario,
  atualizarUsuario,
  criarUsuario,
} from "../../api/usuarios";
import { useAutenticacao } from "../../auth/useAutenticacao";
import "../../styles/Usuarios.css";

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [selecionado, setSelecionado] = useState(null);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [novo, setNovo] = useState({
    nome: "",
    email: "",
    ativo: false, // agora cadastra INATIVO por padrão
    role: "PROFESSOR", // menu com PROFESSOR/ALUNO
    senha: "",
    confirmarSenha: "",
  });

  // refs para alinhar o card de detalhes
  const listaRef = useRef(null);
  const [offsetDetalhes, setOffsetDetalhes] = useState(0);

  const { usuario } = useAutenticacao();
  const minhaRole = (usuario?.role || "").toUpperCase();
  const meuId = usuario?.id;
  const souADM = minhaRole === "ADM";

  // ======= carregar lista =======
  useEffect(() => {
    carregarUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarUsuarios() {
    setErro("");
    try {
      const lista = await listarUsuarios();
      setUsuarios(
        (lista || []).map((u) => ({
          id: u.id,
          nome: u.nome || "",
          email: u.email || "",
          role: (u.role || "").toUpperCase(),
          ativo: Boolean(u.ativo),
        }))
      );
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar usuários.");
    }
  }

  // grupos
  const admins = useMemo(
    () => (souADM ? usuarios.filter((u) => u.role === "ADM" && u.id === meuId) : []),
    [souADM, usuarios, meuId]
  );
  const profs = useMemo(
    () => usuarios.filter((u) => u.role === "PROFESSOR"),
    [usuarios]
  );
  const alunos = useMemo(
    () => usuarios.filter((u) => u.role === "ALUNO"),
    [usuarios]
  );

  // ======= alinhar detalhes com o 1º card =======
  useEffect(() => {
    function calcularOffset() {
      if (!listaRef.current) return;
      // procura o primeiro card-usuario visível dentro da lista
      const primeiroCard = listaRef.current.querySelector(".card-usuario");
      if (!primeiroCard) {
        setOffsetDetalhes(0);
        return;
      }
      const listaTop = listaRef.current.getBoundingClientRect().top + window.scrollY;
      const cardTop = primeiroCard.getBoundingClientRect().top + window.scrollY;
      const gap = 0; // ajuste fino se quiser (px)
      const novoOffset = Math.max(0, Math.round(cardTop - listaTop - gap));
      setOffsetDetalhes(novoOffset);
    }

    calcularOffset();
    window.addEventListener("resize", calcularOffset);
    return () => window.removeEventListener("resize", calcularOffset);
  }, [usuarios]);

  // ======= seleção / edição =======
  async function handleSelecionar(id) {
    setErro("");
    setSucesso("");
    try {
      const u = await obterUsuario(id);
      setSelecionado({
        id: u.id,
        nome: u.nome || "",
        email: u.email || "",
        ativo: Boolean(u.ativo),
      });
    } catch (e) {
      console.error(e);
      setErro("Falha ao carregar detalhes do usuário.");
    }
  }

  async function handleSalvar(e) {
    e.preventDefault();
    if (!selecionado?.id) return;

    setErro("");
    setSucesso("");
    setSalvando(true);
    try {
      const atualizado = await atualizarUsuario(selecionado.id, {
        nome: selecionado.nome,
        email: selecionado.email,
        ativo: selecionado.ativo,
      });
      setSucesso("Usuário atualizado com sucesso!");
      setUsuarios((prev) =>
        prev.map((u) => (u.id === atualizado.id ? { ...u, ...atualizado } : u))
      );
    } catch (e) {
      console.error(e);
      setErro("Falha ao salvar alterações.");
    } finally {
      setSalvando(false);
    }
  }

  // ======= criação =======
  function abrirModalNovo() {
    setErro("");
    setSucesso("");
    setNovo({
      nome: "",
      email: "",
      ativo: false, // inativo por padrão
      role: "PROFESSOR",
      senha: "",
      confirmarSenha: "",
    });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  async function handleCriarNovo(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!novo.nome.trim() || !novo.email.trim()) {
      setErro("Informe nome e e-mail.");
      return;
    }
    if (novo.senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novo.senha !== novo.confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    try {
      setSalvando(true);
      await criarUsuario({
        nome: novo.nome.trim(),
        email: novo.email.trim().toLowerCase(),
        senha: novo.senha,
        ativo: novo.ativo,            // inativo por padrão
        role: novo.role,              // PROFESSOR ou ALUNO
      });
      setSucesso("Usuário criado com sucesso!");
      fecharModal();
      await carregarUsuarios();
    } catch (e) {
      console.error(e);
      setErro("Falha ao criar usuário.");
    } finally {
      setSalvando(false);
    }
  }

  // ======= UI =======
  function Grupo({ titulo, lista }) {
    return (
      <div className="grupo">
        <h2 className="grupo-titulo">{titulo}</h2>
        {lista.length === 0 ? (
          <p className="vazio">Nenhum usuário</p>
        ) : (
          lista.map((u) => (
            <div
              key={u.id}
              className={`card-usuario ${selecionado?.id === u.id ? "ativo" : ""}`}
              onClick={() => handleSelecionar(u.id)}
            >
              <div className="card-info">
                <div className="card-nome">{u.nome}</div>
                <div className="card-email">{u.email}</div>
              </div>
              <span
                className={`status ${u.ativo ? "ativo" : "inativo"}`}
                title={u.ativo ? "Ativo" : "Inativo"}
              >
                {u.ativo ? "●" : "○"}
              </span>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <main className="usuarios-container">
      {/* COLUNA ESQUERDA — Listas */}
      <div className="usuarios-lista" ref={listaRef}>
        <h1 className="lista-titulo">Usuários</h1>
        {souADM && <Grupo titulo="Administradores" lista={admins} />}
        <Grupo titulo="Professores" lista={profs} />
        <Grupo titulo="Alunos" lista={alunos} />
      </div>

      {/* COLUNA DIREITA — Detalhes + Botão Novo */}
      <div className="usuarios-detalhes" style={{ marginTop: offsetDetalhes }}>
        <div className="detalhes-header">
          <h2>Detalhes</h2>
          <button className="btn btn-primary btn-sm" onClick={abrirModalNovo}>
            + Novo Usuário
          </button>
        </div>

        {!selecionado ? (
          <p className="vazio">Selecione um usuário à esquerda.</p>
        ) : (
          <form onSubmit={handleSalvar}>
            <div className="form-field">
              <label>Nome</label>
              <input
                type="text"
                value={selecionado.nome}
                onChange={(e) =>
                  setSelecionado({ ...selecionado, nome: e.target.value })
                }
              />
            </div>

            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                value={selecionado.email}
                onChange={(e) =>
                  setSelecionado({ ...selecionado, email: e.target.value })
                }
              />
            </div>

            <div className="form-field">
              <label>Status</label>
              <select
                value={String(!!selecionado.ativo)}
                onChange={(e) =>
                  setSelecionado({
                    ...selecionado,
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

            <button type="submit" className="btn btn-primary" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </form>
        )}
      </div>

      {/* ===== MODAL NOVO USUÁRIO ===== */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Novo Usuário</h3>
              <button className="btn-close" onClick={fecharModal} aria-label="Fechar">
                ×
              </button>
            </div>

            <form onSubmit={handleCriarNovo}>
              <div className="form-field">
                <label>Nome</label>
                <input
                  type="text"
                  value={novo.nome}
                  onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  value={novo.email}
                  onChange={(e) => setNovo({ ...novo, email: e.target.value })}
                  required
                />
              </div>

              {/* Role: apenas PROFESSOR ou ALUNO (para ADM e Professor) */}
              <div className="form-field">
                <label>Perfil</label>
                <select
                  value={novo.role}
                  onChange={(e) => setNovo({ ...novo, role: e.target.value })}
                >
                  <option value="PROFESSOR">PROFESSOR</option>
                  <option value="ALUNO">ALUNO</option>
                </select>
              </div>


              <div className="form-field">
                <label>Status</label>
                <select
                  value={String(novo.ativo)}
                  onChange={(e) => setNovo({ ...novo, ativo: e.target.value === "true" })}
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>

              <div className="form-field">
                <label>Senha</label>
                <input
                  type="password"
                  value={novo.senha}
                  onChange={(e) => setNovo({ ...novo, senha: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <div className="form-field">
                <label>Confirmar Senha</label>
                <input
                  type="password"
                  value={novo.confirmarSenha}
                  onChange={(e) =>
                    setNovo({ ...novo, confirmarSenha: e.target.value })
                  }
                  required
                />
              </div>

              {erro && <div className="alert erro">{erro}</div>}
              {sucesso && <div className="alert sucesso">{sucesso}</div>}

              <button type="submit" className="btn btn-primary" disabled={salvando}>
                {salvando ? "Criando..." : "Criar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
