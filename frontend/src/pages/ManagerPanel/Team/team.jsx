import React from 'react';
import './stylesTeam.css';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import HeaderMenagerPainel from '../../../components/HeaderMenagerPainel/headerMenagerPainel';

function Team() {
  const equipes = [
    { nome: 'Águias Douradas', membros: 25, pontos: 850, cor: '#facc15' },
    { nome: 'Leões Vermelhos', membros: 23, pontos: 720, cor: '#ef4444' },
    { nome: 'Tigres Azuis', membros: 24, pontos: 680, cor: '#3b82f6' },
    { nome: 'Panteras Verdes', membros: 22, pontos: 590, cor: '#22c55e' },
  ];

  return (
    <div className='team-container'>
      <HeaderMenagerPainel />
      <div className='team-header'>
        <h1>Gerenciar Equipes</h1>
        <button className='new-team-btn'>
          <Plus size={16} /> Nova Equipe
        </button>
      </div>

      <div className='team-list'>
        {equipes.map((eq, index) => (
          <div className='team-card' key={index}>
            <div className='team-info'>
              <div className='team-icon' style={{ backgroundColor: eq.cor }}>
                {eq.nome.charAt(0)}
              </div>
              <div className='team-details'>
                <h3>{eq.nome}</h3>
                <p>
                  {eq.membros} membros • {eq.pontos} pontos
                </p>
              </div>
            </div>
            <div className='team-actions'>
              <button className='icon-btn'>
                <Eye size={16} />
              </button>
              <button className='icon-btn'>
                <Edit size={16} />
              </button>
              <button className='icon-btn delete'>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Team;
