import { Link } from "react-router-dom";

export default function SetupAdmin() {
  return (
    <main style={{ maxWidth: 900, margin: "32px auto", padding: "0 16px" }}>
      <header style={{ marginBottom: 16 }}>
        <h1>Configuração Inicial do Evento</h1>
        <p>
          Não há gincana <strong>ATIVA</strong>. Comece criando uma gincana e
          cadastrando professores.
        </p>
      </header>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <Link
          to="/gincana" // neste momento só um placeholder; depois abrimos modal/fluxo de criação
          style={{
            display: "inline-block",
            padding: "14px 16px",
            textAlign: "center",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "#2563EB",
            color: "#fff",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Criar Evento (Gincana)
        </Link>

        <Link
          to="/professores" // placeholder; depois ligamos ao fluxo de cadastro
          style={{
            display: "inline-block",
            padding: "14px 16px",
            textAlign: "center",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "#fff",
            color: "#0f172a",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Cadastrar Professor
        </Link>
      </div>
    </main>
  );
}
