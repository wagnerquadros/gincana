import { useEffect, useState } from "react";
import { criarUsuario } from "../api/usuarios";
import "../styles/ModalAtividade.css";

export default function ModalCriarUsuario({ aberta, onClose, onUsuarioCriado }) {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [role, setRole] = useState("PROFESSOR");
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        if (!aberta) return;
        setNome("");
        setEmail("");
        setSenha("");
        setRole("PROFESSOR");
        setErro("");
        setSalvando(false);
    }, [aberta]);

    if (!aberta) return null;

    function validar() {
        if (!nome.trim()) return "Informe o nome";
        if (!email.trim()) return "Informe o e-mail";
        if (!senha.trim()) return "Informe a senha";
        const r = role.toUpperCase();
        if (r !== "PROFESSOR" && r !== "ALUNO") return "Role inválida";
        return "";
    }

    async function salvar() {
        const v = validar();
        if (v) {
            setErro(v);
            return;
        }
        try {
            setErro("");
            setSalvando(true);
            const novo = await criarUsuario({ nome, email, senha, role });
            setSalvando(false);
            if (onUsuarioCriado) onUsuarioCriado(novo);
            onClose();
        } catch (e) {
            console.log(e);
            setSalvando(false);
            setErro("Falha ao cadastrar usuário");
        }
    }

    return (
        <div className="modal-bg" role="dialog" aria-modal="true" aria-label="Cadastrar usuário">
            <div className="modal-card">
                <div className="modal-head">
                    <h3 style={{ margin: 0, fontWeight: 700 }}>Cadastrar usuário</h3>
                    <button className="btn btn-secondary" onClick={onClose} aria-label="Fechar">✖</button>
                </div>
                {erro && (
                    <div className="alert-erro" role="alert">{erro}</div>
                )}
                <div style={{ display: "grid", gap: 10 }}>
                    <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontWeight: 600, color: "#374151" }}>Nome</span>
                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontWeight: 600, color: "#374151" }}>E-mail</span>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontWeight: 600, color: "#374151" }}>Senha</span>
                        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha" />
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontWeight: 600, color: "#374151" }}>Perfil</span>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="PROFESSOR">PROFESSOR</option>
                            <option value="ALUNO">ALUNO</option>
                        </select>
                    </label>
                </div>
                <div className="btn-row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                    <button className="btn btn-secondary" onClick={onClose} disabled={salvando}>Cancelar</button>
                    <button className="btn btn-primary" onClick={salvar} disabled={salvando}>Salvar</button>
                </div>
            </div>
        </div>
    );
}