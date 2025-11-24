/**
 * Utilitários para exportação de dados
 * 
 * Este módulo fornece funções reutilizáveis para exportar dados em formatos Excel (.xlsx) e CSV (.csv).
 * 
 * Como usar em outros módulos:
 * 
 * 1. Importe as funções:
 *    import { exportToExcel, exportToCSV } from '../utils/exportUtils';
 * 
 * 2. Prepare seus dados no formato esperado:
 *    const dados = [
 *      { nome: 'Equipe A', pontuacao: 100, posicao: 1 },
 *      { nome: 'Equipe B', pontuacao: 90, posicao: 2 }
 *    ];
 * 
 * 3. Defina os cabeçalhos (opcional, será inferido se não fornecido):
 *    const cabecalhos = { nome: 'Nome', pontuacao: 'Pontuação', posicao: 'Posição' };
 * 
 * 4. Chame a função de exportação:
 *    exportToExcel(dados, 'ranking_gincana', cabecalhos);
 *    // ou
 *    exportToCSV(dados, 'ranking_gincana', cabecalhos);
 * 
 * @module exportUtils
 */

import * as XLSX from 'xlsx';

/**
 * Gera um nome de arquivo seguro com data
 * @param {string} baseNome - Nome base do arquivo
 * @param {string} extensao - Extensão do arquivo (ex: 'xlsx', 'csv')
 * @returns {string} Nome do arquivo com data formatada
 */
function gerarNomeArquivo(baseNome, extensao) {
  const data = new Date();
  const dataFormatada = data.toISOString().split('T')[0]; // YYYY-MM-DD
  const nomeSeguro = baseNome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9_]/g, '_') // Substitui caracteres especiais por underscore
    .replace(/_+/g, '_') // Remove underscores duplicados
    .replace(/^_|_$/g, ''); // Remove underscores do início e fim
  
  return `${nomeSeguro}_${dataFormatada}.${extensao}`;
}

/**
 * Exporta dados para Excel (.xlsx)
 * 
 * @param {Array<Object>} dados - Array de objetos com os dados a serem exportados
 * @param {string} nomeBase - Nome base do arquivo (sem extensão)
 * @param {Object} cabecalhos - Objeto mapeando chaves para rótulos de cabeçalho (opcional)
 * @param {string} nomePlanilha - Nome da planilha no Excel (padrão: 'Dados')
 * 
 * @example
 * const dados = [
 *   { nome: 'Equipe A', pontos: 100, posicao: 1 },
 *   { nome: 'Equipe B', pontos: 90, posicao: 2 }
 * ];
 * const cabecalhos = { nome: 'Nome da Equipe', pontos: 'Pontos', posicao: 'Posição' };
 * exportToExcel(dados, 'ranking_turma_A', cabecalhos);
 */
export function exportToExcel(dados, nomeBase, cabecalhos = {}, nomePlanilha = 'Dados') {
  if (!Array.isArray(dados) || dados.length === 0) {
    console.warn('Nenhum dado fornecido para exportação');
    return;
  }

  try {
    // Se cabecalhos não foram fornecidos, usa as chaves do primeiro objeto
    const chaves = Object.keys(dados[0]);
    const cabecalhosFinais = {};
    
    if (Object.keys(cabecalhos).length === 0) {
      // Usa as próprias chaves como cabeçalhos (capitalizadas)
      chaves.forEach(chave => {
        cabecalhosFinais[chave] = chave
          .replace(/([A-Z])/g, ' $1') // Adiciona espaço antes de letras maiúsculas
          .replace(/^./, str => str.toUpperCase()) // Capitaliza primeira letra
          .trim();
      });
    } else {
      // Usa os cabeçalhos fornecidos, mantendo apenas as chaves que existem nos dados
      chaves.forEach(chave => {
        cabecalhosFinais[chave] = cabecalhos[chave] || chave;
      });
    }

    // Prepara os dados para a planilha
    const dadosFormatados = dados.map(item => {
      const linha = {};
      chaves.forEach(chave => {
        linha[cabecalhosFinais[chave]] = item[chave] ?? '';
      });
      return linha;
    });

    // Cria a planilha
    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);

    // Ajusta largura das colunas
    const colunas = Object.keys(cabecalhosFinais).map(chave => {
      const larguraCabecalho = cabecalhosFinais[chave].length;
      const largurasDados = dadosFormatados.map(linha => 
        String(linha[cabecalhosFinais[chave]] || '').length
      );
      const larguraMaxima = Math.max(larguraCabecalho, ...largurasDados);
      // Define limites: mínimo 10, máximo 50, ou a largura calculada
      return {
        wch: Math.min(Math.max(larguraMaxima + 2, 10), 50)
      };
    });
    worksheet['!cols'] = colunas;

    // Cria o workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, nomePlanilha);

    // Gera o arquivo e faz o download
    const nomeArquivo = gerarNomeArquivo(nomeBase, 'xlsx');
    XLSX.writeFile(workbook, nomeArquivo);

    console.log(`Arquivo Excel exportado: ${nomeArquivo}`);
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw new Error('Não foi possível exportar o arquivo Excel');
  }
}

/**
 * Exporta dados para CSV (.csv)
 * 
 * @param {Array<Object>} dados - Array de objetos com os dados a serem exportados
 * @param {string} nomeBase - Nome base do arquivo (sem extensão)
 * @param {Object} cabecalhos - Objeto mapeando chaves para rótulos de cabeçalho (opcional)
 * @param {string} separador - Separador de campos (padrão: ',')
 * 
 * @example
 * const dados = [
 *   { nome: 'Equipe A', pontos: 100, posicao: 1 },
 *   { nome: 'Equipe B', pontos: 90, posicao: 2 }
 * ];
 * const cabecalhos = { nome: 'Nome da Equipe', pontos: 'Pontos', posicao: 'Posição' };
 * exportToCSV(dados, 'ranking_turma_A', cabecalhos);
 */
export function exportToCSV(dados, nomeBase, cabecalhos = {}, separador = ',') {
  if (!Array.isArray(dados) || dados.length === 0) {
    console.warn('Nenhum dado fornecido para exportação');
    return;
  }

  try {
    // Se cabecalhos não foram fornecidos, usa as chaves do primeiro objeto
    const chaves = Object.keys(dados[0]);
    const cabecalhosFinais = {};
    
    if (Object.keys(cabecalhos).length === 0) {
      // Usa as próprias chaves como cabeçalhos (capitalizadas)
      chaves.forEach(chave => {
        cabecalhosFinais[chave] = chave
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
      });
    } else {
      // Usa os cabeçalhos fornecidos
      chaves.forEach(chave => {
        cabecalhosFinais[chave] = cabecalhos[chave] || chave;
      });
    }

    // Função auxiliar para escapar valores CSV
    const escaparCSV = (valor) => {
      const str = String(valor ?? '');
      // Se contém vírgula, aspas ou quebra de linha, precisa ser envolvido em aspas
      if (str.includes(separador) || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`; // Duplica aspas internas
      }
      return str;
    };

    // Monta as linhas do CSV
    const linhas = [];
    
    // Cabeçalho
    const linhaCabecalho = chaves.map(chave => escaparCSV(cabecalhosFinais[chave]));
    linhas.push(linhaCabecalho.join(separador));

    // Dados
    dados.forEach(item => {
      const linha = chaves.map(chave => escaparCSV(item[chave]));
      linhas.push(linha.join(separador));
    });

    // Cria o conteúdo do CSV
    const conteudoCSV = linhas.join('\n');

    // Adiciona BOM para Excel abrir corretamente com caracteres especiais (UTF-8)
    const bom = '\uFEFF';
    const blob = new Blob([bom + conteudoCSV], { type: 'text/csv;charset=utf-8;' });

    // Cria link de download
    const nomeArquivo = gerarNomeArquivo(nomeBase, 'csv');
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', nomeArquivo);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Libera a URL do objeto
    URL.revokeObjectURL(url);

    console.log(`Arquivo CSV exportado: ${nomeArquivo}`);
  } catch (error) {
    console.error('Erro ao exportar para CSV:', error);
    throw new Error('Não foi possível exportar o arquivo CSV');
  }
}

