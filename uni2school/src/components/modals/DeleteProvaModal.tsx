import { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import type { Prova } from '../../types/user';

interface DeleteProvaModalProps {
  isOpen: boolean;
  onClose: () => void;
  prova: Prova;
}

export default function DeleteProvaModal({ isOpen, onClose, prova }: DeleteProvaModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { deleteProva } = useGame();

  const handleDelete = async () => {
    try {
      setError('');
      setLoading(true);
      
      await deleteProva(prova.id);
      onClose();
    } catch (err: any) {
      setError('Erro ao excluir prova. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Excluir Prova
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 mb-2">
                  Atenção! Esta ação não pode ser desfeita.
                </h3>
                <p className="text-red-700 text-sm">
                  Você está prestes a excluir permanentemente a prova <strong>"{prova.title}"</strong>.
                  Todas as submissões e avaliações relacionadas também serão perdidas.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-800 mb-2">Detalhes da Prova</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div><span className="font-medium">Título:</span> {prova.title}</div>
              <div><span className="font-medium">Pontuação:</span> {prova.maxPoints} pontos</div>
              <div><span className="font-medium">Submissões:</span> {prova.submissions.length}</div>
              <div><span className="font-medium">Status:</span> {prova.isActive ? 'Ativa' : 'Inativa'}</div>
              <div><span className="font-medium">Criada em:</span> {prova.createdAt.toLocaleDateString('pt-BR')}</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Excluindo...' : 'Sim, Excluir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
