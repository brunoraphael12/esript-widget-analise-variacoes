/**
 * Constantes do Widget
 */

export const WIDGET_NAME = 'analise-variacoes';
export const WIDGET_VERSION = '1.0.0';

// Layer IDs
export const ANALYSIS_LAYER_ID = 'analise-variacoes-layer';
export const ANALYSIS_LAYER_TITLE = 'Análise de Variações';

// Cache
export const CACHE_PREFIX = 'av_cache_';
export const DEFAULT_CACHE_TTL = 300; // 5 minutos

// Query
export const DEFAULT_TIMEOUT = 30000; // 30 segundos
export const DEFAULT_MAX_FEATURES = 5000;

// Meses
export const MESES_NOMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const MESES_ABREV = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

// Símbolos
export const DEFAULT_LINE_WIDTH = 2;
export const DEFAULT_POINT_SIZE = 8;
export const DEFAULT_OUTLINE_WIDTH = 1;

// Cores padrão
export const DEFAULT_COLOR = [0, 121, 193, 255]; // ArcGIS Blue
export const DEFAULT_OUTLINE_COLOR = [255, 255, 255, 255]; // White

// Analytics
export const TRACK_EVENTS = true;
export const DEBUG_MODE = false;
