import React from 'react';
import './stylesHistory.css';
import HeaderTeamManeger from '../../../components/HeaderTeamPainel/headerTeamPainel';

export default function History() {
  return (
    <div className='history-container'>
      <HeaderTeamManeger />
      <h2>Histórico de Participação</h2>

      <div className='history-card'>
        <div className='history-info'>
          <h3>Arrecadação de Alimentos</h3>
          <p>Coletiva</p>
        </div>
        <div className='history-points'>
          <span>150/150 pontos</span>
          <div className='points-bar'>
            <div className='points-fill' style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      <div className='history-card'>
        <div className='history-info'>
          <h3>Quiz de Matemática</h3>
          <p>Individual</p>
        </div>
        <div className='history-status'>
          <span>Pontuação em análise</span>
        </div>
      </div>
    </div>
  );
}
