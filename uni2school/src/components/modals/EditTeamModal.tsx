import { useState, useEffect } from 'react';
import { X, Users, Palette } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { Team } from '../../types/user';

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
}

const teamColors = [
  { name: 'Azul', value: '#3B82F6', bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Verde', value: '#10B981', bg: 'bg-green-100', text: 'text-green-600' },
  { name: 'Vermelho', value: '#EF4444', bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Amarelo', value: '#F59E0B', bg: 'bg-yellow-100', text: 'text-yellow-600' },
  { name: 'Roxo', value: '#8B5CF6', bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Rosa', value: '#EC4899', bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Laranja', value: '#F97316', bg: 'bg-orange-100', text: 'text-orange-600' },
  { name: 'Ciano', value: '#06B6D4', bg: 'bg-cyan-100', text: 'text-cyan-600' },
];

export default function EditTeamModal({ isOpen, onClose, team }: EditTeamModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(teamColors[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const { updateTeam } = useGame();

  useEffect(() => {
    if (team) {
      setName(team.name);
      setDescription(team.description || '');
      setSelectedColor(team.color);
    }
  }, [team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !team) return;

    setIsLoading(true);
    try {
      await updateTeam(team.id, name.trim(), description.trim(), selectedColor);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar equipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Editar Equipe</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Equipe *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="Ex: Equipe Alpha"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none"
              rows={3}
              placeholder="Descreva a equipe..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Palette className="w-4 h-4 inline mr-2" />
              Cor da Equipe
            </label>
            <div className="grid grid-cols-4 gap-3">
              {teamColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`p-3 rounded-lg border-2 transition ${
                    selectedColor === color.value
                      ? 'border-gray-400'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full mx-auto"
                    style={{ backgroundColor: color.value }}
                  />
                  <p className="text-xs text-gray-600 mt-1">{color.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
