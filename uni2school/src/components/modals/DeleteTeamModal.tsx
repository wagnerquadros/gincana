import { X, AlertTriangle, Users } from 'lucide-react';

interface DeleteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  teamName: string;
  memberCount: number;
  isLoading?: boolean;
}

export default function DeleteTeamModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  teamName, 
  memberCount,
  isLoading = false 
}: DeleteTeamModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Excluir Equipe
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{teamName}</h3>
                <p className="text-sm text-gray-600">
                  {memberCount} {memberCount === 1 ? 'membro' : 'membros'}
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800 mb-2">
                    Atenção! Esta ação não pode ser desfeita.
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• A equipe será permanentemente excluída</li>
                    <li>• Todos os {memberCount} membros serão removidos da equipe</li>
                    <li>• Os alunos precisarão escolher uma nova equipe</li>
                    <li>• O histórico de pontos da equipe será perdido</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Excluindo...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Excluir Equipe
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
