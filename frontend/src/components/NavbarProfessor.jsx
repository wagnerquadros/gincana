import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAutenticacao } from "../auth/useAutenticacao";
import "../styles/Navbar.css";

export default function NavbarProfessor() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { usuario, sair } = useAutenticacao(); // se seu hook usa "logout", troque por logout()

  // papel do usuário
  const role = (usuario?.role || "").toUpperCase();
  const isADM = role === "ADM";

  // helper para className do NavLink (garante aplicar "active")
  const linkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";
  const linkClassAdmin = ({ isActive }) =>
    isActive ? "nav-link nav-link-admin active" : "nav-link nav-link-admin";

  return (
    <header className="nav-wrap">
      <div className="nav-inner">
        {/* ESQUERDA — brand */}
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

        {/* CENTRO — abas */}
        <nav className="nav-center">
          {/* SOMENTE ADM: "Gerenciamento" na frente */}
          {isADM && (
            <NavLink to="/prof/gerenciamento" className={linkClassAdmin}>
              <span>Gerenciamento</span>
            </NavLink>
          )}

          <NavLink to="/prof/dashboard" className={linkClass}>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/prof/gincana" className={linkClass}>
            <span>Gincana</span>
          </NavLink>
          <NavLink to="/prof/equipes" className={linkClass}>
            <span>Equipes</span>
          </NavLink>
          <NavLink to="/prof/atividades" className={linkClass}>
            <span>Atividades</span>
          </NavLink>
          <NavLink to="/prof/ranking" className={linkClass}>
            <span>Ranking</span>
          </NavLink>
        </nav>

        {/* DIREITA — role + sair + burger (mobile) */}
        <div className="user-side">
          <div className="role-badge" title="Papel do usuário">
            <span className="role-dot" />
            <span className="role-text">
              {role === "ADM" ? "Administrador" : "Professor"}
            </span>
          </div>

          <button className="btn-sair" onClick={() => sair?.()}>
            Sair
          </button>

          {/* burger só aparece no mobile */}
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
        {/* SOMENTE ADM: "Gerenciamento" aparece primeiro */}
        {isADM && (
          <NavLink
            to="/prof/gerenciamento"
            className={linkClassAdmin}
            onClick={() => setMenuAberto(false)}
          >
            Gerenciamento
          </NavLink>
        )}

        <NavLink
          to="/prof/dashboard"
          className={linkClass}
          onClick={() => setMenuAberto(false)}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/prof/gincana"
          className={linkClass}
          onClick={() => setMenuAberto(false)}
        >
          Gincana
        </NavLink>
        <NavLink
          to="/prof/equipes"
          className={linkClass}
          onClick={() => setMenuAberto(false)}
        >
          Equipes
        </NavLink>
        <NavLink
          to="/prof/atividades"
          className={linkClass}
          onClick={() => setMenuAberto(false)}
        >
          Atividades
        </NavLink>
        <NavLink
          to="/prof/ranking"
          className={linkClass}
          onClick={() => setMenuAberto(false)}
        >
          Ranking
        </NavLink>

        {/* Dica: se quiser o botão SAIR funcional no menu mobile, descomente abaixo
        <button
          style={{ marginTop: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid var(--nav-line)", background: "#f8fafc", fontWeight: 800 }}
          onClick={() => { setMenuAberto(false); sair?.(); }}
        >
          Sair
        </button>
        */}
      </div>
    </header>
  );
}
