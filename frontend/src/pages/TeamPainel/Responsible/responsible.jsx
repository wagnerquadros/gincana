import React from 'react';
import { FaPlus, FaTrashAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import './stylesResponsible.css';
import HeaderTeamManeger from '../../../components/HeaderTeamPainel/headerTeamPainel';

export default function Responsible() {
  const responsaveis = [
    {
      id: 1,
      nome: 'Maria Silva',
      parentesco: 'Mãe',
      estudante: 'João Silva',
      telefone: '(11) 99999-1234',
      email: 'maria.silva@email.com',
    },
    {
      id: 2,
      nome: 'Carlos Santos',
      parentesco: 'Pai',
      estudante: 'Ana Santos',
      telefone: '(11) 98888-5678',
      email: 'carlos.santos@email.com',
    },
  ];

  return (
    <div className='responsible-container'>
      <HeaderTeamManeger />
      <div className='responsible-header'>
        <h2>Responsáveis Cadastrados</h2>
        <span>{responsaveis.length} cadastrados</span>
      </div>

      <div className='responsible-form'>
        <h3>
          <FaPlus /> Cadastrar Novo Responsável
        </h3>
        <div className='form-grid'>
          <div className='form-group'>
            <label>Nome Completo *</label>
            <input type='text' placeholder='Digite o nome completo' />
          </div>

          <div className='form-group'>
            <label>Parentesco *</label>
            <input type='text' placeholder='Ex: Mãe, Pai, Avó...' />
          </div>

          <div className='form-group'>
            <label>Telefone *</label>
            <input type='text' placeholder='(11) 99999-9999' />
          </div>

          <div className='form-group'>
            <label>E-mail</label>
            <input type='email' placeholder='email@exemplo.com' />
          </div>

          <div className='form-group full-width'>
            <label>Nome do Estudante</label>
            <input type='text' placeholder='Nome do estudante relacionado' />
          </div>
        </div>

        <button className='btn-cadastrar'>
          <FaPlus /> Cadastrar Responsável
        </button>
      </div>

      {responsaveis.map((resp) => (
        <div key={resp.id} className='responsible-card'>
          <div className='responsible-info'>
            <h4>{resp.nome}</h4>
            <p>{resp.parentesco}</p>
            <span>Responsável por: {resp.estudante}</span>
            <div className='contact'>
              <p>
                <FaPhoneAlt /> {resp.telefone}
              </p>
              <p>
                <FaEnvelope /> {resp.email}
              </p>
            </div>
          </div>
          <FaTrashAlt className='delete-icon' />
        </div>
      ))}
    </div>
  );
}
