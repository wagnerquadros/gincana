import { useEffect, useMemo, useState } from "react";
import { listarUsuarios } from "../../api/usuarios";
import { useAutenticacao } from "../../auth/useAutenticacao";
import api from "../../api/client";
import "../../styles/Usuarios.css";
import ModalCriarUsuario from "../../components/ModalCriarUsuario";

export default function UsuariosAdmin() {
  // ======= ESTADO =======
  const [usuarios, setUsuarios] = useState([]);
  const [selecionado, setSelecionado] = useState(null);

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  // Filtros: PROFESSOR | ALUNO | INATIVOS
  const [filtro, setFiltro] = useState("PROFESSOR");

  // cache de equipes: { [equipeId]: nome|null }
  const [equipesCache, setEquipesCache] = useState({});
  // ids já consultados (evita re-busca infinita)
  const [consultados, setConsultados] = useState(new Set());
  const [mostrarCriar, setMostrarCriar] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  // ======= CONTEXTO DE AUTENTICAÇÃO =======
  const { usuario } = useAutenticacao();
  const minhaRole = (usuario?.role || "").toUpperCase();
  const podeVer = minhaRole === "ADM" || minhaRole === "PROFESSOR";

  // Garante Authorization no axios
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }, []);


  // ======= HELPERS =======
  function avatarDe(u) {
    if (u?.foto) return <img src={u.foto} alt={u.nome} />;
    const letra = (u?.nome || "?").trim().charAt(0).toUpperCase();
    return <span className="avatar-letra">{letra}</span>;
  }

  function fmtData(v) {
    if (!v) return "—";
    if (typeof v === "object" && v !== null && "_seconds" in v) {
      const d = new Date(v._seconds * 1000);
      return d.toLocaleDateString();
    }
    const d = new Date(v);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  }


  async function inativarUsuario(u) {
    if (!u?.id) return;
    const confirma = window.confirm(`Deseja realmente inativar o usuário "${u.nome}"?`);
    if (!confirma) return;

    try {
      // Chama o endpoint (usa método DELETE ou PUT, conforme teu backend)
      const resp = await api.delete(`/usuarios/${u.id}`);
      console.log("Usuário inativado:", resp.data);

      // Atualiza estado local
      setUsuarios((prev) =>
        prev.map((item) =>
          item.id === u.id ? { ...item, ativo: false } : item
        )
      );
      setSelecionado((prev) => (prev ? { ...prev, ativo: false } : prev));

      alert("Usuário inativado com sucesso!");
    } catch (err) {
      console.error("Erro ao inativar usuário:", err);
      alert("Falha ao inativar usuário.");
    }
  }


  function nomeEquipeDoSelecionado(sel) {
    if (!sel || sel.role !== "ALUNO") return "—";
    // prioridade: valor já resolvido no próprio selecionado
    if (sel.equipeNome) return sel.equipeNome;
    // depois, cache
    if (sel.equipeId && typeof equipesCache[sel.equipeId] !== "undefined") {
      return equipesCache[sel.equipeId] || "—";
    }
    // por fim, estado carregando
    return sel.equipeId ? "Carregando equipe..." : "—";
  }

  // ======= BUSCA NOME DA EQUIPE (usa /equipes/:id/resumo e aceita {nome}) =======
  async function resolverNomeEquipe(equipeId) {
    if (!equipeId) return null;

    // já em cache?
    if (typeof equipesCache[equipeId] !== "undefined") {
      return equipesCache[equipeId];
    }
    // já consultado? evita loops
    if (consultados.has(equipeId)) return null;

    // marca como consultado
    setConsultados((prev) => {
      const novo = new Set(prev);
      novo.add(equipeId);
      return novo;
    });

    try {
      const url = `/equipes/${encodeURIComponent(equipeId)}/resumo`;
      const { data } = await api.get(url);
      const nome = data?.nome ?? data?.nomeEquipe ?? null;
      setEquipesCache((prev) => ({ ...prev, [equipeId]: nome ?? null }));
      return nome ?? null;
    } catch {
      // 404/qualquer erro → cacheia null para não repetir
      setEquipesCache((prev) => ({ ...prev, [equipeId]: null }));
      return null;
    }
  }

  // ======= CARREGAR USUÁRIOS =======
  useEffect(() => {
    if (!podeVer) return;

    (async () => {
      try {
        setErro("");
        setCarregando(true);

        // Agora o backend já entrega equipeId diretamente
        const lista = await listarUsuarios();

        const normalizada = (lista || []).map((u) => ({
          id: u.id,
          nome: u.nome || "",
          email: u.email || "",
          role: (u.role || "").toUpperCase(),
          ativo: Boolean(u.ativo),
          foto: u.foto || null,
          criadoEm: u.criadoEm || null,
          updatedAt: u.updatedAt || null,
          equipeId: u.equipeId || null, // <=== USANDO APENAS ESSE CAMPO
          equipeNome: null, // será preenchido depois (se houver)
        }));

        // ordena alfabeticamente por nome
        normalizada.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
        setUsuarios(normalizada);

        // Coleta IDs de equipe que precisam de nome (somente alunos, equipeId != null)
        const idsParaResolver = [
          ...new Set(
            normalizada
              .filter(
                (u) =>
                  u.role === "ALUNO" &&
                  u.equipeId &&
                  typeof equipesCache[u.equipeId] === "undefined"
              )
              .map((u) => u.equipeId)
          ),
        ];

        if (idsParaResolver.length > 0) {
          const pares = await Promise.all(
            idsParaResolver.map(async (id) => ({ id, nome: await resolverNomeEquipe(id) }))
          );

          const novos = {};
          pares.forEach(({ id, nome }) => (novos[id] = nome ?? null));

          if (Object.keys(novos).length > 0) {
            // atualiza cache
            setEquipesCache((prev) => ({ ...prev, ...novos }));
            // propaga para a lista
            setUsuarios((prev) =>
              prev.map((u) =>
                u.equipeId && typeof novos[u.equipeId] !== "undefined"
                  ? { ...u, equipeNome: novos[u.equipeId] }
                  : u
              )
            );
            // propaga para o selecionado
            setSelecionado((prev) =>
              prev &&
                prev.equipeId &&
                typeof novos[prev.equipeId] !== "undefined"
                ? { ...prev, equipeNome: novos[prev.equipeId] }
                : prev
            );
          }
        }
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar usuários.");
      } finally {
        setCarregando(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podeVer, reloadTick]);

  function abrirModalCriar() {
    setMostrarCriar(true);
  }

  function fecharModalCriar() {
    setMostrarCriar(false);
  }

  function aoUsuarioCriado() {
    setReloadTick((t) => t + 1);
  }

  // ======= FILTRO =======
  const usuariosFiltrados = useMemo(() => {
    const base = [...usuarios].sort((a, b) =>
      (a.nome || "").localeCompare(b.nome || "")
    );

    if (filtro === "PROFESSOR") {
      return base.filter((u) => u.role === "PROFESSOR" && u.ativo === true);
    }
    if (filtro === "ALUNO") {
      return base.filter((u) => u.role === "ALUNO" && u.ativo === true);
    }
    if (filtro === "INATIVOS") {
      return base.filter((u) => u.ativo === false);
    }
    return base;
  }, [usuarios, filtro]);

  if (!podeVer) {
    return (
      <main className="usuarios-page">
        <div className="alert-erro">Acesso não permitido.</div>
      </main>
    );
  }

  return (
    <main className="usuarios-page">
      {/* HEADER: botão + filtros */}
      <header className="usuarios-header">
        <div className="titulo-area">
          <button className="btn btn-primary" onClick={abrirModalCriar}>➕ Cadastrar novo usuário</button>
        </div>

        <div className="tabs" role="tablist" aria-label="Filtros de usuários">
          <button
            className={`tab-chip ${filtro === "PROFESSOR" ? "active" : ""}`}
            onClick={() => setFiltro("PROFESSOR")}
            role="tab"
            aria-selected={filtro === "PROFESSOR"}
          >
            Professores
          </button>
          <button
            className={`tab-chip ${filtro === "ALUNO" ? "active" : ""}`}
            onClick={() => setFiltro("ALUNO")}
            role="tab"
            aria-selected={filtro === "ALUNO"}
          >
            Alunos
          </button>
          <button
            className={`tab-chip ${filtro === "INATIVOS" ? "active" : ""}`}
            onClick={() => setFiltro("INATIVOS")}
            role="tab"
            aria-selected={filtro === "INATIVOS"}
          >
            Usuários Inativos
          </button>
        </div>
      </header>

      {erro && <div className="alert-erro">{erro}</div>}
      {carregando && <p>Carregando...</p>}

      {!carregando && (
        <div className="usuarios-layout">
          {/* COLUNA ESQUERDA — LISTA (sem o título "Lista") */}
          <section className="card card-elev usuarios-lista">
            {usuariosFiltrados.length === 0 ? (
              <div className="vazio">Nenhum usuário neste filtro.</div>
            ) : (
              <ul className="lista-cards-usuarios">
                {usuariosFiltrados.map((u) => (
                  <li
                    key={u.id}
                    className={`user-card ${selecionado?.id === u.id ? "ativo" : ""}`}
                    onClick={() => setSelecionado(u)}
                  >
                    <div className="avatar">{avatarDe(u)}</div>

                    <div className="user-info">
                      <strong className="user-nome">{u.nome}</strong>
                      <span className="user-email">{u.email}</span>

                      {/* Se for aluno, mostra nome da equipe */}
                      {u.role === "ALUNO" && (
                        <span className="user-equipe">
                          {
                            // prioridade: equipeNome resolvido
                            u.equipeNome ??
                            // depois: cache
                            (u.equipeId &&
                              typeof equipesCache[u.equipeId] !== "undefined"
                              ? equipesCache[u.equipeId] || "—"
                              : // se tem id e ainda não veio do cache → carregando
                              u.equipeId
                                ? "Carregando equipe..."
                                : // sem equipe
                                "—")
                          }
                        </span>
                      )}
                    </div>

                    <div className="user-badges">
                      <span
                        className={`role-pill ${u.role === "ADM" ? "adm" : u.role === "PROFESSOR" ? "prof" : "aluno"
                          }`}
                      >
                        {u.role}
                      </span>
                      <span
                        className={`status-pill ${u.ativo ? "ativo" : "inativo"}`}
                        title={u.ativo ? "Ativo" : "Inativo"}
                      >
                        {u.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* COLUNA DIREITA — DETALHES (mesma altura visual) */}
          <aside className="card card-elev usuarios-detalhes">
            {!selecionado ? (
              <div className="vazio">Selecione um usuário na lista.</div>
            ) : (
              <>
                <div className="detalhes-topo">
                  <div className="avatar grande">{avatarDe(selecionado)}</div>
                  <div className="topo-textos">
                    <h2 className="det-nome">{selecionado.nome}</h2>
                    <p className="det-email">{selecionado.email}</p>
                  </div>
                </div>

                <div className="detalhe-campo">
                  <span className="campo-label">Perfil</span>
                  <p className="campo-valor">{selecionado.role || "—"}</p>
                </div>

                <div className="detalhe-campo">
                  <span className="campo-label">Equipe (se aluno)</span>
                  <p className="campo-valor">{nomeEquipeDoSelecionado(selecionado)}</p>
                </div>

                <div className="detalhe-campo">
                  <span className="campo-label">Criado em</span>
                  <p className="campo-valor">{fmtData(selecionado.criadoEm)}</p>
                </div>

                <div className="detalhe-campo">
                  <span className="campo-label">Atualizado em</span>
                  <p className="campo-valor">{fmtData(selecionado.updatedAt)}</p>
                </div>

                <div className="btn-row">
                  <button className="btn btn-primary">✏️ Editar</button>
                  <button
                    className="btn btn-danger"
                    onClick={() => inativarUsuario(selecionado)}>
                    🗑️ Inativar
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
      {mostrarCriar && (
        <ModalCriarUsuario
          aberta={mostrarCriar}
          onClose={fecharModalCriar}
          onUsuarioCriado={aoUsuarioCriado}
        />
      )}
    </main>
  );
}
