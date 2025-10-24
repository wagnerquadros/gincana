import { useState } from 'react';
import { X, AlertTriangle, Link, Image, FileText, Video, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import type { ReviewRequest, EvidenceItem } from '../../types/user';

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTeamId?: string;
  targetTeamName?: string;
  targetProvaId?: string;
  targetProvaTitle?: string;
}

export default function CreateReviewModal({
  isOpen,
  onClose,
  targetTeamId,
  targetTeamName,
  targetProvaId,
  targetProvaTitle
}: CreateReviewModalProps) {
  const { userProfile } = useAuth();
  const { teams, createReviewRequest } = useGame();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [newEvidenceUrl, setNewEvidenceUrl] = useState('');
  const [newEvidenceDescription, setNewEvidenceDescription] = useState('');
  const [newEvidenceType, setNewEvidenceType] = useState<'image' | 'video' | 'document' | 'link'>('link');
  const [loading, setLoading] = useState(false);

  const userTeam = teams.find(team => team.members.includes(userProfile?.uid || ''));

  const handleAddEvidence = () => {
    if (!newEvidenceUrl.trim() || !newEvidenceDescription.trim()) return;

    const newEvidence: EvidenceItem = {
      id: Date.now().toString(),
      type: newEvidenceType,
      url: newEvidenceUrl.trim(),
      description: newEvidenceDescription.trim(),
      uploadedAt: new Date()
    };

    setEvidence(prev => [...prev, newEvidence]);
    setNewEvidenceUrl('');
    setNewEvidenceDescription('');
  };

  const handleRemoveEvidence = (evidenceId: string) => {
    setEvidence(prev => prev.filter(item => item.id !== evidenceId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !reason.trim() || !userTeam) {
      return;
    }

    setLoading(true);
    
    try {
      const reviewRequest: Omit<ReviewRequest, 'id'> = {
        title: title.trim(),
        description: description.trim(),
        reason: reason.trim(),
        evidence,
        status: 'pending',
        createdAt: new Date(),
        createdBy: userProfile?.uid || '',
        createdByName: userProfile?.displayName || 'Usuário',
        teamId: userTeam.id,
        teamName: userTeam.name,
        ...(targetTeamId && { targetTeamId }),
        ...(targetTeamName && { targetTeamName }),
        ...(targetProvaId && { targetProvaId }),
        ...(targetProvaTitle && { targetProvaTitle }),
        priority
      };

      await createReviewRequest(reviewRequest);
      
      // Reset form
      setTitle('');
      setDescription('');
      setReason('');
      setPriority('medium');
      setEvidence([]);
      setNewEvidenceUrl('');
      setNewEvidenceDescription('');
      
      onClose();
    } catch (error) {
      console.error('Erro ao criar solicitação de revisão:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Solicitar Revisão
              </h2>
              <p className="text-sm text-gray-600">
                Contestar desempenho ou reportar irregularidades
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
          {/* Informações do contexto */}
          {(targetTeamName || targetProvaTitle) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Contexto da Solicitação</h3>
              {targetTeamName && (
                <p className="text-sm text-blue-700">
                  <strong>Equipe alvo:</strong> {targetTeamName}
                </p>
              )}
              {targetProvaTitle && (
                <p className="text-sm text-blue-700">
                  <strong>Prova relacionada:</strong> {targetProvaTitle}
                </p>
              )}
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título da Solicitação *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Contestação de pontuação da prova X"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição Detalhada *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhadamente o que aconteceu e por que você está solicitando a revisão..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo da Solicitação *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Selecione o motivo</option>
              <option value="pontuacao_incorreta">Pontuação incorreta</option>
              <option value="irregularidade_equipe">Irregularidade de outra equipe</option>
              <option value="problema_tecnico">Problema técnico</option>
              <option value="criteria_avaliacao">Critérios de avaliação</option>
              <option value="outro">Outro motivo</option>
            </select>
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridade
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>

          {/* Evidências */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidências (Links, Imagens, Vídeos, Documentos)
            </label>
            
            {/* Adicionar nova evidência */}
            <div className="border border-gray-300 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <select
                  value={newEvidenceType}
                  onChange={(e) => setNewEvidenceType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="link">Link</option>
                  <option value="image">Imagem</option>
                  <option value="video">Vídeo</option>
                  <option value="document">Documento</option>
                </select>
                <input
                  type="url"
                  value={newEvidenceUrl}
                  onChange={(e) => setNewEvidenceUrl(e.target.value)}
                  placeholder="URL da evidência"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddEvidence}
                  disabled={!newEvidenceUrl.trim() || !newEvidenceDescription.trim()}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
              <input
                type="text"
                value={newEvidenceDescription}
                onChange={(e) => setNewEvidenceDescription(e.target.value)}
                placeholder="Descrição da evidência *"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Lista de evidências */}
            {evidence.length > 0 && (
              <div className="space-y-2">
                {evidence.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {item.type === 'image' && <Image className="w-5 h-5 text-green-600" />}
                      {item.type === 'video' && <Video className="w-5 h-5 text-red-600" />}
                      {item.type === 'document' && <FileText className="w-5 h-5 text-blue-600" />}
                      {item.type === 'link' && <Link className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {item.url}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-600 truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEvidence(item.id)}
                      className="flex-shrink-0 p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              disabled={loading || !title.trim() || !description.trim() || !reason.trim()}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar Solicitação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
