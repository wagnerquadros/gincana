import { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, Eye, EyeOff, Calendar, User, Users, FileText, Image, Video, Link, Trash2, Edit, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import type { ReviewRequest, ReviewStatus } from '../types/user';

interface ReviewListProps {
  showControls?: boolean;
  filterByTeam?: string;
}

export default function ReviewList({ showControls = false, filterByTeam }: ReviewListProps) {
  const { userProfile } = useAuth();
  const { reviewRequests, updateReviewStatus, deleteReviewRequest } = useGame();
  const [selectedReview, setSelectedReview] = useState<ReviewRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');

  // Filtrar solicitações
  const filteredReviews = reviewRequests.filter(review => {
    if (filterByTeam && review.teamId !== filterByTeam) return false;
    if (statusFilter !== 'all' && review.status !== statusFilter) return false;
    return true;
  });

  const getStatusIcon = (status: ReviewStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'under_review':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusText = (status: ReviewStatus) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'under_review':
        return 'Em Análise';
      case 'resolved':
        return 'Resolvida';
      case 'rejected':
        return 'Rejeitada';
    }
  };

  const getStatusColor = (status: ReviewStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return priority;
    }
  };

  const handleStatusChange = async (reviewId: string, newStatus: ReviewStatus) => {
    try {
      await updateReviewStatus(reviewId, newStatus, userProfile?.uid || '');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta solicitação de revisão?')) {
      try {
        await deleteReviewRequest(reviewId);
      } catch (error) {
        console.error('Erro ao excluir solicitação:', error);
      }
    }
  };

  const handleViewDetails = (review: ReviewRequest) => {
    setSelectedReview(review);
    setShowDetails(true);
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4 text-green-600" />;
      case 'video':
        return <Video className="w-4 h-4 text-red-600" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'link':
        return <Link className="w-4 h-4 text-purple-600" />;
      default:
        return <Link className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendente</option>
            <option value="under_review">Em Análise</option>
            <option value="resolved">Resolvida</option>
            <option value="rejected">Rejeitada</option>
          </select>
        </div>
      </div>

      {/* Lista de solicitações */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Nenhuma solicitação encontrada
          </h3>
          <p>Não há solicitações de revisão que correspondam aos filtros selecionados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {review.title}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                        {getStatusIcon(review.status)}
                        <span className="ml-1">{getStatusText(review.status)}</span>
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(review.priority)}`}>
                        {getPriorityText(review.priority)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {review.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{review.createdByName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{review.teamName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{review.createdAt.toLocaleDateString('pt-BR')}</span>
                      </div>
                      {review.evidence.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span>{review.evidence.length} evidência(s)</span>
                        </div>
                      )}
                    </div>

                    {/* Contexto adicional */}
                    {(review.targetTeamName || review.targetProvaTitle) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-blue-800">
                          {review.targetTeamName && (
                            <span><strong>Equipe alvo:</strong> {review.targetTeamName}</span>
                          )}
                          {review.targetTeamName && review.targetProvaTitle && <span> • </span>}
                          {review.targetProvaTitle && (
                            <span><strong>Prova:</strong> {review.targetProvaTitle}</span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Evidências */}
                    {review.evidence.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {review.evidence.map((evidence) => (
                          <div key={evidence.id} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                            {getEvidenceIcon(evidence.type)}
                            <span className="truncate max-w-32">{evidence.url}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(review)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Ver detalhes"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    {showControls && (
                      <>
                        {review.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(review.id, 'under_review')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Marcar como em análise"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                        
                        {(review.status === 'pending' || review.status === 'under_review') && (
                          <>
                            <button
                              onClick={() => handleStatusChange(review.id, 'resolved')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Marcar como resolvida"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(review.id, 'rejected')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Rejeitar solicitação"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Excluir solicitação"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalhes */}
      {showDetails && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedReview.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReview.status)}`}>
                      {getStatusIcon(selectedReview.status)}
                      <span className="ml-1">{getStatusText(selectedReview.status)}</span>
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedReview.priority)}`}>
                      {getPriorityText(selectedReview.priority)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Solicitante</h3>
                  <p className="text-gray-600">{selectedReview.createdByName}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Equipe</h3>
                  <p className="text-gray-600">{selectedReview.teamName}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Data de Criação</h3>
                  <p className="text-gray-600">{selectedReview.createdAt.toLocaleString('pt-BR')}</p>
                </div>
                {selectedReview.reviewedAt && (
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Data de Revisão</h3>
                    <p className="text-gray-600">{selectedReview.reviewedAt.toLocaleString('pt-BR')}</p>
                  </div>
                )}
              </div>

              {/* Descrição */}
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Descrição</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedReview.description}</p>
              </div>

              {/* Contexto */}
              {(selectedReview.targetTeamName || selectedReview.targetProvaTitle) && (
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Contexto</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    {selectedReview.targetTeamName && (
                      <p className="text-blue-800 mb-1">
                        <strong>Equipe alvo:</strong> {selectedReview.targetTeamName}
                      </p>
                    )}
                    {selectedReview.targetProvaTitle && (
                      <p className="text-blue-800">
                        <strong>Prova relacionada:</strong> {selectedReview.targetProvaTitle}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Evidências */}
              {selectedReview.evidence.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Evidências</h3>
                  <div className="space-y-3">
                    {selectedReview.evidence.map((evidence) => (
                      <div key={evidence.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getEvidenceIcon(evidence.type)}
                          <span className="font-medium text-gray-800 capitalize">{evidence.type}</span>
                        </div>
                        <a
                          href={evidence.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 break-all"
                        >
                          {evidence.url}
                        </a>
                        {evidence.description && (
                          <p className="text-gray-600 mt-2">{evidence.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolução */}
              {selectedReview.resolution && (
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Resolução</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600 whitespace-pre-wrap">{selectedReview.resolution}</p>
                    {selectedReview.reviewedByName && (
                      <p className="text-sm text-gray-500 mt-2">
                        Resolvido por: {selectedReview.reviewedByName}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
