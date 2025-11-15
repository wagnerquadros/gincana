import '../styles/ModalRelatorio.css'

export default function ModalRelatorioDetalhado({
    aberto,
    fechar,
    equipes = [],
    onExportExcel,
    onExportCSV
}) {
    if (!aberto) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-relatorio">

                {/* Cabeçalho */}
                <div className="modal-header">
                    <h2>📑 Relatório Detalhado</h2>
                    <button className="modal-close" onClick={fechar}>✖</button>
                </div>

                {/* Conteúdo */}
                <div className="modal-body">

                    {/* Filtros */}
                    <div className="filtros-relatorio">
                        <h3>Filtros</h3>

                        <label>
                            Período:
                            <select>
                                <option>Todos</option>
                                <option>Últimas 24h</option>
                                <option>Última semana</option>
                                <option>Último mês</option>
                            </select>
                        </label>

                        <label>
                            Equipe:
                            <select>
                                <option>Todas</option>
                                {equipes.map((e) => (
                                    <option key={e.id}>{e.nome}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Tipo de Pontuação:
                            <select>
                                <option>Todas</option>
                                <option>Pontos</option>
                                <option>Bônus</option>
                                <option>Penalidades</option>
                            </select>
                        </label>
                    </div>

                    {/* Pré-visualização */}
                    <div className="preview-relatorio">
                        <h3>Pré-visualização</h3>

                        <table className="preview-table">
                            <thead>
                                <tr>
                                    <th>Equipe</th>
                                    <th>Pontos</th>
                                    <th>Bônus</th>
                                    <th>Penalidades</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {equipes.map((r) => (
                                    <tr key={r.id}>
                                        <td>{r.nome}</td>
                                        <td>{r.pontos}</td>
                                        <td>{r.bonus}</td>
                                        <td>{r.penalidades}</td>
                                        <td><strong>{r.total}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>

                {/* Rodapé */}
                <div className="modal-footer">
                    <button
                        className="btn-exportar btn-exportar-excel"
                        onClick={onExportExcel}
                    >
                        📊 Exportar Excel
                    </button>

                    <button
                        className="btn-exportar btn-exportar-csv"
                        onClick={onExportCSV}
                    >
                        📄 Exportar CSV
                    </button>

                    <button className="btn-cancelar" onClick={fechar}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
