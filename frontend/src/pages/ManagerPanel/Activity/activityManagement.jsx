import React, { useState } from 'react'
import { Eye, Edit, Trash2, Plus, X } from 'lucide-react'
import './stylesActivityManagement.css'
import HeaderMenagerPainel from '../../../components/HeaderMenagerPainel/headerMenagerPainel'

export default function ActivityManagement() {
  const [showModal, setShowModal] = useState(false)

  const atividades = [
    {
      titulo: 'Quiz de História',
      tipo: 'Individual',
      pontos: 100,
      prazo: '2024-03-15',
      status: 'Ativa',
    },
    {
      titulo: 'Dança Folclórica',
      tipo: 'Coletiva',
      pontos: 200,
      prazo: '2024-03-20',
      status: 'Pendente',
    },
    {
      titulo: 'Arrecadação de Alimentos',
      tipo: 'Coletiva',
      pontos: 150,
      prazo: '2024-03-10',
      status: 'Finalizada',
    },
    {
      titulo: 'Poesia Declamada',
      tipo: 'Individual',
      pontos: 80,
      prazo: '2024-03-18',
      status: 'Ativa',
    },
  ]

  return (
    <div className='painel-container'>
      <HeaderMenagerPainel />

      <main className='painel-main'>
        <div className='painel-topo'>
          <h2>Gerenciar Atividades</h2>
          <button className='btn-nova' onClick={() => setShowModal(true)}>
            <Plus size={16} /> Nova Atividade
          </button>
        </div>

        <div className='lista-atividades'>
          {atividades.map((a, i) => (
            <div className='atividade-card' key={i}>
              <div>
                <h3>{a.titulo}</h3>
                <p>
                  {a.tipo} • {a.pontos} pontos • Prazo: {a.prazo}
                </p>
              </div>

              <div className='atividade-actions'>
                <span className={`status status-${a.status.toLowerCase()}`}>{a.status}</span>
                <button>
                  <Eye size={16} />
                </button>
                <button>
                  <Edit size={16} />
                </button>
                <button>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showModal && <ModalNovaAtividade onClose={() => setShowModal(false)} />}
    </div>
  )
}

function ModalNovaAtividade({ onClose }) {
  return (
    <div className='modal-overlay'>
      <div className='modal-container'>
        <div className='modal-header'>
          <h2>Criar Nova Atividade</h2>
          <button className='modal-close' onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <p className='modal-subtitle'>Preencha os dados da nova atividade da gincana</p>

        <form className='modal-form'>
          <label>Nome da Atividade</label>
          <input type='text' placeholder='Ex: Quiz de Matemática' />

          <label>Tipo</label>
          <select>
            <option value=''>Selecione o tipo</option>
            <option value='Individual'>Individual</option>
            <option value='Coletiva'>Coletiva</option>
          </select>

          <label>Pontuação</label>
          <input type='number' placeholder='100' />

          <label>Prazo</label>
          <input type='date' />

          <label>Descrição</label>
          <textarea placeholder='Descreva a atividade...'></textarea>

          <div className='modal-actions'>
            <button type='submit' className='btn-criar'>
              Criar Atividade
            </button>
            <button type='button' className='btn-cancelar' onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
