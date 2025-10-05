/**
 * Tipos e Interfaces do Widget Análise de Variações
 * ArcGIS Experience Builder 11.3
 */

import { IMConfig as JimuIMConfig } from 'jimu-core';

// ============================================================================
// CONFIGURAÇÃO DO WIDGET
// ============================================================================

export interface IMConfig extends JimuIMConfig {
  variaveis: IVariableConfig[];
  filtros: IFilterConfig[];
  textos: ITextos;
  simbologiaPadrao: ISimbolgiaPadrao;
  configuracaoAvancada: IConfiguracaoAvancada;
  autenticacao?: IAuthConfig;
  useMapWidgetIds?: string[];
}

// ============================================================================
// VARIÁVEIS
// ============================================================================

export interface IVariableConfig {
  id: string;
  nome: string;
  tipo: 'ponto' | 'linha' | 'poligono';
  urlGeografico: string;
  urlAlfanumerico: string;
  codigoLigacao: string; // Campo na camada GEOGRÁFICA
  codigoLigacaoAlfanumerico?: string; // Campo na camada ALFANUMÉRICA (opcional, se diferente)
  campoValor: string;
  camposFiltro: string[]; // Nomes dos campos da tabela alfanumérica que serão usados como filtros
  camposFiltroAlias?: { [campo: string]: string }; // Aliases/apelidos para exibição dos filtros

  // Campos de data temporal
  tipoData?: 'separados' | 'unico'; // Define se usa campos separados (ano+mês) ou único (data completa)
  campoAno?: string; // Campo que contém o ano (quando tipoData = 'separados')
  campoMes?: string; // Campo que contém o mês (quando tipoData = 'separados')
  campoData?: string; // Campo com data completa (quando tipoData = 'unico')

  // Campo para seleção de eixo/linha
  campoEixo?: string; // Campo da camada geográfica que identifica o eixo/linha (para listagem de valores únicos)
}

// ============================================================================
// FILTROS
// ============================================================================

export interface IFilterConfig {
  id: string;
  nome: string;
  tipo: 'unico' | 'multiplo';
  campo: string;
  opcaoTodos: boolean;
  dependeDe: string | null;
}

export interface IFilterValues {
  servico: string[];
  eixo: string[];
  [key: string]: string[];
}

// ============================================================================
// SELEÇÃO TEMPORAL
// ============================================================================

export interface ITemporalSelection {
  ano: number | null;
  meses: number[]; // 1-12
}

export interface ITemporalPeriod {
  ano: number;
  meses: number[];
  label?: string;
}

// ============================================================================
// ANÁLISE
// ============================================================================

export type AnalysisMethod = 'sem-variacao' | 'com-variacao';

export interface IAnalysisConfig {
  variavel: IVariableConfig | null;
  metodo: AnalysisMethod;
  periodo1: ITemporalSelection;
  periodo2?: ITemporalSelection;
  filtros: IFilterValues;
}

// ============================================================================
// SIMBOLIZAÇÃO
// ============================================================================

export type ClassificationMethod = 'natural-breaks' | 'equal-interval' | 'quantile';

export interface ISymbologyConfig {
  numClasses: number;
  metodo: ClassificationMethod;
  rampa: string;
  classesCustomizadas?: IClassBreak[];
}

export interface IClassBreak {
  min: number;
  max: number;
  cor: number[]; // RGBA [r, g, b, a]
  label: string;
  largura?: number; // Para linhas
}

export interface ISimbolgiaPadrao {
  semVariacao: {
    numClasses: number;
    metodo: ClassificationMethod;
    rampa: string;
  };
  comVariacao: {
    classes: IClassBreak[];
  };
}

// ============================================================================
// QUERY E RESULTADOS
// ============================================================================

export interface IQueryResult {
  features: __esri.Graphic[];
  count: number;
  executionTime: number;
}

export interface IAlphanumericData {
  [key: string]: any;
  TOTAL?: number;
  TOTAL_P1?: number;
  TOTAL_P2?: number;
}

export interface IFeatureEnriquecida extends __esri.Graphic {
  attributes: {
    [key: string]: any;
    VALOR_ANALISE?: number;
    VALOR_P1?: number;
    VALOR_P2?: number;
    VARIACAO?: number;
  };
}

// ============================================================================
// TEXTOS E MENSAGENS
// ============================================================================

export interface ITextos {
  titulo: string;
  subtitulo: string;
  labelVariavel: string;
  labelMetodo: string;
  labelPeriodo: string;
  labelPeriodo1: string;
  labelPeriodo2: string;
  labelAno: string;
  labelMeses: string;
  botaoGerar: string;
  msgSucesso: string;
  msgErro: string;
  msgSemDados: string;
  msgCarregando: string;
}

// ============================================================================
// CONFIGURAÇÕES AVANÇADAS
// ============================================================================

export interface IConfiguracaoAvancada {
  cache: boolean;
  tempoCache: number; // segundos
  timeout: number; // segundos
  maxFeatures: number;
  zoomAutomatico: boolean;
  posicaoLegenda: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  debugMode: boolean;
}

// ============================================================================
// AUTENTICAÇÃO
// ============================================================================

export interface IAuthConfig {
  enabled: boolean;
  portalUrl: string;
  username: string;
  password: string;
  tokenExpiration?: number; // minutos (padrão 60)
}

export interface IAuthToken {
  token: string;
  expires: number; // timestamp
  ssl: boolean;
}

// ============================================================================
// ERROS
// ============================================================================

export enum ErrorCodes {
  NO_DATA_FOUND = 'NO_DATA_FOUND',
  INVALID_PERIOD = 'INVALID_PERIOD',
  INVALID_CONFIG = 'INVALID_CONFIG',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  GEOMETRY_ERROR = 'GEOMETRY_ERROR',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTH_ERROR'
}

export interface IErrorMessage {
  titulo: string;
  mensagem: string;
  sugestoes: string[];
}

// ============================================================================
// ANALYTICS
// ============================================================================

export enum AnalyticsEvents {
  WIDGET_LOADED = 'widget_loaded',
  VARIABLE_SELECTED = 'variable_selected',
  METHOD_CHANGED = 'method_changed',
  ANALYSIS_STARTED = 'analysis_started',
  ANALYSIS_COMPLETED = 'analysis_completed',
  ANALYSIS_FAILED = 'analysis_failed',
  LAYER_CREATED = 'layer_created',
  SYMBOLOGY_CHANGED = 'symbology_changed',
  FILTER_APPLIED = 'filter_applied',
  ERROR_OCCURRED = 'error_occurred'
}

export interface IAnalyticsData {
  variable?: string;
  method?: AnalysisMethod;
  featuresCount?: number;
  executionTime?: number;
  error?: string;
  [key: string]: any;
}

// ============================================================================
// PROPS DOS COMPONENTES
// ============================================================================

export interface IVariableSelectorProps {
  variaveis: IVariableConfig[];
  selected: IVariableConfig | null;
  onChange: (variavel: IVariableConfig) => void;
  label?: string;
}

export interface IAnalysisMethodToggleProps {
  method: AnalysisMethod;
  onChange: (method: AnalysisMethod) => void;
}

export interface ITemporalSelectorProps {
  periodo: ITemporalSelection;
  onChange: (periodo: ITemporalSelection) => void;
  label: string;
  urlAlfanumerico?: string;
}

export interface IDynamicFiltersProps {
  filtros: IFilterConfig[];
  values: IFilterValues;
  onChange: (values: IFilterValues) => void;
  variavel: IVariableConfig | null;
}

export interface IFilterCheckboxGroupProps {
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
  showTodos?: boolean;
  disabled?: boolean;
}

export interface ISymbologyControlsProps {
  config: ISymbologyConfig;
  onChange: (config: ISymbologyConfig) => void;
  tipo: 'ponto' | 'linha' | 'poligono';
  metodoAnalise: AnalysisMethod;
}

export interface ILegendProps {
  classes: IClassBreak[];
  titulo?: string;
}

// ============================================================================
// CACHE
// ============================================================================

export interface ICacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface ICache {
  get<T>(key: string): T | null;
  set<T>(key: string, data: T, ttl?: number): void;
  has(key: string): boolean;
  clear(): void;
  clearExpired(): void;
}

// ============================================================================
// VALIDAÇÃO
// ============================================================================

export interface IValidationResult {
  valid: boolean;
  errors: string[];
}

export interface IAnalysisValidation extends IValidationResult {
  canGenerate: boolean;
  missingFields: string[];
}

// ============================================================================
// METADADOS DE SERVIÇOS REST
// ============================================================================

export interface IFieldInfo {
  name: string;
  type: string;
  alias?: string;
  length?: number;
  nullable?: boolean;
  editable?: boolean;
}

export interface IServiceMetadata {
  name: string;
  type: string;
  fields: IFieldInfo[];
  geometryType?: string;
}

// ============================================================================
// STATE DO PAINEL DE CONFIGURAÇÕES
// ============================================================================

export interface ISettingState {
  // Campos disponíveis por variável (índice)
  camposGeoDisponiveis: {
    [index: number]: IFieldInfo[];
  };
  camposAlfaDisponiveis: {
    [index: number]: IFieldInfo[];
  };

  // Estados de loading
  loadingCamposGeo: {
    [index: number]: boolean;
  };
  loadingCamposAlfa: {
    [index: number]: boolean;
  };

  // Estados de erro
  errorCamposGeo: {
    [index: number]: string | null;
  };
  errorCamposAlfa: {
    [index: number]: string | null;
  };

  // Estados de sucesso (para feedback visual)
  successCamposGeo: {
    [index: number]: boolean;
  };
  successCamposAlfa: {
    [index: number]: boolean;
  };

  // Autenticação
  authToken: IAuthToken | null;
  testingAuth: boolean;
  authError: string | null;
  authSuccess: boolean;
}
