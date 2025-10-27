import { Outlet } from "react-router-dom";
import NavbarProfessor from "../components/NavbarProfessor";

export default function ProfessorLayout() {
  return (
    <>
      <NavbarProfessor />
      <div style={{ padding: "16px" }}>
        <Outlet />
      </div>
    </>
  );
}
