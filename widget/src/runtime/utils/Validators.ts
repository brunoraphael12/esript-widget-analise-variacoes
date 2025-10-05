/**
 * Funções de Validação
 */

import { ITemporalSelection, IAnalysisConfig, IVariableConfig } from '../../types';
import { VALIDATION_RULES } from '../../config';

// ============================================================================
// VALIDAÇÃO DE URL
// ============================================================================

export const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return false;
  return VALIDATION_RULES.URL_REGEX.test(url);
};

export const isHttpsUrl = (url: string): boolean => {
  return url.startsWith('https://');
};

// ============================================================================
// VALIDAÇÃO DE PERÍODO TEMPORAL
// ============================================================================

export const isValidPeriodo = (periodo: ITemporalSelection): boolean => {
  return periodo.ano !== null && periodo.meses.length > 0;
};

export const periodosIguais = (p1: ITemporalSelection, p2: ITemporalSelection): boolean => {
  if (p1.ano !== p2.ano) return false;

  const meses1 = [...p1.meses].sort();
  const meses2 = [...p2.meses].sort();

  return JSON.stringify(meses1) === JSON.stringify(meses2);
};

// ============================================================================
// VALIDAÇÃO DE VARIÁVEL
// ============================================================================

export const isValidVariavel = (variavel: IVariableConfig): boolean => {
  return !!(
    variavel.id &&
    variavel.nome &&
    variavel.tipo &&
    variavel.urlGeografico &&
    variavel.urlAlfanumerico &&
    variavel.codigoLigacao &&
    variavel.campoValor
  );
};

export const hasValidUrls = (variavel: IVariableConfig): boolean => {
  return isValidUrl(variavel.urlGeografico) && isValidUrl(variavel.urlAlfanumerico);
};

// ============================================================================
// VALIDAÇÃO DE CONFIGURAÇÃO DE ANÁLISE
// ============================================================================

export interface IValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateAnalysisConfig = (config: IAnalysisConfig): IValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar variável
  if (!config.variavel) {
    errors.push('Variável não selecionada');
  } else {
    if (!isValidVariavel(config.variavel)) {
      errors.push('Configuração da variável inválida');
    }
    if (!hasValidUrls(config.variavel)) {
      errors.push('URLs da variável inválidos');
    }
  }

  // Validar período 1
  if (!isValidPeriodo(config.periodo1)) {
    errors.push('Período 1 inválido');
  }

  // Validar período 2 (se método com variação)
  if (config.metodo === 'com-variacao') {
    if (!config.periodo2) {
      errors.push('Período 2 não definido');
    } else {
      if (!isValidPeriodo(config.periodo2)) {
        errors.push('Período 2 inválido');
      }
      if (periodosIguais(config.periodo1, config.periodo2)) {
        errors.push('Os períodos devem ser diferentes');
      }
    }
  }

  // Validar filtros
  if (!config.filtros.servico || config.filtros.servico.length === 0) {
    errors.push('Nenhum serviço selecionado');
  }

  // Warnings
  if (config.filtros.eixo && config.filtros.eixo.length === 0) {
    warnings.push('Nenhum eixo selecionado (serão considerados todos)');
  }

  if (config.periodo1.meses.length === 12) {
    warnings.push('Análise anual selecionada (todos os meses)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

// ============================================================================
// VALIDAÇÃO DE NÚMEROS
// ============================================================================

export const isValidNumber = (value: any): boolean => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

// ============================================================================
// VALIDAÇÃO DE SIMBOLIZAÇÃO
// ============================================================================

export const isValidNumClasses = (numClasses: number): boolean => {
  return isValidNumber(numClasses) &&
         isInRange(numClasses, VALIDATION_RULES.MIN_CLASSES, VALIDATION_RULES.MAX_CLASSES);
};

export const isValidColor = (color: number[]): boolean => {
  if (!Array.isArray(color) || color.length !== 4) return false;
  return color.every(c => isValidNumber(c) && isInRange(c, 0, 255));
};

// ============================================================================
// SANITIZAÇÃO
// ============================================================================

export const sanitizeString = (str: string): string => {
  return str
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/['"]/g, '')  // Remove aspas
    .trim();
};

export const sanitizeFieldName = (field: string): string => {
  return field
    .replace(/[^a-zA-Z0-9_]/g, '') // Apenas alfanuméricos e underscore
    .toUpperCase();
};

// ============================================================================
// HELPERS
// ============================================================================

export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return '• ' + errors.join('\n• ');
};

export const hasErrors = (validation: IValidationResult): boolean => {
  return !validation.valid || validation.errors.length > 0;
};

export const hasWarnings = (validation: IValidationResult): boolean => {
  return validation.warnings.length > 0;
};
