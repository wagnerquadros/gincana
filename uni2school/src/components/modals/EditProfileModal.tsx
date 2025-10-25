import { useState, useEffect } from 'react';
import { X, User, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProfileModal({ isOpen, onClose, onSuccess }: EditProfileModalProps) {
  const { userProfile, refreshUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    age: '',
    year: '',
    class: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Carregar dados atuais do usuário
  useEffect(() => {
    if (userProfile && isOpen) {
      setFormData({
        displayName: userProfile.displayName || '',
        age: userProfile.age?.toString() || '',
        year: userProfile.year || '',
        class: userProfile.class || ''
      });
    }
  }, [userProfile, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) return;

    // Validações
    if (!formData.displayName.trim()) {
      setError('O nome é obrigatório');
      return;
    }

    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 100)) {
      setError('A idade deve ser um número entre 1 e 100');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userRef = doc(db, 'users', userProfile.uid);
      const updateData: any = {
        displayName: formData.displayName.trim()
      };

      // Adicionar campos opcionais apenas se preenchidos
      if (formData.age) {
        updateData.age = Number(formData.age);
      }
      if (formData.year) {
        updateData.year = formData.year.trim();
      }
      if (formData.class) {
        updateData.class = formData.class.trim();
      }

      await updateDoc(userRef, updateData);
      
      // Atualizar o perfil do usuário no contexto
      await refreshUserProfile();
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError('Erro ao salvar as informações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Editar Perfil
              </h2>
              <p className="text-sm text-gray-600">
                Atualize suas informações pessoais
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder="Digite seu nome completo"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Idade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idade
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="Digite sua idade"
              min="1"
              max="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Ano */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ano/Série
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione o ano/série</option>
              <option value="1º Ano">1º Ano</option>
              <option value="2º Ano">2º Ano</option>
              <option value="3º Ano">3º Ano</option>
              <option value="4º Ano">4º Ano</option>
              <option value="5º Ano">5º Ano</option>
              <option value="6º Ano">6º Ano</option>
              <option value="7º Ano">7º Ano</option>
              <option value="8º Ano">8º Ano</option>
              <option value="9º Ano">9º Ano</option>
              <option value="1º Ano EM">1º Ano EM</option>
              <option value="2º Ano EM">2º Ano EM</option>
              <option value="3º Ano EM">3º Ano EM</option>
            </select>
          </div>

          {/* Turma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Turma
            </label>
            <input
              type="text"
              name="class"
              value={formData.class}
              onChange={handleInputChange}
              placeholder="Ex: A, B, C ou 1A, 2B..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.displayName.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
