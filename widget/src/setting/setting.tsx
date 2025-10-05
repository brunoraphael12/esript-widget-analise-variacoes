/** @jsx jsx */
/** @jsxFrag React.Fragment */
import { React, jsx } from 'jimu-core';
import { AllWidgetSettingProps } from 'jimu-for-builder';
import { MapWidgetSelector, SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components';
import { IMConfig, IAuthConfig } from '../types';

// Hooks
import { useAuth } from '../runtime/hooks/useAuth';
import { useServiceMetadata } from './hooks/useServiceMetadata';

// Componentes
import { AuthenticationSection } from './components/AuthenticationSection';
import { VariablesSection } from './components/VariablesSection';
import { TextCustomizationSection } from './components/TextCustomizationSection';
import { AdvancedSettingsSection } from './components/AdvancedSettingsSection';

/**
 * Componente de configuração do widget
 * Refatorado para usar hooks e componentes separados
 */
export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>> {
  // Hooks são gerenciados internamente via composição
  private authHook = React.createRef<{
    authToken: any;
    isGenerating: boolean;
    error: string | null;
    generateToken: (config: IAuthConfig) => Promise<any>;
    isTokenValid: () => boolean;
  }>();

  private metadataHook = React.createRef<any>();

  // Estado local para gerenciar autenticação
  state = {
    testingAuth: false,
    authError: null as string | null,
    authSuccess: false,
    authToken: null as any
  };

  // ============================================================================
  // HANDLERS DE CONFIGURAÇÃO
  // ============================================================================

  onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds
    });
  };

  onVariavelChange = (index: number, field: string, value: any) => {
    const { config } = this.props;
    const variaveis = [...config.variaveis];

    variaveis[index] = {
      ...variaveis[index],
      [field]: value
    };

    this.props.onSettingChange({
      id: this.props.id,
      config: config.set('variaveis', variaveis)
    });
  };

  onTextoChange = (field: string, value: string) => {
    const { config } = this.props;
    const textos = {
      ...config.textos,
      [field]: value
    };

    this.props.onSettingChange({
      id: this.props.id,
      config: config.set('textos', textos)
    });
  };

  onConfiguracaoAvancadaChange = (field: string, value: any) => {
    const { config } = this.props;
    const configuracaoAvancada = {
      ...config.configuracaoAvancada,
      [field]: value
    };

    this.props.onSettingChange({
      id: this.props.id,
      config: config.set('configuracaoAvancada', configuracaoAvancada)
    });
  };

  onAutenticacaoChange = (field: string, value: any) => {
    const { config } = this.props;
    const autenticacao = {
      ...config.autenticacao,
      [field]: value
    };

    this.props.onSettingChange({
      id: this.props.id,
      config: config.set('autenticacao', autenticacao)
    });

    // Se desabilitou autenticação, limpar token
    if (field === 'enabled' && !value) {
      this.setState({
        authToken: null,
        authSuccess: false,
        authError: null
      });
    }
  };

  // ============================================================================
  // HANDLERS DE VARIÁVEIS
  // ============================================================================

  handleAdicionarVariavel = () => {
    const { config } = this.props;
    const variaveis = [...config.variaveis];

    const novoId = `variavel_${Date.now()}`;
    const novaVariavel = {
      id: novoId,
      nome: `Nova Variável ${variaveis.length + 1}`,
      tipo: 'linha' as 'linha',
      urlGeografico: '',
      urlAlfanumerico: '',
      codigoLigacao: '',
      codigoLigacaoAlfanumerico: '',
      campoEixo: '',
      campoValor: '',
      camposFiltro: [],
      camposFiltroAlias: {},
      tipoData: 'separados' as 'separados',
      campoAno: '',
      campoMes: '',
      campoData: '',
      servicosDisponiveis: []
    };

    variaveis.push(novaVariavel);

    this.props.onSettingChange({
      id: this.props.id,
      config: config.set('variaveis', variaveis)
    });

    console.log('[Setting] Nova variável adicionada:', novoId);
  };

  handleRemoverVariavel = (index: number) => {
    const { config } = this.props;
    const variaveis = [...config.variaveis];

    if (variaveis.length <= 1) {
      alert('Não é possível remover a última variável. Ao menos uma variável deve existir.');
      return;
    }

    const variavel = variaveis[index];
    const confirmar = window.confirm(
      `Tem certeza que deseja remover a variável "${variavel.nome}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmar) {
      return;
    }

    variaveis.splice(index, 1);

    this.props.onSettingChange({
      id: this.props.id,
      config: config.set('variaveis', variaveis)
    });

    console.log('[Setting] Variável removida:', variavel.nome);
  };

  // ============================================================================
  // HANDLERS DE AUTENTICAÇÃO
  // ============================================================================

  handleTestAuth = async () => {
    const { config } = this.props;

    if (!config.autenticacao) {
      this.setState({ authError: 'Configuração de autenticação não encontrada' });
      return;
    }

    const { portalUrl, username, password } = config.autenticacao;

    if (!portalUrl || !username || !password) {
      this.setState({ authError: 'Preencha URL do Portal, usuário e senha' });
      return;
    }

    this.setState({
      testingAuth: true,
      authError: null,
      authSuccess: false
    });

    try {
      const { tokenExpiration = 60 } = config.autenticacao;
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

      const token = {
        token: data.token,
        expires: data.expires || Date.now() + tokenExpiration * 60 * 1000,
        ssl: data.ssl || portalUrl.startsWith('https')
      };

      this.setState({
        authToken: token,
        testingAuth: false,
        authSuccess: true
      });

      console.log('[Setting] Token gerado com sucesso');
    } catch (error) {
      this.setState({
        testingAuth: false,
        authError: error.message || 'Erro ao autenticar',
        authToken: null
      });

      console.error('[Setting] Erro ao testar autenticação:', error);
    }
  };

  getValidToken = async (): Promise<string | null> => {
    const { config } = this.props;

    if (!config.autenticacao?.enabled) {
      return null;
    }

    const { authToken } = this.state;

    // Verificar se token é válido (margem de 5 minutos)
    if (authToken && authToken.expires > Date.now() + 5 * 60 * 1000) {
      return authToken.token;
    }

    // Gerar novo token
    try {
      await this.handleTestAuth();
      return this.state.authToken?.token || null;
    } catch (error) {
      console.error('[Setting] Erro ao obter token:', error);
      return null;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  render() {
    const { config, useMapWidgetIds } = this.props;
    const { testingAuth, authError, authSuccess, authToken } = this.state;

    return (
      <div
        className="widget-setting-analise-variacoes jimu-widget-setting"
        css={{
          height: '100%',
          padding: '20px',
          overflow: 'auto'
        }}
      >
        {/* Seleção do Widget de Mapa */}
        <SettingSection title="Widget de Mapa">
          <SettingRow>
            <div css={{ width: '100%' }}>
              <label css={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
                Selecione o widget de mapa
              </label>
              <MapWidgetSelector
                useMapWidgetIds={useMapWidgetIds}
                onSelect={this.onMapWidgetSelected}
              />
            </div>
          </SettingRow>
        </SettingSection>

        {/* Autenticação */}
        <AuthenticationSection
          autenticacao={config.autenticacao}
          authToken={authToken}
          testingAuth={testingAuth}
          authError={authError}
          authSuccess={authSuccess}
          onChange={this.onAutenticacaoChange}
          onTestAuth={this.handleTestAuth}
        />

        {/* Variáveis */}
        <SettingsFunctionalWrapper
          config={config}
          authToken={authToken}
          getValidToken={this.getValidToken}
          onVariavelChange={this.onVariavelChange}
          onAdicionarVariavel={this.handleAdicionarVariavel}
          onRemoverVariavel={this.handleRemoverVariavel}
        />

        {/* Textos */}
        <TextCustomizationSection
          textos={config.textos}
          onChange={this.onTextoChange}
        />

        {/* Configurações Avançadas */}
        <AdvancedSettingsSection
          configuracaoAvancada={config.configuracaoAvancada}
          onChange={this.onConfiguracaoAvancadaChange}
        />
      </div>
    );
  }
}

/**
 * Wrapper funcional para usar hooks no componente de classe
 */
const SettingsFunctionalWrapper: React.FC<{
  config: IMConfig;
  authToken: any;
  getValidToken: () => Promise<string | null>;
  onVariavelChange: (index: number, field: string, value: any) => void;
  onAdicionarVariavel: () => void;
  onRemoverVariavel: (index: number) => void;
}> = ({
  config,
  authToken,
  getValidToken,
  onVariavelChange,
  onAdicionarVariavel,
  onRemoverVariavel
}) => {
  // Usar hook de metadados
  const metadata = useServiceMetadata(authToken, getValidToken);

  return (
    <VariablesSection
      variaveis={config.variaveis}
      camposGeoDisponiveis={metadata.camposGeoDisponiveis}
      camposAlfaDisponiveis={metadata.camposAlfaDisponiveis}
      loadingCamposGeo={metadata.loadingCamposGeo}
      loadingCamposAlfa={metadata.loadingCamposAlfa}
      errorCamposGeo={metadata.errorCamposGeo}
      errorCamposAlfa={metadata.errorCamposAlfa}
      successCamposGeo={metadata.successCamposGeo}
      successCamposAlfa={metadata.successCamposAlfa}
      onVariavelChange={onVariavelChange}
      onAdicionarVariavel={onAdicionarVariavel}
      onRemoverVariavel={onRemoverVariavel}
      onFetchCamposGeo={(index) => {
        const variavel = config.variaveis[index];
        if (variavel?.urlGeografico) {
          metadata.fetchCamposGeograficos(index, variavel.urlGeografico);
        }
      }}
      onFetchCamposAlfa={(index) => {
        const variavel = config.variaveis[index];
        if (variavel?.urlAlfanumerico) {
          metadata.fetchCamposAlfanumericos(index, variavel.urlAlfanumerico);
        }
      }}
    />
  );
};
