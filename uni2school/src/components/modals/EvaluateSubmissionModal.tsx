import { useState } from 'react';
import { X, Star, MessageSquare, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { ProvaSubmission } from '../../types/user';

interface EvaluateSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: ProvaSubmission | null;
  provaTitle: string;
}

export default function EvaluateSubmissionModal({ 
  isOpen, 
  onClose, 
  submission, 
  provaTitle 
}: EvaluateSubmissionModalProps) {
  const { evaluateSubmission } = useGame();
  const [points, setPoints] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isGradeVisible, setIsGradeVisible] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission || points < 0 || points > submission.maxPoints) return;

    setIsEvaluating(true);
    try {
      // Extrair provaId do submissionId (formato: studentId_provaId)
      const provaId = submission.id.split('_')[1];
      await evaluateSubmission(provaId, submission.id, points, feedback.trim(), isGradeVisible);
      
      // Reset form
      setPoints(0);
      setFeedback('');
      setIsGradeVisible(false);
      onClose();
    } catch (error) {
      console.error('Erro ao avaliar prova:', error);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!isOpen || !submission) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Star className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Avaliar Prova
              </h2>
              <p className="text-sm text-gray-600">{provaTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={isEvaluating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações do aluno */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Informações do Aluno:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nome:</p>
                <p className="font-medium text-gray-800">{submission.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Equipe:</p>
                <p className="font-medium text-gray-800">{submission.teamName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data de entrega:</p>
                <p className="font-medium text-gray-800">
                  {submission.submittedAt.toLocaleDateString()} às {submission.submittedAt.toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pontuação máxima:</p>
                <p className="font-medium text-gray-800">{submission.maxPoints} pontos</p>
              </div>
            </div>
          </div>

          {/* Conteúdo da prova */}
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Resposta do Aluno:</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
            </div>
          </div>

          {/* Formulário de avaliação */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium text-gray-800 mb-2">
                <Star className="w-4 h-4 inline mr-2" />
                Nota (0 - {submission.maxPoints} pontos)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(Math.max(0, Math.min(submission.maxPoints, parseInt(e.target.value) || 0)))}
                  className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  min="0"
                  max={submission.maxPoints}
                  required
                />
                <span className="text-gray-600">de {submission.maxPoints} pontos</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(points / submission.maxPoints) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-800 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Feedback e Justificativa
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
                rows={4}
                placeholder="Explique o motivo da avaliação, pontos positivos e áreas de melhoria..."
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGradeVisible}
                  onChange={(e) => setIsGradeVisible(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div className="flex items-center gap-2">
                  {isGradeVisible ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="font-medium text-gray-800">
                    Tornar nota visível para o aluno
                  </span>
                </div>
              </label>
              <p className="text-sm text-gray-600 mt-1 ml-7">
                {isGradeVisible 
                  ? 'O aluno poderá ver sua nota e feedback imediatamente.'
                  : 'A nota ficará oculta até que você decida torná-la visível.'
                }
              </p>
            </div>

            {/* Preview da avaliação */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Preview da Avaliação
              </h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Nota:</span> {points}/{submission.maxPoints} pontos</p>
                <p><span className="font-medium">Visibilidade:</span> {isGradeVisible ? 'Visível para o aluno' : 'Oculta do aluno'}</p>
                {feedback && (
                  <div>
                    <p className="font-medium">Feedback:</p>
                    <p className="text-gray-700 bg-white p-2 rounded border">{feedback}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isEvaluating}
                className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isEvaluating || !feedback.trim()}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Avaliando...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4" />
                    Avaliar Prova
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
