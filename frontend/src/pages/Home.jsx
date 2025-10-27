import { useAutenticacao } from "../auth/useAutenticacao";

export default function Home() {
  const { usuario, sair } = useAutenticacao();

  return (
    <div>
      <h1>Bem-vindo, {usuario?.nome}</h1>
      <p>Seu e-mail: {usuario?.email}</p>
      <p>Role: {usuario?.role}</p>
      <button onClick={sair}>Sair</button>
    </div>
  );
}
