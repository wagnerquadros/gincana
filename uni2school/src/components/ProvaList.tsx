import { useState } from 'react';
import { FileText, Trophy, Calendar, Send, CheckCircle } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { Prova } from '../types/user';

interface ProvaCardProps {
  prova: Prova;
  onSubmit: (provaId: string, content: string) => void;
}

function ProvaCard({ prova, onSubmit }: ProvaCardProps) {
  const { userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [showSubmission, setShowSubmission] = useState(false);

  const submission = prova.submissions.find(sub => sub.studentId === userProfile?.uid);
  const hasSubmitted = !!submission;

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(prova.id, content.trim());
      setContent('');
      setShowSubmission(false);
    } catch (error) {
      console.error('Erro ao submeter prova:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {prova.title}
          </h3>
          <p className="text-gray-600 mb-3">{prova.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              {prova.maxPoints} pontos
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {prova.createdAt.toLocaleDateString()}
            </div>
          </div>
        </div>
        {hasSubmitted && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Entregue</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-gray-800 mb-2">Instruções:</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 whitespace-pre-wrap">{prova.instructions}</p>
        </div>
      </div>

      {!hasSubmitted ? (
        <div>
          {!showSubmission ? (
            <button
              onClick={() => setShowSubmission(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Send className="w-4 h-4" />
              Entregar Prova
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sua Resposta:
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                  rows={6}
                  placeholder="Digite sua resposta aqui..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmission(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Resposta
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {submission.points !== undefined && submission.isGradeVisible ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800 mb-3">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Prova Avaliada!</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    Nota: {submission.points}/{submission.maxPoints} pontos
                  </span>
                </div>
                
                {submission.feedback && (
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">Feedback do Professor:</h4>
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">
                        {submission.feedback}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-blue-600">
                  Avaliada em {submission.evaluatedAt instanceof Date 
                    ? submission.evaluatedAt.toLocaleDateString() 
                    : submission.evaluatedAt ? new Date(submission.evaluatedAt).toLocaleDateString() : 'Data não disponível'
                  } às {submission.evaluatedAt instanceof Date 
                    ? submission.evaluatedAt.toLocaleTimeString() 
                    : submission.evaluatedAt ? new Date(submission.evaluatedAt).toLocaleTimeString() : 'Hora não disponível'
                  }
                </div>
              </div>
            </div>
          ) : submission.points !== undefined && !submission.isGradeVisible ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Prova avaliada</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Sua prova foi avaliada, mas a nota ainda não foi liberada pelo professor.
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Prova entregue com sucesso!</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Aguarde a avaliação do professor.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProvaList() {
  const { provas, submitProva, loading } = useGame();

  const activeProvas = provas.filter(prova => prova.isActive);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando provas...</p>
      </div>
    );
  }

  if (activeProvas.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Nenhuma prova disponível
          </h3>
          <p>Aguarde o professor criar novas provas para sua equipe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Provas da Gincana
        </h2>
        <p className="text-gray-600 mb-6">
          Complete as provas para ganhar pontos para sua equipe!
        </p>
      </div>

      <div className="space-y-4">
        {activeProvas.map((prova) => (
          <ProvaCard
            key={prova.id}
            prova={prova}
            onSubmit={submitProva}
          />
        ))}
      </div>
    </div>
  );
}
