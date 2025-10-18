import './stylesHeaderMenagerPainel.css'

export default function HeaderMenagerPainel() {
  return (
    <header className='painel-header'>
      <div className='painel-header-left'>
        <button className='btn-voltar'>← Voltar</button>
        <h1>Painel do Gestor</h1>
      </div>
      <nav className='painel-nav'>
        <a href='#'>Dashboard</a>
        <a href='#'>Equipes</a>
        <a href='#' className='active'>
          Atividades
        </a>
        <a href='#'>Relatórios</a>
      </nav>
    </header>
  )
}
