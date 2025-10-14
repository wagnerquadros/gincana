
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded">
      <h2 className="text-xl mb-4">Login</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          <span>Email</span>
          <input className="w-full p-2 border" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label className="block mb-4">
          <span>Senha</span>
          <input type="password" className="w-full p-2 border" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white">Entrar</button>
      </form>
    </div>
  );
}
