import { useState } from 'react';
import { Star, Clock, CheckCircle, Eye, EyeOff, User, Users } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { ProvaSubmission } from '../../types/user';
import EvaluateSubmissionModal from './modals/EvaluateSubmissionModal';

interface SubmissionListProps {
  submissions: ProvaSubmission[];
  provaTitle: string;
}

export default function SubmissionList({ submissions, provaTitle }: SubmissionListProps) {
  const [evaluatingSubmission, setEvaluatingSubmission] = useState<ProvaSubmission | null>(null);

  const evaluatedSubmissions = submissions.filter(sub => sub.points !== undefined);
  const pendingSubmissions = submissions.filter(sub => sub.points === undefined);

  const getStatusIcon = (submission: ProvaSubmission) => {
    if (submission.points === undefined) {
      return <Clock className="w-4 h-4 text-yellow-600" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  const getStatusText = (submission: ProvaSubmission) => {
    if (submission.points === undefined) {
      return 'Pendente';
    }
    return submission.isGradeVisible ? 'Avaliada (Visível)' : 'Avaliada (Oculta)';
  };

  const getStatusColor = (submission: ProvaSubmission) => {
    if (submission.points === undefined) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    return submission.isGradeVisible 
      ? 'text-green-600 bg-green-50 border-green-200'
      : 'text-blue-600 bg-blue-50 border-blue-200';
  };

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Nenhuma submissão
        </h3>
        <p>Ainda não há submissões para esta prova.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Submissões</p>
                <p className="text-2xl font-bold text-gray-800">{submissions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avaliadas</p>
                <p className="text-2xl font-bold text-gray-800">{evaluatedSubmissions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-800">{pendingSubmissions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de submissões */}
        <div className="space-y-3">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {submission.studentName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {submission.teamName}
                      </span>
                      <span>
                        {submission.submittedAt.toLocaleDateString()} às {submission.submittedAt.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission)}`}>
                      {getStatusIcon(submission)}
                      {getStatusText(submission)}
                    </div>
                    {submission.points !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-4 h-4" />
                          {submission.points}/{submission.maxPoints} pontos
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          {submission.isGradeVisible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                          {submission.isGradeVisible ? 'Visível' : 'Oculta'}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEvaluatingSubmission(submission)}
                      className={`px-4 py-2 rounded-lg transition font-medium ${
                        submission.points === undefined
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {submission.points === undefined ? 'Avaliar' : 'Reavaliar'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview da resposta */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Resposta:</h4>
                <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {submission.content.length > 200 
                      ? `${submission.content.substring(0, 200)}...` 
                      : submission.content
                    }
                  </p>
                </div>
              </div>

              {/* Feedback se disponível */}
              {submission.feedback && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Feedback:</h4>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {submission.feedback}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <EvaluateSubmissionModal
        isOpen={!!evaluatingSubmission}
        onClose={() => setEvaluatingSubmission(null)}
        submission={evaluatingSubmission}
        provaTitle={provaTitle}
      />
    </>
  );
}
