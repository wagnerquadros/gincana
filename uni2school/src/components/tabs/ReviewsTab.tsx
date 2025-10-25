import { AlertTriangle, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ReviewList from '../ReviewList';
import CreateReviewModal from '../modals/CreateReviewModal';

export default function ReviewsTab() {
  const { userProfile } = useAuth();
  const [showCreateReviewModal, setShowCreateReviewModal] = useState(false);

  return (
    <div className="p-4 space-y-6 tab-content-padding">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Solicitações de Revisão
              </h2>
              <p className="text-gray-600">
                Conteste pontuações ou reporte irregularidades
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCreateReviewModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          Nova Solicitação
        </button>
      </div>

      {/* Lista de Solicitações */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Minhas Solicitações
          </h3>
          <ReviewList 
            showControls={false} 
            filterByTeam={userProfile?.teamId}
          />
        </div>
      </div>

      {/* Modal de Criação */}
      <CreateReviewModal
        isOpen={showCreateReviewModal}
        onClose={() => setShowCreateReviewModal(false)}
      />
    </div>
  );
}
