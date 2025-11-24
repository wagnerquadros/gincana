// src/pages/prof/MeuPerfil.jsx
import { useEffect, useMemo, useState } from "react";
import { useAutenticacao } from "../../auth/useAutenticacao";
import {
    obterUsuario,
    atualizarUsuario,
    atualizarSenhaUsuario,
    atualizarFotoUsuario,
    absolutizarUrlTalvez,
} from "../../api/usuarios";
import "../../styles/Perfil.css";

export default function MeuPerfil() {
    const { usuario } = useAutenticacao();
    const usuarioId = usuario?.id ?? null;

    const [carregando, setCarregando] = useState(true);
    const [salvandoDados, setSalvandoDados] = useState(false);
    const [trocandoSenha, setTrocandoSenha] = useState(false);
    const [trocandoFoto, setTrocandoFoto] = useState(false);

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const [perfil, setPerfil] = useState({
        id: "",
        nome: "",
        email: "",
        foto: null,
        role: "",
        ativo: true,
        criadoEm: null,
    });

    const [senhaForm, setSenhaForm] = useState({
        senhaAtual: "",
        novaSenha: "",
        confirmarNovaSenha: "",
    });

    const [arquivoFoto, setArquivoFoto] = useState(null);
    const previewFoto = useMemo(() => {
        if (arquivoFoto) return URL.createObjectURL(arquivoFoto);
        if (perfil?.foto) return perfil.foto;
        return null;
    }, [arquivoFoto, perfil?.foto]);

    useEffect(() => {
        async function carregar() {
            try {
                setErro("");
                setSucesso("");
                setCarregando(true);

                if (!usuarioId) {
                    setErro("Não foi possível identificar o usuário logado.");
                    setCarregando(false);
                    return;
                }

                const dados = await obterUsuario(usuarioId);
                setPerfil({
                    id: dados.id,
                    nome: dados.nome ?? "",
                    email: dados.email ?? "",
                    foto: absolutizarUrlTalvez(dados.foto ?? null),
                    role: (dados.role ?? "").toUpperCase(),
                    ativo: Boolean(dados.ativo),
                    criadoEm: dados.criadoEm ?? null,
                });
            } catch (e) {
                console.error(e);
                setErro("Falha ao carregar perfil. Tente novamente.");
            } finally {
                setCarregando(false);
            }
        }
        carregar();
    }, [usuarioId]);

    async function salvarDadosBasicos(e) {
        e.preventDefault();
        try {
            setErro("");
            setSucesso("");
            setSalvandoDados(true);

            await atualizarUsuario(perfil.id, {
                nome: perfil.nome,
                email: perfil.email,
            });

            setSucesso("Dados atualizados com sucesso!");
        } catch (e) {
            console.error(e);
            setErro("Não foi possível salvar os dados.");
        } finally {
            setSalvandoDados(false);
        }
    }

    async function salvarFoto(e) {
        e.preventDefault();
        if (!arquivoFoto) {
            setErro("Selecione um arquivo de imagem primeiro.");
            return;
        }
        try {
            setErro("");
            setSucesso("");
            setTrocandoFoto(true);

            const r = await atualizarFotoUsuario(perfil.id, arquivoFoto);
            const novaFoto = r?.usuario?.foto || r?.urlAbsoluta || perfil.foto;

            setPerfil((p) => ({ ...p, foto: novaFoto }));
            setArquivoFoto(null);
            setSucesso("Foto atualizada com sucesso!");
        } catch (e) {
            console.error(e);
            setErro("Falha ao enviar a foto.");
        } finally {
            setTrocandoFoto(false);
        }
    }

    async function salvarSenha(e) {
        e.preventDefault();

        if (senhaForm.novaSenha !== senhaForm.confirmarNovaSenha) {
            setErro("A confirmação da nova senha não confere.");
            return;
        }

        try {
            setErro("");
            setSucesso("");
            setTrocandoSenha(true);

            await atualizarSenhaUsuario(perfil.id, {
                senhaAtual: senhaForm.senhaAtual,
                novaSenha: senhaForm.novaSenha,
                confirmarNovaSenha: senhaForm.confirmarNovaSenha,
            });

            setSenhaForm({ senhaAtual: "", novaSenha: "", confirmarNovaSenha: "" });
            setSucesso("Senha alterada com sucesso!");
        } catch (e) {
            console.error(e);

            const msgBackend =
                e?.response?.data?.error ||
                e?.response?.data?.message ||
                e?.response?.data?.mensagem;

            // mensagem personalizada
            if (msgBackend === "Senha atual incorreta") {
                setErro("A senha atual informada está incorreta.");
            } else {
                setErro(msgBackend || "Não foi possível alterar a senha.");
            }
        } finally {
            setTrocandoSenha(false);
        }
    }

    if (carregando) {
        return (
            <div className="perfil-container">
                <div className="perfil-card">Carregando seu perfil...</div>
            </div>
        );
    }

    return (
        <div className="perfil-container">
            <header className="perfil-header">
                <h1 className="perfil-titulo">Meu Perfil</h1>
                <p className="perfil-subtitulo">Gerencie suas informações pessoais</p>
            </header>

            {(erro || sucesso) && (
                <div className="perfil-mensagens">
                    {erro && <div className="msg-erro">{erro}</div>}
                    {sucesso && <div className="msg-sucesso">{sucesso}</div>}
                </div>
            )}

            <div className="perfil-grid">
                {/* Foto */}
                <section className="perfil-card">
                    <h2 className="perfil-card-titulo">Foto</h2>
                    <div className="perfil-foto-bloco">
                        <div className="perfil-foto-preview">
                            {previewFoto ? (
                                <img src={previewFoto} alt="Foto do usuário" />
                            ) : (
                                <div className="perfil-foto-vazio">Sem foto</div>
                            )}
                        </div>

                        <form onSubmit={salvarFoto} className="perfil-foto-form">
                            <label className="perfil-label">Selecionar imagem</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setArquivoFoto(e.target.files?.[0] || null)}
                            />
                            <button type="submit" className="btn-primario" disabled={trocandoFoto}>
                                {trocandoFoto ? "Enviando..." : "Salvar foto"}
                            </button>
                        </form>
                    </div>
                </section>

                {/* Dados básicos */}
                <section className="perfil-card">
                    <h2 className="perfil-card-titulo">Dados básicos</h2>
                    <form onSubmit={salvarDadosBasicos} className="perfil-form">
                        <div className="campo">
                            <label className="perfil-label">Nome</label>
                            <input
                                type="text"
                                value={perfil.nome}
                                onChange={(e) => setPerfil((p) => ({ ...p, nome: e.target.value }))}
                                placeholder="Seu nome"
                            />
                        </div>
                        <div className="campo">
                            <label className="perfil-label">Email</label>
                            <input
                                type="email"
                                value={perfil.email}
                                onChange={(e) => setPerfil((p) => ({ ...p, email: e.target.value }))}
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div className="perfil-form-acoes">
                            <button type="submit" className="btn-primario" disabled={salvandoDados}>
                                {salvandoDados ? "Salvando..." : "Salvar alterações"}
                            </button>
                        </div>
                    </form>
                </section>

                {/* Alterar senha */}
                <section className="perfil-card">
                    <h2 className="perfil-card-titulo">Alterar senha</h2>
                    <form onSubmit={salvarSenha} className="perfil-form">
                        <div className="campo">
                            <label className="perfil-label">Senha atual</label>
                            <input
                                type="password"
                                value={senhaForm.senhaAtual}
                                onChange={(e) => setSenhaForm((s) => ({ ...s, senhaAtual: e.target.value }))}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="campo">
                            <label className="perfil-label">Nova senha</label>
                            <input
                                type="password"
                                value={senhaForm.novaSenha}
                                onChange={(e) => setSenhaForm((s) => ({ ...s, novaSenha: e.target.value }))}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="campo">
                            <label className="perfil-label">Confirmar nova senha</label>
                            <input
                                type="password"
                                value={senhaForm.confirmarNovaSenha}
                                onChange={(e) =>
                                    setSenhaForm((s) => ({ ...s, confirmarNovaSenha: e.target.value }))
                                }
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="perfil-form-acoes">
                            <button type="submit" className="btn-secundario" disabled={trocandoSenha}>
                                {trocandoSenha ? "Alterando..." : "Alterar senha"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}
