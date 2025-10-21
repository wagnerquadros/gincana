import { useState } from 'react';
import Login from './Login';
import Register from './Register';

export default function AuthGate() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="relative">
      {showLogin ? <Login /> : <Register />}

      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setShowLogin(!showLogin)}
          className="bg-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition text-sm font-medium text-gray-700"
        >
          {showLogin ? (
            <span>
              Não tem conta? <span className="text-green-600 font-semibold">Criar conta</span>
            </span>
          ) : (
            <span>
              Já tem conta? <span className="text-blue-600 font-semibold">Fazer login</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
