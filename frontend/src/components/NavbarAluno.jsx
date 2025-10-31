import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAutenticacao } from "../auth/useAutenticacao";
import { LogOut } from "lucide-react";
import "../styles/Navbar.css";

export default function NavbarAluno() {
    const [menuAberto, setMenuAberto] = useState(false);
    const { sair } = useAutenticacao();

    const linkClass = ({ isActive }) =>
        isActive ? "nav-link active" : "nav-link";

    return (
        <header className="nav-wrap">
            <div className="nav-inner">
                {/* ESQUERDA — logo */}
                <div className="brand">
                    <div className="brand-ico" aria-hidden="true">
                        <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M8 21h8" />
                            <path d="M12 17v4" />
                            <path d="M7 4h10v3a5 5 0 0 1-10 0V4Z" />
                            <path d="M5 7a3 3 0 0 1-3-3h3" />
                            <path d="M19 7a3 3 0 0 0 3-3h-3" />
                        </svg>
                    </div>
                    <span className="brand-text">Gincana Escolar</span>
                </div>

                {/* CENTRO — abas do aluno */}
                <nav className="nav-center">
                    <NavLink to="/aluno/dashboard" className={linkClass}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/aluno/gincana" className={linkClass}>
                        Gincana
                    </NavLink>
                    <NavLink to="/aluno/minha-equipe" className={linkClass}>
                        Minha Equipe
                    </NavLink>
                    <NavLink to="/aluno/atividades" className={linkClass}>
                        Atividades
                    </NavLink>
                    <NavLink to="/aluno/perfil" className={linkClass}>
                        Meu Perfil
                    </NavLink>
                </nav>

                {/* DIREITA — sair + burger */}
                <div className="user-side">
                    <button
                        className="btn-sair"
                        onClick={() => sair?.()}
                        title="Sair do sistema"
                    >
                        <LogOut size={18} strokeWidth={2} />
                    </button>

                    <button
                        className="btn-burger"
                        aria-label="Abrir menu"
                        aria-expanded={menuAberto}
                        onClick={() => setMenuAberto((v) => !v)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
            </div>

            {/* MENU MOBILE */}
            <div className={`mobile-menu ${menuAberto ? "show" : ""}`}>
                <NavLink
                    to="/aluno/dashboard"
                    className={linkClass}
                    onClick={() => setMenuAberto(false)}
                >
                    Dashboard
                </NavLink>
                <NavLink
                    to="/aluno/gincana"
                    className={linkClass}
                    onClick={() => setMenuAberto(false)}
                >
                    Gincana
                </NavLink>
                <NavLink
                    to="/aluno/minha-equipe"
                    className={linkClass}
                    onClick={() => setMenuAberto(false)}
                >
                    Minha Equipe
                </NavLink>
                <NavLink
                    to="/aluno/atividades"
                    className={linkClass}
                    onClick={() => setMenuAberto(false)}
                >
                    Atividades
                </NavLink>
                <NavLink
                    to="/aluno/perfil"
                    className={linkClass}
                    onClick={() => setMenuAberto(false)}
                >
                    Meu Perfil
                </NavLink>

                <button className="btn-sair-mobile" onClick={() => sair?.()}>
                    <LogOut size={16} /> Sair
                </button>
            </div>
        </header>
    );
}
