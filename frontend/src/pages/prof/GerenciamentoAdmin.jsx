// src/pages/prof/GerenciamentoAdmin.jsx
import { Link } from "react-router-dom";

export default function GerenciamentoAdmin() {
  return (
    <main style={{ maxWidth: 1000, margin: "24px auto", padding: "0 16px" }}>
      <h1>Gerenciamento (ADM)</h1>
      <p>Configure o sistema e gerencie recursos do evento.</p>

      {/* Linha 1: Configuração inicial em destaque */}
      <section style={{ marginTop: 16 }}>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr",
          }}
        >
          <Link to="/prof/setup" style={ctaPrimariaGrande}>
            Configuração inicial (primeiro acesso)
          </Link>
        </div>
      </section>

      {/* Linha 2: Outras ações administrativas (opcional) */}
      <section style={{ marginTop: 16 }}>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr 1fr 1fr",
          }}
        >
          <Link to="/prof/gincana" style={ctaSecundaria}>
            Criar/Editar Gincana
          </Link>
          <Link to="/prof/equipes" style={ctaSecundaria}>
            Gerenciar Equipes
          </Link>
          <Link to="/prof/atividades" style={ctaSecundaria}>
            Gerenciar Atividades
          </Link>
        </div>
      </section>
    </main>
  );
}

const ctaPrimariaGrande = {
  display: "inline-block",
  padding: "16px",
  textAlign: "center",
  borderRadius: 12,
  background: "#2563EB", // azul padrão
  color: "#fff",
  fontWeight: 800,
  textDecoration: "none",
  fontSize: 16,
};

const ctaSecundaria = {
  display: "inline-block",
  padding: 14,
  textAlign: "center",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
  color: "#0f172a",
  fontWeight: 700,
  textDecoration: "none",
};
