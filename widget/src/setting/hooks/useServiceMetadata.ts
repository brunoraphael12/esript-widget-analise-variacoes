import { useState, useCallback } from 'react';
import { IFieldInfo, IAuthToken } from '../../types';

interface MetadataState {
  [variableIndex: number]: IFieldInfo[];
}

interface LoadingState {
  [variableIndex: number]: boolean;
}

interface ErrorState {
  [variableIndex: number]: string | null;
}

interface UseServiceMetadataReturn {
  camposGeoDisponiveis: MetadataState;
  camposAlfaDisponiveis: MetadataState;
  loadingCamposGeo: LoadingState;
  loadingCamposAlfa: LoadingState;
  errorCamposGeo: ErrorState;
  errorCamposAlfa: ErrorState;
  successCamposGeo: { [key: number]: boolean };
  successCamposAlfa: { [key: number]: boolean };
  fetchCamposGeograficos: (index: number, url: string) => Promise<void>;
  fetchCamposAlfanumericos: (index: number, url: string) => Promise<void>;
  clearVariableMetadata: (index: number) => void;
}

/**
 * Hook para gerenciar fetch de metadados de serviços REST
 */
export const useServiceMetadata = (
  authToken: IAuthToken | null,
  getValidToken: () => Promise<string | null>
): UseServiceMetadataReturn => {
  const [camposGeoDisponiveis, setCamposGeoDisponiveis] = useState<MetadataState>({});
  const [camposAlfaDisponiveis, setCamposAlfaDisponiveis] = useState<MetadataState>({});
  const [loadingCamposGeo, setLoadingCamposGeo] = useState<LoadingState>({});
  const [loadingCamposAlfa, setLoadingCamposAlfa] = useState<LoadingState>({});
  const [errorCamposGeo, setErrorCamposGeo] = useState<ErrorState>({});
  const [errorCamposAlfa, setErrorCamposAlfa] = useState<ErrorState>({});
  const [successCamposGeo, setSuccessCamposGeo] = useState<{ [key: number]: boolean }>({});
  const [successCamposAlfa, setSuccessCamposAlfa] = useState<{ [key: number]: boolean }>({});

  /**
   * Busca metadados de um serviço REST
   */
  const fetchServiceMetadata = useCallback(async (url: string): Promise<IFieldInfo[]> => {
    if (!url || url.trim() === '') {
      throw new Error('URL vazia');
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('URL deve começar com http:// ou https://');
    }

    // Obter token se disponível
    const token = await getValidToken();

    // Construir URL com parâmetros
    let metadataUrl = url.includes('?') ? `${url}&f=json` : `${url}?f=json`;

    if (token) {
      metadataUrl += `&token=${token}`;
    }

    try {
      const response = await fetch(metadataUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        if (data.error.code === 498 || data.error.code === 499) {
          throw new Error('Token inválido ou expirado. Clique em "Testar Autenticação" novamente.');
        }
        throw new Error(data.error.message || 'Erro ao acessar serviço');
      }

      if (!data.fields || !Array.isArray(data.fields)) {
        throw new Error('Serviço não retornou campos (fields)');
      }

      return data.fields as IFieldInfo[];
    } catch (error) {
      console.error('[useServiceMetadata] Erro ao buscar metadados:', error);

      if (error.message.includes('Failed to fetch')) {
        throw new Error('Não foi possível conectar ao serviço. Verifique CORS.');
      }

      throw error;
    }
  }, [getValidToken]);

  /**
   * Busca campos do serviço geográfico
   */
  const fetchCamposGeograficos = useCallback(async (index: number, url: string) => {
    if (!url) return;

    setLoadingCamposGeo(prev => ({ ...prev, [index]: true }));
    setErrorCamposGeo(prev => ({ ...prev, [index]: null }));
    setSuccessCamposGeo(prev => ({ ...prev, [index]: false }));

    try {
      const fields = await fetchServiceMetadata(url);

      setCamposGeoDisponiveis(prev => ({ ...prev, [index]: fields }));
      setLoadingCamposGeo(prev => ({ ...prev, [index]: false }));
      setSuccessCamposGeo(prev => ({ ...prev, [index]: true }));

      console.log(`[useServiceMetadata] ${fields.length} campos geográficos carregados`);
    } catch (error) {
      setLoadingCamposGeo(prev => ({ ...prev, [index]: false }));
      setErrorCamposGeo(prev => ({ ...prev, [index]: error.message || 'Erro ao acessar serviço' }));
      setCamposGeoDisponiveis(prev => ({ ...prev, [index]: [] }));
    }
  }, [fetchServiceMetadata]);

  /**
   * Busca campos do serviço alfanumérico
   */
  const fetchCamposAlfanumericos = useCallback(async (index: number, url: string) => {
    if (!url) return;

    setLoadingCamposAlfa(prev => ({ ...prev, [index]: true }));
    setErrorCamposAlfa(prev => ({ ...prev, [index]: null }));
    setSuccessCamposAlfa(prev => ({ ...prev, [index]: false }));

    try {
      const fields = await fetchServiceMetadata(url);

      setCamposAlfaDisponiveis(prev => ({ ...prev, [index]: fields }));
      setLoadingCamposAlfa(prev => ({ ...prev, [index]: false }));
      setSuccessCamposAlfa(prev => ({ ...prev, [index]: true }));

      console.log(`[useServiceMetadata] ${fields.length} campos alfanuméricos carregados`);
    } catch (error) {
      setLoadingCamposAlfa(prev => ({ ...prev, [index]: false }));
      setErrorCamposAlfa(prev => ({ ...prev, [index]: error.message || 'Erro ao acessar serviço' }));
      setCamposAlfaDisponiveis(prev => ({ ...prev, [index]: [] }));
    }
  }, [fetchServiceMetadata]);

  /**
   * Limpa metadados de uma variável
   */
  const clearVariableMetadata = useCallback((index: number) => {
    setCamposGeoDisponiveis(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
    setCamposAlfaDisponiveis(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
    setLoadingCamposGeo(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
    setLoadingCamposAlfa(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
    setErrorCamposGeo(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
    setErrorCamposAlfa(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
    setSuccessCamposGeo(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
    setSuccessCamposAlfa(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  }, []);

  return {
    camposGeoDisponiveis,
    camposAlfaDisponiveis,
    loadingCamposGeo,
    loadingCamposAlfa,
    errorCamposGeo,
    errorCamposAlfa,
    successCamposGeo,
    successCamposAlfa,
    fetchCamposGeograficos,
    fetchCamposAlfanumericos,
    clearVariableMetadata
  };
};
