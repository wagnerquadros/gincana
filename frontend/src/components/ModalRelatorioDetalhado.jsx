import { useEffect, useMemo, useState } from "react";
import { exportToExcel, exportToCSV } from "../utils/exportUtils"; // ajuste caminho se necessário
import "./../styles/ModalRelatorio.css";

/**
 * Props:
 * - aberto (boolean) : abre/fecha modal
 * - fechar (fn) : função para fechar modal
 * - equipes (array) : lista completa do ranking (cada item deve ter id, nome, pontos, bonus, penalidades, total, membrosAtivos, data, atividade, media)
 * - atividades (array) : lista de atividades [{id, nome}]
 * - onExportExtra (fn) optional : callback extra pós export (logging, toast)
 */
export default function ModalRelatorioDetalhado({
  aberto,
  fechar,
  equipes = [],
  atividades = [],
  onExportExtra
}) {
  const [periodo, setPeriodo] = useState("Todos");
  const [equipeSelecionada, setEquipeSelecionada] = useState("Todas");
  const [atividadeSelecionada, setAtividadeSelecionada] = useState("Todas");
  const [nomeParticipante, setNomeParticipante] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");
  const [ordenacao, setOrdenacao] = useState({ campo: "total", dir: "desc" });

  // reset filtros quando abrir/fechar
  useEffect(() => {
    if (!aberto) {
      setPeriodo("Todos");
      setEquipeSelecionada("Todas");
      setAtividadeSelecionada("Todas");
      setNomeParticipante("");
      setDataFiltro("");
      setOrdenacao({ campo: "total", dir: "desc" });
    }
  }, [aberto]);

  // função para filtrar por período (simplificada)
  const aplicaPeriodo = (item) => {
    if (periodo === "Todos") return true;
    const hoje = new Date();
    const dataItem = item.data ? new Date(item.data) : null;
    if (!dataItem) return true;
    if (periodo === "Últimas 24h") {
      const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000);
      return dataItem >= ontem;
    }
    if (periodo === "Última semana") {
      const umaSemana = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
      return dataItem >= umaSemana;
    }
    if (periodo === "Último mês") {
      const umMes = new Date();
      umMes.setMonth(umMes.getMonth() - 1);
      return dataItem >= umMes;
    }
    return true;
  };

  // Aplicar todos os filtros e retornar dados filtrados
  const dadosFiltrados = useMemo(() => {
    const q = nomeParticipante.trim().toLowerCase();

    return equipes
      .filter((it) => {
        if (equipeSelecionada !== "Todas" && it.nome !== equipeSelecionada) return false;
        if (atividadeSelecionada !== "Todas" && (it.atividade || "") !== atividadeSelecionada) return false;
        if (q && !((it.nomeParticipante || "").toLowerCase().includes(q) || (it.nome || "").toLowerCase().includes(q))) return false;
        if (dataFiltro) {
          // compara apenas a parte da data (yyyy-mm-dd)
          const d = it.data ? it.data.slice(0, 10) : "";
          if (d !== dataFiltro) return false;
        }
        if (!aplicaPeriodo(it)) return false;
        return true;
      })
      .sort((a, b) => {
        const campo = ordenacao.campo;
        const dir = ordenacao.dir === "desc" ? -1 : 1;
        const va = a[campo] ?? 0;
        const vb = b[campo] ?? 0;
        if (typeof va === "string") return va.localeCompare(vb) * dir;
        return (va - vb) * dir;
      });
  }, [equipes, periodo, equipeSelecionada, atividadeSelecionada, nomeParticipante, dataFiltro, ordenacao]);

  // Cálculos agregados
  const agregados = useMemo(() => {
    const totalGeral = dadosFiltrados.reduce((s, r) => s + (Number(r.total) || 0), 0);
    const somaPontos = dadosFiltrados.reduce((s, r) => s + (Number(r.pontos) || 0), 0);
    const somaBonus = dadosFiltrados.reduce((s, r) => s + (Number(r.bonus) || 0), 0);
    const somaPenal = dadosFiltrados.reduce((s, r) => s + (Number(r.penalidades) || 0), 0);
    const mediaPorEquipe = dadosFiltrados.length ? (totalGeral / dadosFiltrados.length) : 0;
    return {
      totalGeral,
      somaPontos,
      somaBonus,
      somaPenal,
      mediaPorEquipe: Number(mediaPorEquipe.toFixed(2)),
      equipesContadas: dadosFiltrados.length
    };
  }, [dadosFiltrados]);

  // Preparar dados para exportação respeitando filtros
  const dadosParaExportacao = useMemo(() => {
    return dadosFiltrados.map((r, idx) => ({
      posicao: idx + 1,
      equipe: r.nome,
      atividade: r.atividade || "",
      participante: r.nomeParticipante || "",
      pontos: Number(r.pontos || 0),
      bonus: Number(r.bonus || 0),
      penalidades: Number(r.penalidades || 0),
      total: Number(r.total || 0),
      media: Number(r.media || 0),
      data: r.data || ""
    }));
  }, [dadosFiltrados]);

  // Export handlers
  const handleExportExcel = () => {
    const cabecalhos = {
      posicao: "Posição",
      equipe: "Equipe",
      atividade: "Atividade",
      participante: "Participante",
      pontos: "Pontos",
      bonus: "Bônus",
      penalidades: "Penalidades",
      total: "Total",
      media: "Média",
      data: "Data"
    };
    try {
      exportToExcel(dadosParaExportacao, `relatorio_detalhado`, cabecalhos, "Relatório");
      if (onExportExtra) onExportExtra('excel', dadosParaExportacao.length);
    } catch (err) {
      console.error(err);
      alert("Erro ao exportar para Excel.");
    }
  };

  const handleExportCSV = () => {
    const cabecalhos = {
      posicao: "Posição",
      equipe: "Equipe",
      atividade: "Atividade",
      participante: "Participante",
      pontos: "Pontos",
      bonus: "Bônus",
      penalidades: "Penalidades",
      total: "Total",
      media: "Média",
      data: "Data"
    };
    try {
      exportToCSV(dadosParaExportacao, `relatorio_detalhado`, cabecalhos);
      if (onExportExtra) onExportExtra('csv', dadosParaExportacao.length);
    } catch (err) {
      console.error(err);
      alert("Erro ao exportar para CSV.");
    }
  };

  // Pequeno gráfico de barras (totais por equipe) usando SVG
  const graficoSVG = useMemo(() => {
    const top = dadosFiltrados.slice(0, 8); // mostra só top 8 para o gráfico
    const max = top.reduce((m, r) => Math.max(m, Number(r.total || 0)), 0) || 1;
    const width = 700;
    const height = 180;
    const gap = 12;
    const barWidth = (width - gap * (top.length + 1)) / Math.max(1, top.length);

    const bars = top.map((r, i) => {
      const h = (Number(r.total || 0) / max) * (height - 30);
      const x = gap + i * (barWidth + gap);
      const y = height - h - 20;
      return { x, y, w: barWidth, h, label: r.nome, value: r.total };
    });

    return { width, height, bars };
  }, [dadosFiltrados]);

  if (!aberto) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-relatorio">

        <div className="modal-header">
          <h2>📑 Relatório Detalhado</h2>
          <button className="modal-close" onClick={fechar}>✖</button>
        </div>

        <div className="modal-body">

          {/* FILTROS */}
          <div className="filtros-relatorio">
            <h3>Filtros</h3>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <label style={{ flex: 1, minWidth: 180 }}>
                Período
                <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                  <option>Todos</option>
                  <option>Últimas 24h</option>
                  <option>Última semana</option>
                  <option>Último mês</option>
                </select>
              </label>

              <label style={{ flex: 1, minWidth: 200 }}>
                Equipe
                <select value={equipeSelecionada} onChange={(e) => setEquipeSelecionada(e.target.value)}>
                  <option>Todas</option>
                  {Array.from(new Map(equipes.map(it => [it.nome, it])).values()).map((e) => (
                    <option key={e.id || e.nome}>{e.nome}</option>
                  ))}
                </select>
              </label>

              <label style={{ flex: 1, minWidth: 200 }}>
                Atividade
                <select value={atividadeSelecionada} onChange={(e) => setAtividadeSelecionada(e.target.value)}>
                  <option>Todas</option>
                  {atividades.map(a => <option value={a.nome} key={a.id}>{a.nome}</option>)}
                </select>
              </label>

              <label style={{ flex: 1, minWidth: 200 }}>
                Nome do participante
                <input value={nomeParticipante} onChange={(e) => setNomeParticipante(e.target.value)} placeholder="Buscar por nome..." />
              </label>

              <label style={{ minWidth: 160 }}>
                Data
                <input type="date" value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)} />
              </label>

              <label style={{ minWidth: 200 }}>
                Ordenar por
                <select value={`${ordenacao.campo}_${ordenacao.dir}`} onChange={(e) => {
                  const [campo, dir] = e.target.value.split("_");
                  setOrdenacao({ campo, dir });
                }}>
                  <option value="total_desc">Total (desc)</option>
                  <option value="total_asc">Total (asc)</option>
                  <option value="pontos_desc">Pontos (desc)</option>
                  <option value="pontos_asc">Pontos (asc)</option>
                  <option value="nome_asc">Equipe (A→Z)</option>
                </select>
              </label>
            </div>
          </div>

          {/* PREVIEW */}
          <div className="preview-relatorio">
            <h3>Pré-visualização</h3>

            <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>Equipes:</strong> {agregados.equipesContadas} &nbsp; • &nbsp;
                <strong>Total Geral:</strong> {agregados.totalGeral} &nbsp; • &nbsp;
                <strong>Média por Equipe:</strong> {agregados.mediaPorEquipe}
              </div>
            </div>

            <table className="preview-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Equipe</th>
                  <th>Atividade</th>
                  <th>Pontos</th>
                  <th>Bônus</th>
                  <th>Penalidades</th>
                  <th>Total</th>
                  <th>Média</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {dadosFiltrados.map((r, idx) => (
                  <tr key={r.id ?? idx}>
                    <td>{idx + 1}</td>
                    <td>{r.nome}</td>
                    <td>{r.atividade ?? "-"}</td>
                    <td>{r.pontos ?? 0}</td>
                    <td>{r.bonus ?? 0}</td>
                    <td>{r.penalidades ?? 0}</td>
                    <td><strong>{r.total ?? 0}</strong></td>
                    <td>{r.media ?? "-"}</td>
                    <td>{r.data ? (r.data.slice(0,10)) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* GRÁFICO */}
          <div className="grafico-container">
            <h3>Gráfico de Desempenho (Top equipes)</h3>
            <div className="grafico-placeholder" style={{ padding: 8 }}>
              {/* SVG chart */}
              <svg width={graficoSVG.width} height={graficoSVG.height} viewBox={`0 0 ${graficoSVG.width} ${graficoSVG.height}`}>
                {/* eixo X baseline */}
                <line x1="0" y1={graficoSVG.height - 20} x2={graficoSVG.width} y2={graficoSVG.height - 20} stroke="#ddd" />
                {graficoSVG.bars.map((b, i) => (
                  <g key={i}>
                    <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#4a79c7" rx="4" />
                    <text x={b.x + b.w/2} y={graficoSVG.height - 4} textAnchor="middle" fontSize="11" fill="#214a79">{b.label.length > 10 ? b.label.slice(0,10) + "…" : b.label}</text>
                    <text x={b.x + b.w/2} y={b.y - 6} textAnchor="middle" fontSize="11" fill="#214a79">{b.value}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-exportar btn-exportar-excel" onClick={handleExportExcel}>📊 Exportar Excel</button>
            <button className="btn-exportar btn-exportar-csv" onClick={handleExportCSV}>📄 Exportar CSV</button>
          </div>
          <button className="btn-cancelar" onClick={fechar}>Fechar</button>
        </div>
      </div>
    </div>
  );
}


