import { Outlet } from "react-router-dom";
import NavbarAluno from "../components/NavbarAluno";
import "../styles/global.css"; // garante as classes .content, .card etc.

export default function AlunoLayout() {
    return (
        <div className="app-shell">
            <NavbarAluno />
            <main className="content" style={{ display: "grid", gap: 16 }}>
                <Outlet />
            </main>
        </div>
    );
}

