import React from 'react';
import './stylesReport.css';
import HeaderMenagerPainel from '../../../components/HeaderMenagerPainel/headerMenagerPainel';

function Report() {
  const equipes = [
    { nome: 'Águias Douradas', porcentagem: 98, cor: '#facc15' },
    { nome: 'Leões Vermelhos', porcentagem: 83, cor: '#ef4444' },
    { nome: 'Tigres Azuis', porcentagem: 97, cor: '#3b82f6' },
    { nome: 'Panteras Verdes', porcentagem: 81, cor: '#22c55e' },
  ];

  const atividades = [
    { status: 'Ativas', qtd: 2, cor: '#111' },
    { status: 'Pendentes', qtd: 1, cor: '#f4f4f4', texto: '#111' },
    { status: 'Finalizadas', qtd: 3, cor: '#e5e7eb', texto: '#444' },
  ];

  return (
    <div className='report-container'>
      <HeaderMenagerPainel />

      <h1 className='report-title'>Relatórios e Estatísticas</h1>

      <div className='report-grid'>
        {/* Participação por equipe */}
        <div className='report-card'>
          <h3>Participação por Equipe</h3>
          {equipes.map((eq, i) => (
            <div className='bar-item' key={i}>
              <div className='bar-label'>
                <span>{eq.nome}</span>
                <span>{eq.porcentagem}%</span>
              </div>
              <div className='bar-background'>
                <div
                  className='bar-fill'
                  style={{
                    width: `${eq.porcentagem}%`,
                    backgroundColor: eq.cor,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Atividades por status */}
        <div className='report-card'>
          <h3>Atividades por Status</h3>
          <div className='status-list'>
            {atividades.map((a, i) => (
              <div key={i} className='status-item'>
                <span>{a.status}</span>
                <span
                  className='status-badge'
                  style={{
                    backgroundColor: a.cor,
                    color: a.texto || '#fff',
                  }}
                >
                  {a.qtd}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;
