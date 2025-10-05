import { useState, useCallback } from 'react';
import { IAuthConfig, IAuthToken } from '../../types';

interface UseAuthReturn {
  authToken: IAuthToken | null;
  isGenerating: boolean;
  error: string | null;
  generateToken: (config: IAuthConfig) => Promise<IAuthToken | null>;
  isTokenValid: () => boolean;
}

/**
 * Hook para gerenciar autenticação com ArcGIS Server/Portal
 */
export const useAuth = (): UseAuthReturn => {
  const [authToken, setAuthToken] = useState<IAuthToken | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Gera token de autenticação
   */
  const generateToken = useCallback(async (config: IAuthConfig): Promise<IAuthToken | null> => {
    const { portalUrl, username, password, tokenExpiration = 60 } = config;

    if (!portalUrl || !username || !password) {
      const err = 'URL do Portal, usuário e senha são obrigatórios';
      setError(err);
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const tokenUrl = `${portalUrl}/generateToken`;
      const params = new URLSearchParams({
        username,
        password,
        f: 'json',
        referer: window.location.origin,
        expiration: String(tokenExpiration * 60)
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        body: params
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Erro ao gerar token');
      }

      if (!data.token) {
        throw new Error('Servidor não retornou token');
      }

      const tokenData: IAuthToken = {
        token: data.token,
        expires: data.expires || Date.now() + tokenExpiration * 60 * 1000,
        ssl: data.ssl || portalUrl.startsWith('https')
      };

      setAuthToken(tokenData);
      setIsGenerating(false);
      return tokenData;
    } catch (err) {
      console.error('[useAuth] Erro ao gerar token:', err);
      const errorMessage = err.message || 'Erro ao gerar token';
      setError(errorMessage);
      setIsGenerating(false);
      setAuthToken(null);
      return null;
    }
  }, []);

  /**
   * Verifica se o token está válido (não expirado)
   */
  const isTokenValid = useCallback((): boolean => {
    if (!authToken) return false;

    // Margem de 5 minutos
    const margin = 5 * 60 * 1000;
    return authToken.expires > Date.now() + margin;
  }, [authToken]);

  return {
    authToken,
    isGenerating,
    error,
    generateToken,
    isTokenValid
  };
};
