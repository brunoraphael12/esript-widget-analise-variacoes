/**
 * Configuração e constantes do Widget Análise de Variações
 */

import { IMConfig } from './types';

// ============================================================================
// CONFIGURAÇÃO PADRÃO
// ============================================================================

export const DEFAULT_CONFIG: Partial<IMConfig> = {
  variaveis: [
    {
      id: 'oferta',
      nome: 'Oferta',
      tipo: 'linha',
      urlGeografico: '',
      urlAlfanumerico: '',
      codigoLigacao: 'ID_EIXO',
      campoValor: 'VALOR_OFERTA',
      servicosDisponiveis: [
        'AP',
        'IC',
        'Internacional',
        'Regional',
        'InterRegional',
        'Urbanos Porto',
        'Urbanos Coimbra',
        'Urbanos Lisboa'
      ]
    },
    {
      id: 'procura',
      nome: 'Procura',
      tipo: 'linha',
      urlGeografico: '',
      urlAlfanumerico: '',
      codigoLigacao: 'ID_EIXO',
      campoValor: 'VALOR_PROCURA',
      servicosDisponiveis: ['AP', 'IC', 'Regional', 'Internacional']
    }
  ],
  filtros: [
    {
      id: 'servico',
      nome: 'Serviço',
      tipo: 'multiplo',
      campo: 'TIPO_SERVICO',
      opcaoTodos: true,
      dependeDe: null
    },
    {
      id: 'eixo',
      nome: 'Eixo/Linha',
      tipo: 'multiplo',
      campo: 'EIXO',
      opcaoTodos: true,
      dependeDe: 'servico'
    }
  ],
  textos: {
    titulo: 'Análise de Variações',
    subtitulo: 'Análise temporal de dados de transporte',
    labelVariavel: 'Selecione a variável',
    labelMetodo: 'Método de análise',
    labelPeriodo: 'Período temporal',
    labelPeriodo1: '1º Período',
    labelPeriodo2: '2º Período',
    labelAno: 'Ano',
    labelMeses: 'Meses',
    botaoGerar: 'Gerar Mapa',
    msgSucesso: 'Camada gerada com sucesso',
    msgErro: 'Erro ao gerar camada',
    msgSemDados: 'Nenhum dado encontrado',
    msgCarregando: 'A carregar...'
  },
  simbologiaPadrao: {
    semVariacao: {
      numClasses: 5,
      metodo: 'natural-breaks',
      rampa: 'green-yellow-red'
    },
    comVariacao: {
      classes: [
        {
          min: -Infinity,
          max: -50,
          cor: [139, 0, 0, 255],
          label: 'Redução > 50%',
          largura: 1
        },
        {
          min: -50,
          max: -25,
          cor: [255, 99, 71, 255],
          label: 'Redução 25-50%',
          largura: 2
        },
        {
          min: -25,
          max: 0,
          cor: [255, 255, 0, 255],
          label: 'Redução < 25%',
          largura: 3
        },
        {
          min: 0,
          max: 25,
          cor: [144, 238, 144, 255],
          label: 'Crescimento < 25%',
          largura: 4
        },
        {
          min: 25,
          max: 50,
          cor: [0, 128, 0, 255],
          label: 'Crescimento 25-50%',
          largura: 5
        },
        {
          min: 50,
          max: Infinity,
          cor: [0, 100, 0, 255],
          label: 'Crescimento > 50%',
          largura: 6
        }
      ]
    }
  },
  configuracaoAvancada: {
    cache: true,
    tempoCache: 300,
    timeout: 30,
    maxFeatures: 5000,
    zoomAutomatico: true,
    posicaoLegenda: 'bottom-right',
    debugMode: false
  }
};

// ============================================================================
// MENSAGENS DE ERRO
// ============================================================================

export const ERROR_MESSAGES = {
  NO_DATA_FOUND: {
    titulo: 'Nenhum dado encontrado',
    mensagem: 'Não foram encontrados dados para os filtros selecionados.',
    sugestoes: [
      'Tente selecionar um período diferente',
      'Verifique se os filtros estão corretos',
      'Selecione "Todos" em Serviço para ampliar a busca'
    ]
  },
  SERVICE_UNAVAILABLE: {
    titulo: 'Serviço indisponível',
    mensagem: 'Não foi possível conectar ao serviço REST.',
    sugestoes: [
      'Verifique sua conexão com a internet',
      'Tente novamente em alguns instantes',
      'Contate o administrador se o problema persistir'
    ]
  },
  INVALID_PERIOD: {
    titulo: 'Período inválido',
    mensagem: 'O período selecionado é inválido.',
    sugestoes: [
      'Verifique se o ano está correto',
      'Selecione ao menos um mês',
      'Períodos devem ser diferentes em análise com variação'
    ]
  },
  INVALID_CONFIG: {
    titulo: 'Configuração inválida',
    mensagem: 'A configuração do widget está incorreta.',
    sugestoes: [
      'Verifique as configurações do widget',
      'Configure os URLs dos serviços REST',
      'Contate o administrador'
    ]
  },
  NETWORK_ERROR: {
    titulo: 'Erro de rede',
    mensagem: 'Erro ao comunicar com o servidor.',
    sugestoes: [
      'Verifique sua conexão com a internet',
      'Tente novamente em alguns instantes'
    ]
  },
  GEOMETRY_ERROR: {
    titulo: 'Erro de geometria',
    mensagem: 'Erro ao processar geometrias.',
    sugestoes: [
      'Verifique se o serviço geográfico está correto',
      'Contate o administrador'
    ]
  },
  CALCULATION_ERROR: {
    titulo: 'Erro de cálculo',
    mensagem: 'Erro ao calcular variações.',
    sugestoes: [
      'Verifique se os dados estão corretos',
      'Tente novamente'
    ]
  },
  AUTHENTICATION_ERROR: {
    titulo: 'Erro de autenticação',
    mensagem: 'Não foi possível autenticar no serviço.',
    sugestoes: [
      'Verifique suas credenciais',
      'Faça login novamente',
      'Contate o administrador'
    ]
  }
};

// ============================================================================
// RAMPAS DE CORES
// ============================================================================

export const COLOR_RAMPS = {
  'green-yellow-red': [
    [0, 128, 0, 255],      // Verde escuro
    [144, 238, 144, 255],  // Verde claro
    [255, 255, 0, 255],    // Amarelo
    [255, 165, 0, 255],    // Laranja
    [255, 0, 0, 255]       // Vermelho
  ],
  'blue-red': [
    [0, 0, 255, 255],      // Azul
    [135, 206, 250, 255],  // Azul claro
    [255, 255, 255, 255],  // Branco
    [255, 182, 193, 255],  // Vermelho claro
    [255, 0, 0, 255]       // Vermelho
  ],
  'spectral': [
    [158, 1, 66, 255],
    [213, 62, 79, 255],
    [244, 109, 67, 255],
    [253, 174, 97, 255],
    [254, 224, 139, 255],
    [230, 245, 152, 255],
    [171, 221, 164, 255],
    [102, 194, 165, 255],
    [50, 136, 189, 255],
    [94, 79, 162, 255]
  ]
};

// ============================================================================
// CONSTANTES
// ============================================================================

export const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

export const CLASSIFICATION_METHODS = [
  { value: 'natural-breaks', label: 'Natural Breaks (Jenks)' },
  { value: 'equal-interval', label: 'Intervalos Iguais' },
  { value: 'quantile', label: 'Quantil' }
];

export const LEGEND_POSITIONS = [
  { value: 'top-left', label: 'Superior Esquerda' },
  { value: 'top-right', label: 'Superior Direita' },
  { value: 'bottom-left', label: 'Inferior Esquerda' },
  { value: 'bottom-right', label: 'Inferior Direita' }
];

// ============================================================================
// VALIDAÇÃO
// ============================================================================

export const VALIDATION_RULES = {
  URL_REGEX: /^https?:\/\/.+/,
  MIN_CLASSES: 3,
  MAX_CLASSES: 10,
  MIN_TIMEOUT: 10,
  MAX_TIMEOUT: 120,
  MIN_CACHE_TIME: 60,
  MAX_CACHE_TIME: 3600,
  MIN_FEATURES: 100,
  MAX_FEATURES: 10000
};
