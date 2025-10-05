/**
 * Error Handling Utilities
 */

import { ErrorCodes, IErrorMessage } from '../../types';
import { ERROR_MESSAGES } from '../../config';

// ============================================================================
// CUSTOM ERROR CLASS
// ============================================================================

export class AnaliseVariacoesError extends Error {
  code: ErrorCodes;
  details?: any;

  constructor(code: ErrorCodes, message?: string, details?: any) {
    super(message || ERROR_MESSAGES[code]?.mensagem || 'Erro desconhecido');
    this.name = 'AnaliseVariacoesError';
    this.code = code;
    this.details = details;
  }
}

// ============================================================================
// ERROR DETECTION
// ============================================================================

export const isNetworkError = (error: any): boolean => {
  return (
    error.name === 'NetworkError' ||
    error.message?.includes('network') ||
    error.message?.includes('fetch') ||
    error.code === 'ECONNREFUSED'
  );
};

export const isAuthError = (error: any): boolean => {
  return (
    error.message?.includes('401') ||
    error.message?.includes('403') ||
    error.message?.includes('authentication') ||
    error.message?.includes('unauthorized')
  );
};

export const isTimeoutError = (error: any): boolean => {
  return (
    error.name === 'TimeoutError' ||
    error.message?.includes('timeout') ||
    error.code === 'ETIMEDOUT'
  );
};

export const isCorsError = (error: any): boolean => {
  return (
    error.message?.includes('CORS') ||
    error.message?.includes('cross-origin')
  );
};

// ============================================================================
// ERROR CLASSIFICATION
// ============================================================================

export const classifyError = (error: any): ErrorCodes => {
  if (isAuthError(error)) {
    return ErrorCodes.AUTHENTICATION_ERROR;
  }

  if (isNetworkError(error) || isTimeoutError(error) || isCorsError(error)) {
    return ErrorCodes.NETWORK_ERROR;
  }

  if (error instanceof AnaliseVariacoesError) {
    return error.code;
  }

  if (error.message?.includes('geometry')) {
    return ErrorCodes.GEOMETRY_ERROR;
  }

  if (error.message?.includes('calculation')) {
    return ErrorCodes.CALCULATION_ERROR;
  }

  if (error.message?.includes('config')) {
    return ErrorCodes.INVALID_CONFIG;
  }

  if (error.message?.includes('period')) {
    return ErrorCodes.INVALID_PERIOD;
  }

  if (error.message?.includes('no data') || error.message?.includes('0 features')) {
    return ErrorCodes.NO_DATA_FOUND;
  }

  // Default
  return ErrorCodes.NETWORK_ERROR;
};

// ============================================================================
// ERROR FORMATTING
// ============================================================================

export const getErrorMessage = (error: any): IErrorMessage => {
  const code = classifyError(error);
  const template = ERROR_MESSAGES[code];

  if (!template) {
    return {
      titulo: 'Erro',
      mensagem: error.message || 'Ocorreu um erro desconhecido',
      sugestoes: ['Tente novamente', 'Contate o administrador']
    };
  }

  return template;
};

export const formatErrorForDisplay = (error: any): string => {
  const errorMsg = getErrorMessage(error);
  return `${errorMsg.titulo}: ${errorMsg.mensagem}`;
};

export const formatErrorForLog = (error: any, context?: any): string => {
  const timestamp = new Date().toISOString();
  const code = classifyError(error);

  let logMessage = `[${timestamp}] ${code}: ${error.message || error}`;

  if (error.stack) {
    logMessage += `\nStack: ${error.stack}`;
  }

  if (context) {
    logMessage += `\nContext: ${JSON.stringify(context, null, 2)}`;
  }

  return logMessage;
};

// ============================================================================
// ERROR LOGGING
// ============================================================================

export const logError = (error: any, context?: any): void => {
  const formattedError = formatErrorForLog(error, context);
  console.error(formattedError);

  // Aqui você pode integrar com sistemas de logging externos
  // Exemplo: Sentry, Application Insights, etc.
  // if (window.Sentry) {
  //   window.Sentry.captureException(error, { extra: context });
  // }
};

export const logWarning = (message: string, context?: any): void => {
  const timestamp = new Date().toISOString();
  console.warn(`[${timestamp}] WARNING: ${message}`, context);
};

export const logInfo = (message: string, context?: any): void => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] INFO: ${message}`, context);
};

// ============================================================================
// ERROR HANDLING HELPERS
// ============================================================================

export const handleQueryError = (error: any): never => {
  const code = isNetworkError(error)
    ? ErrorCodes.NETWORK_ERROR
    : ErrorCodes.SERVICE_UNAVAILABLE;

  throw new AnaliseVariacoesError(code, error.message, error);
};

export const handleCalculationError = (error: any, details?: any): never => {
  throw new AnaliseVariacoesError(
    ErrorCodes.CALCULATION_ERROR,
    error.message,
    { originalError: error, ...details }
  );
};

export const handleGeometryError = (error: any): never => {
  throw new AnaliseVariacoesError(
    ErrorCodes.GEOMETRY_ERROR,
    error.message,
    error
  );
};

// ============================================================================
// VALIDATION ERROR HELPERS
// ============================================================================

export const throwIfInvalidPeriod = (isValid: boolean, message?: string): void => {
  if (!isValid) {
    throw new AnaliseVariacoesError(
      ErrorCodes.INVALID_PERIOD,
      message || 'Período inválido'
    );
  }
};

export const throwIfInvalidConfig = (isValid: boolean, message?: string): void => {
  if (!isValid) {
    throw new AnaliseVariacoesError(
      ErrorCodes.INVALID_CONFIG,
      message || 'Configuração inválida'
    );
  }
};

export const throwIfNoData = (hasData: boolean, message?: string): void => {
  if (!hasData) {
    throw new AnaliseVariacoesError(
      ErrorCodes.NO_DATA_FOUND,
      message || 'Nenhum dado encontrado'
    );
  }
};

// ============================================================================
// RETRY LOGIC
// ============================================================================

export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      logWarning(`Retry ${i + 1}/${maxRetries} failed`, { error });

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
};

// ============================================================================
// SAFE EXECUTION
// ============================================================================

export const safeExecute = async <T>(
  fn: () => Promise<T>,
  fallback?: T,
  onError?: (error: any) => void
): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (error) {
    logError(error);
    if (onError) {
      onError(error);
    }
    return fallback;
  }
};

export const safeExecuteSync = <T>(
  fn: () => T,
  fallback?: T,
  onError?: (error: any) => void
): T | undefined => {
  try {
    return fn();
  } catch (error) {
    logError(error);
    if (onError) {
      onError(error);
    }
    return fallback;
  }
};
