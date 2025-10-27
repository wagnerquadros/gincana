import "../styles/DashboardColor.css";

export default function Gincana() {
  return (
    <div className="dash">
      {/* Topbar */}
      <header className="topbar">
        <div className="left">
          <button className="icon-btn" aria-label="Voltar">
            ←
          </button>
          <h1 className="title">Painel do Gestor</h1>
        </div>

        <nav className="tabs">
          <a className="tab active">Dashboard</a>
          <a className="tab">Equipes</a>
          <a className="tab">Atividades</a>
          <a className="tab">Relatórios</a>
        </nav>
      </header>

      <main className="content">
        {/* KPIs */}
        <section className="kpis">
          <div className="kpi kpi-a">
            <div className="kpi-head">
              <span>Total de Equipes</span>
              <span className="ico">👥</span>
            </div>
            <div className="kpi-num">4</div>
            <div className="kpi-sub">94 estudantes participando</div>
          </div>

          <div className="kpi kpi-b">
            <div className="kpi-head">
              <span>Atividades Ativas</span>
              <span className="ico">🗓️</span>
            </div>
            <div className="kpi-num">2</div>
            <div className="kpi-sub">6 atividades no total</div>
          </div>

          <div className="kpi kpi-c">
            <div className="kpi-head">
              <span>Pontuação Líder</span>
              <span className="ico">🏆</span>
            </div>
            <div className="kpi-num">850</div>
            <div className="kpi-sub">Águias Douradas</div>
          </div>

          <div className="kpi kpi-d">
            <div className="kpi-head">
              <span>Engajamento</span>
              <span className="ico">📊</span>
            </div>
            <div className="kpi-num">87%</div>
            <div className="kpi-sub">Participação média</div>
          </div>
        </section>

        {/* 2 colunas */}
        <section className="cols">
          {/* Ranking */}
          <div className="card">
            <h2 className="section-title">Ranking das Equipes</h2>

            <ul className="rank">
              <li className="rank-item">
                <div className="rank-left">
                  <span className="medal gold">1</span>
                  <div>
                    <div className="rank-name">Águias Douradas</div>
                    <div className="rank-sub">25 membros</div>
                  </div>
                </div>
                <div className="rank-right">
                  <div className="rank-score">850</div>
                  <div className="rank-unit">pontos</div>
                </div>
              </li>

              <li className="rank-item">
                <div className="rank-left">
                  <span className="medal silver">2</span>
                  <div>
                    <div className="rank-name">Leões Vermelhos</div>
                    <div className="rank-sub">23 membros</div>
                  </div>
                </div>
                <div className="rank-right">
                  <div className="rank-score">720</div>
                  <div className="rank-unit">pontos</div>
                </div>
              </li>

              <li className="rank-item">
                <div className="rank-left">
                  <span className="medal bronze">3</span>
                  <div>
                    <div className="rank-name">Tigres Azuis</div>
                    <div className="rank-sub">24 membros</div>
                  </div>
                </div>
                <div className="rank-right">
                  <div className="rank-score">680</div>
                  <div className="rank-unit">pontos</div>
                </div>
              </li>

              <li className="rank-item">
                <div className="rank-left">
                  <span className="medal green">4</span>
                  <div>
                    <div className="rank-name">Panteras Verdes</div>
                    <div className="rank-sub">22 membros</div>
                  </div>
                </div>
                <div className="rank-right">
                  <div className="rank-score">590</div>
                  <div className="rank-unit">pontos</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Atividades Recentes */}
          <div className="card">
            <h2 className="section-title">Atividades Recentes</h2>

            <ul className="act">
              <li className="act-item">
                <div>
                  <div className="act-title">Quiz de História</div>
                  <div className="act-sub">Individual • 100 pontos</div>
                </div>
                <span className="badge on">Ativa</span>
              </li>

              <li className="act-item">
                <div>
                  <div className="act-title">Dança Folclórica</div>
                  <div className="act-sub">Coletiva • 200 pontos</div>
                </div>
                <span className="badge wait">Pendente</span>
              </li>

              <li className="act-item">
                <div>
                  <div className="act-title">Arrecadação de Alimentos</div>
                  <div className="act-sub">Coletiva • 150 pontos</div>
                </div>
                <span className="badge off">Finalizada</span>
              </li>

              <li className="act-item">
                <div>
                  <div className="act-title">Poesia Declamada</div>
                  <div className="act-sub">Individual • 80 pontos</div>
                </div>
                <span className="badge on">Ativa</span>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
