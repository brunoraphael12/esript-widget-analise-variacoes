import { useCallback } from 'react';
import { ITemporalSelection, IFilterValues, AnalysisMethod } from '../../types';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface ValidationInputs {
  variavelSelecionada: string | null;
  metodoAnalise: AnalysisMethod;
  periodo1: ITemporalSelection;
  periodo2: ITemporalSelection;
  filtros: IFilterValues;
}

/**
 * Hook para validação de inputs do widget
 */
export const useValidation = () => {
  /**
   * Verifica se dois períodos são iguais
   */
  const periodosIguais = useCallback((p1: ITemporalSelection, p2: ITemporalSelection): boolean => {
    return p1.ano === p2.ano &&
           JSON.stringify(p1.meses.sort()) === JSON.stringify(p2.meses.sort());
  }, []);

  /**
   * Valida todos os inputs necessários para gerar análise
   */
  const validateInputs = useCallback((inputs: ValidationInputs): ValidationResult => {
    const errors: string[] = [];
    const { variavelSelecionada, metodoAnalise, periodo1, periodo2, filtros } = inputs;

    if (!variavelSelecionada) {
      errors.push('Selecione uma variável');
    }

    if (!periodo1.ano || periodo1.meses.length === 0) {
      errors.push('Selecione o período');
    }

    if (metodoAnalise === 'com-variacao') {
      if (!periodo2.ano || periodo2.meses.length === 0) {
        errors.push('Selecione o 2º período');
      }
      if (periodosIguais(periodo1, periodo2)) {
        errors.push('Os períodos devem ser diferentes');
      }
    }

    const temFiltrosSelecionados = Object.values(filtros).some(arr => arr && arr.length > 0);
    if (!temFiltrosSelecionados) {
      errors.push('Selecione ao menos um filtro');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }, [periodosIguais]);

  /**
   * Verifica se o botão de gerar mapa deve estar habilitado
   */
  const isBotaoHabilitado = useCallback((inputs: ValidationInputs): boolean => {
    const { variavelSelecionada, metodoAnalise, periodo1, periodo2, filtros } = inputs;

    const temFiltrosSelecionados = Object.values(filtros).some(arr => arr && arr.length > 0);

    return !!(
      variavelSelecionada &&
      periodo1.ano &&
      periodo1.meses.length > 0 &&
      (metodoAnalise === 'sem-variacao' || (
        periodo2.ano &&
        periodo2.meses.length > 0 &&
        !periodosIguais(periodo1, periodo2)
      )) &&
      temFiltrosSelecionados
    );
  }, [periodosIguais]);

  return {
    validateInputs,
    isBotaoHabilitado,
    periodosIguais
  };
};
