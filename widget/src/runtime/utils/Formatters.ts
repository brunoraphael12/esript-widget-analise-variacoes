/**
 * Funções de Formatação
 */

import { ITemporalSelection } from '../../types';
import { MESES_NOMES, MESES_ABREV } from './Constants';

// ============================================================================
// FORMATAÇÃO DE NÚMEROS
// ============================================================================

export const formatNumber = (value: number, decimals: number = 0): string => {
  return value.toLocaleString('pt-PT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${formatNumber(value, decimals)}%`;
};

export const formatLargeNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${formatNumber(value / 1000000, 1)}M`;
  }
  if (value >= 1000) {
    return `${formatNumber(value / 1000, 1)}K`;
  }
  return formatNumber(value);
};

// ============================================================================
// FORMATAÇÃO DE PERÍODOS
// ============================================================================

export const formatMes = (mes: number, abreviado: boolean = false): string => {
  if (mes < 1 || mes > 12) return '';
  return abreviado ? MESES_ABREV[mes - 1] : MESES_NOMES[mes - 1];
};

export const formatMeses = (meses: number[], abreviado: boolean = false): string => {
  if (meses.length === 0) return '';
  if (meses.length === 12) return 'Todos os meses';
  if (meses.length === 1) return formatMes(meses[0], abreviado);

  const mesesOrdenados = [...meses].sort((a, b) => a - b);

  // Detectar intervalos consecutivos
  const intervalos: string[] = [];
  let inicio = mesesOrdenados[0];
  let fim = mesesOrdenados[0];

  for (let i = 1; i < mesesOrdenados.length; i++) {
    if (mesesOrdenados[i] === fim + 1) {
      fim = mesesOrdenados[i];
    } else {
      if (inicio === fim) {
        intervalos.push(formatMes(inicio, abreviado));
      } else {
        intervalos.push(`${formatMes(inicio, abreviado)}-${formatMes(fim, abreviado)}`);
      }
      inicio = mesesOrdenados[i];
      fim = mesesOrdenados[i];
    }
  }

  // Adicionar último intervalo
  if (inicio === fim) {
    intervalos.push(formatMes(inicio, abreviado));
  } else {
    intervalos.push(`${formatMes(inicio, abreviado)}-${formatMes(fim, abreviado)}`);
  }

  return intervalos.join(', ');
};

export const formatPeriodo = (periodo: ITemporalSelection, abreviado: boolean = false): string => {
  if (!periodo.ano) return '';
  const mesesFormatados = formatMeses(periodo.meses, abreviado);
  return `${periodo.ano} - ${mesesFormatados}`;
};

// ============================================================================
// FORMATAÇÃO DE DATAS
// ============================================================================

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ============================================================================
// FORMATAÇÃO DE VARIAÇÃO
// ============================================================================

export const formatVariacao = (variacao: number): string => {
  const sinal = variacao >= 0 ? '+' : '';
  return `${sinal}${formatPercentage(variacao, 1)}`;
};

export const getVariacaoIcon = (variacao: number): string => {
  if (variacao > 0) return '▲';
  if (variacao < 0) return '▼';
  return '=';
};

export const getVariacaoColor = (variacao: number): string => {
  if (variacao > 0) return '#28a745'; // Verde
  if (variacao < 0) return '#dc3545'; // Vermelho
  return '#6c757d'; // Cinza
};

export const formatVariacaoCompleta = (variacao: number): string => {
  const icon = getVariacaoIcon(variacao);
  const valor = formatVariacao(variacao);
  return `${icon} ${valor}`;
};

// ============================================================================
// FORMATAÇÃO DE VALORES DE ANÁLISE
// ============================================================================

export const formatValorAnalise = (
  valor: number,
  tipo: 'oferta' | 'procura' | 'paragens'
): string => {
  switch (tipo) {
    case 'oferta':
      return `${formatLargeNumber(valor)} lugares`;
    case 'procura':
      return `${formatLargeNumber(valor)} passageiros`;
    case 'paragens':
      return `${formatNumber(valor)} paragens`;
    default:
      return formatNumber(valor);
  }
};

// ============================================================================
// FORMATAÇÃO DE TEMPO
// ============================================================================

export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
};

// ============================================================================
// FORMATAÇÃO DE CORES
// ============================================================================

export const rgbaToHex = (rgba: number[]): string => {
  const [r, g, b] = rgba;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const hexToRgba = (hex: string, alpha: number = 255): number[] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
        alpha
      ]
    : [0, 0, 0, alpha];
};

export const formatColorRgba = (rgba: number[]): string => {
  return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] / 255})`;
};

// ============================================================================
// FORMATAÇÃO DE LABELS
// ============================================================================

export const formatClassLabel = (min: number, max: number): string => {
  if (min === -Infinity) return `< ${formatNumber(max)}`;
  if (max === Infinity) return `> ${formatNumber(min)}`;
  return `${formatNumber(min)} - ${formatNumber(max)}`;
};

export const formatVariacaoLabel = (min: number, max: number): string => {
  if (min === -Infinity) return `< ${formatPercentage(max)}`;
  if (max === Infinity) return `> ${formatPercentage(min)}`;
  return `${formatPercentage(min)} a ${formatPercentage(max)}`;
};

// ============================================================================
// FORMATAÇÃO DE FEATURES COUNT
// ============================================================================

export const formatFeaturesCount = (count: number): string => {
  if (count === 0) return 'Nenhuma feature encontrada';
  if (count === 1) return '1 feature encontrada';
  return `${formatNumber(count)} features encontradas`;
};

// ============================================================================
// HELPERS
// ============================================================================

export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
};

export const capitalizeFirst = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
