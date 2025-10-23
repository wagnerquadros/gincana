import React from 'react';
import { BarChart3, Users, Trophy, ClipboardList, Clock } from 'lucide-react';
import './stylesInitial.css';
import { useNavigate } from 'react-router-dom';

function Initial() {
  const navigate = useNavigate();

  const handlerManagerPanel = () => {
    navigate('/dashboard');
  };

  const handlerManegerTeam = () => {
    navigate('/');
  };

  return (
    <div className='initial-container'>
      {/* Cabeçalho */}
      <header className='header'>
        <h1 className='title'>Sistema de Gincanas Estudantis</h1>
        <h2 className='subtitle'>Escola Estadual Demétrio Ribeiro</h2>
        <p className='tagline'>Modernizando a tradição com tecnologia</p>
      </header>

      {/* Seção de cards */}
      <section className='cards-section'>
        {/* Card Gestor */}
        <div className='card'>
          <div className='card-icon blue-bg'>
            <BarChart3 className='icon blue-icon' />
          </div>
          <h3 className='card-title'>Área do Gestor</h3>
          <p className='card-desc'>Gerencie atividades, equipes e acompanhe pontuações</p>
          <ul className='card-list'>
            <li>
              <ClipboardList size={16} /> Cadastrar atividades e equipes
            </li>
            <li>
              <Trophy size={16} /> Controlar pontuações
            </li>
            <li>
              <BarChart3 size={16} /> Relatórios em tempo real
            </li>
          </ul>
          <button className='btn btn-dark' onClick={handlerManagerPanel}>
            Acessar como Gestor
          </button>
        </div>

        {/* Card Equipe */}
        <div className='card'>
          <div className='card-icon green-bg'>
            <Users className='icon green-icon' />
          </div>
          <h3 className='card-title'>Área da Equipe</h3>
          <p className='card-desc'>Visualize atividades, ranking e participe das gincanas</p>
          <ul className='card-list'>
            <li>
              <ClipboardList size={16} /> Ver atividades disponíveis
            </li>
            <li>
              <Trophy size={16} /> Acompanhar ranking
            </li>
            <li>
              <Clock size={16} /> Histórico de participação
            </li>
          </ul>
          <button className='btn btn-light' onClick={handlerManegerTeam}>
            Acessar como Equipe
          </button>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className='features'>
        <h3 className='features-title'>Funcionalidades do Sistema</h3>
        <div className='features-list'>
          <div className='feature-item'>
            <Trophy className='feature-icon purple-icon' />
            <h4>Gamificação</h4>
            <p>Sistema de pontuação em tempo real com rankings dinâmicos</p>
          </div>
          <div className='feature-item'>
            <Users className='feature-icon orange-icon' />
            <h4>Gestão de Equipes</h4>
            <p>Cadastro e organização de equipes estudantis</p>
          </div>
          <div className='feature-item'>
            <BarChart3 className='feature-icon green-icon' />
            <h4>Relatórios</h4>
            <p>Acompanhamento transparente de resultados</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Initial;
