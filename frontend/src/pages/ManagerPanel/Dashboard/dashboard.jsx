import React from 'react';
import { Users, Calendar, Trophy, BarChart3 } from 'lucide-react';
import './stylesDashboard.css';
import HeaderMenagerPainel from '../../../components/HeaderMenagerPainel/headerMenagerPainel';

function Dashboard() {
  const equipes = [
    { nome: 'Águias Douradas', membros: 25, pontos: 850, cor: '#facc15' },
    { nome: 'Leões Vermelhos', membros: 23, pontos: 720, cor: '#ef4444' },
    { nome: 'Tigres Azuis', membros: 24, pontos: 680, cor: '#3b82f6' },
    { nome: 'Panteras Verdes', membros: 22, pontos: 590, cor: '#22c55e' },
  ];

  const atividades = [
    { titulo: 'Quiz de História', tipo: 'Individual', pontos: 100, status: 'Ativa' },
    { titulo: 'Dança Folclórica', tipo: 'Coletiva', pontos: 200, status: 'Pendente' },
    { titulo: 'Arrecadação de Alimentos', tipo: 'Coletiva', pontos: 150, status: 'Finalizada' },
    { titulo: 'Poesia Declamada', tipo: 'Individual', pontos: 80, status: 'Ativa' },
  ];

  return (
    <div className='dashboard-container'>
      <HeaderMenagerPainel />
      {/* Cards superiores */}
      <div className='dashboard-top'>
        <div className='stat-card'>
          <div className='icon'>
            <Users />
          </div>
          <h4>Total de Equipes</h4>
          <h2>4</h2>
          <p>94 estudantes participando</p>
        </div>

        <div className='stat-card'>
          <div className='icon'>
            <Calendar />
          </div>
          <h4>Atividades Ativas</h4>
          <h2>2</h2>
          <p>6 atividades no total</p>
        </div>

        <div className='stat-card'>
          <div className='icon'>
            <Trophy />
          </div>
          <h4>Pontuação Líder</h4>
          <h2>850</h2>
          <p>Águias Douradas</p>
        </div>

        <div className='stat-card'>
          <div className='icon'>
            <BarChart3 />
          </div>
          <h4>Engajamento</h4>
          <h2>87%</h2>
          <p>Participação média</p>
        </div>
      </div>

      {/* Corpo principal */}
      <div className='dashboard-main'>
        {/* Ranking das equipes */}
        <div className='ranking-section'>
          <h3>Ranking das Equipes</h3>
          <div className='ranking-list'>
            {equipes.map((eq, i) => (
              <div className='ranking-item' key={i}>
                <div className='ranking-left'>
                  <div className='ranking-pos' style={{ backgroundColor: eq.cor }}>
                    {i + 1}
                  </div>
                  <div>
                    <h4>{eq.nome}</h4>
                    <p>{eq.membros} membros</p>
                  </div>
                </div>
                <div className='ranking-right'>
                  <h4>{eq.pontos}</h4>
                  <p>pontos</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Atividades recentes */}
        <div className='activities-section'>
          <h3>Atividades Recentes</h3>
          <div className='activity-list'>
            {atividades.map((a, i) => (
              <div className='activity-item' key={i}>
                <div>
                  <h4>{a.titulo}</h4>
                  <p>
                    {a.tipo} • {a.pontos} pontos
                  </p>
                </div>
                <span className={`status ${a.status.toLowerCase()}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
