/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { AllWidgetSettingProps } from 'jimu-for-builder';
import {
  MapWidgetSelector,
  SettingSection,
  SettingRow
} from 'jimu-ui/advanced/setting-components';
import {
  TextInput,
  Checkbox,
  NumericInput,
  Switch,
  Select,
  Option,
  Button,
  Icon,
  Loading
} from 'jimu-ui';
import { IMConfig, IFieldInfo, ISettingState, IAuthToken, IAuthConfig } from '../types';

export default class Setting extends React.PureComponent<
  AllWidgetSettingProps<IMConfig>,
  ISettingState
> {
  // ============================================================================
  // STATE
  // ============================================================================

  state: ISettingState = {
    camposGeoDisponiveis: {},
    camposAlfaDisponiveis: {},
    loadingCamposGeo: {},
    loadingCamposAlfa: {},
    errorCamposGeo: {},
    errorCamposAlfa: {},
    successCamposGeo: {},
    successCamposAlfa: {},
    authToken: null,
    testingAuth: false,
    authError: null,
    authSuccess: false
  };

  // ============================================================================
  // MÉTODOS DE AUTENTICAÇÃO
  // ============================================================================

  /**
   * Gera token de autenticação no ArcGIS Server/Portal
   */
  generateToken = async (authConfig: IAuthConfig): Promise<IAuthToken> => {
    const { portalUrl, username, password, tokenExpiration = 60 } = authConfig;

    if (!portalUrl || !username || !password) {
      throw new Error('URL do Portal, usuário e senha são obrigatórios');
    }

    // URL do endpoint de geração de token
    const tokenUrl = `${portalUrl}/generateToken`;

    // Parâmetros do POST
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    params.append('client', 'referer');
    params.append('referer', window.location.origin);
    params.append('expiration', String(tokenExpiration)); // minutos
    params.append('f', 'json');

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Verificar se retornou erro
      if (data.error) {
        throw new Error(data.error.message || 'Erro ao gerar token');
      }

      // Verificar se retornou token
      if (!data.token) {
        throw new Error('Servidor não retornou token');
      }

      // Calcular timestamp de expiração
      const expiresTimestamp = data.expires || Date.now() + tokenExpiration * 60 * 1000;

      return {
        token: data.token,
        expires: expiresTimestamp,
        ssl: data.ssl || portalUrl.startsWith('https')
      };
    } catch (error) {
      console.error('[Setting] Erro ao gerar token:', error);

      // Mensagens de erro específicas
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Não foi possível conectar ao Portal. Verifique a URL.');
      }

      if (error.message.includes('Invalid username or password')) {
        throw new Error('Usuário ou senha inválidos');
      }

      throw error;
    }
  };

  /**
   * Testa autenticação
   */
  handleTestAuth = async () => {
    const { config } = this.props;

    if (!config.autenticacao) {
      this.setState({
        authError: 'Configuração de autenticação não encontrada'
      });
      return;
    }

    const { portalUrl, username, password } = config.autenticacao;

    if (!portalUrl || !username || !password) {
      this.setState({
        authError: 'Preencha URL do Portal, usuário e senha'
      });
      return;
    }

    // Iniciar loading
    this.setState({
      testingAuth: true,
      authError: null,
      authSuccess: false
    });

    try {
      const token = await this.generateToken(config.autenticacao);

      this.setState({
        authToken: token,
        testingAuth: false,
        authSuccess: true
      });

      console.log('[Setting] Token gerado com sucesso. Expira em:', new Date(token.expires));
    } catch (error) {
      this.setState({
        testingAuth: false,
        authError: error.message || 'Erro ao autenticar',
        authToken: null
      });

      console.error('[Setting] Erro ao testar autenticação:', error);
    }
  };

  /**
   * Verifica se o token está válido (não expirado)
   */
  isTokenValid = (): boolean => {
    const { authToken } = this.state;

    if (!authToken) {
      return false;
    }

    // Verificar se não expirou (com margem de 5 minutos)
    const now = Date.now();
    const margin = 5 * 60 * 1000; // 5 minutos

    return authToken.expires > now + margin;
  };

  /**
   * Obtém token válido (gera novo se necessário)
   */
  getValidToken = async (): Promise<string | null> => {
    const { config } = this.props;

    // Se autenticação não está habilitada, retornar null
    if (!config.autenticacao?.enabled) {
      return null;
    }

    // Se já tem token válido, retornar
    if (this.isTokenValid()) {
      return this.state.authToken!.token;
    }

    // Caso contrário, gerar novo token
    try {
      const token = await this.generateToken(config.autenticacao);
      this.setState({ authToken: token });
      return token.token;
    } catch (error) {
      console.error('[Setting] Erro ao obter token:', error);
      return null;
    }
  };

  // ============================================================================
  // MÉTODOS DE QUERY REST
  // ============================================================================

  /**
   * Busca metadados de um serviço REST (fields)
   * MODIFICADO: Agora suporta autenticação com token
   */
  fetchServiceMetadata = async (url: string): Promise<IFieldInfo[]> => {
    if (!url || url.trim() === '') {
      throw new Error('URL vazia');
    }

    // Validar formato básico de URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('URL deve começar com http:// ou https://');
    }

    // Obter token se autenticação estiver habilitada
    const token = await this.getValidToken();

    // Construir URL com parâmetros
    let metadataUrl = url.includes('?')
      ? `${url}&f=json`
      : `${url}?f=json`;

    // Adicionar token se disponível
    if (token) {
      metadataUrl += `&token=${token}`;
    }

    try {
      const response = await fetch(metadataUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Verificar se retornou erro da API REST
      if (data.error) {
        // Se erro é de autenticação, limpar token e sugerir novo login
        if (data.error.code === 498 || data.error.code === 499) {
          this.setState({ authToken: null });
          throw new Error('Token inválido ou expirado. Clique em "Testar Autenticação" novamente.');
        }

        throw new Error(data.error.message || 'Erro ao acessar serviço');
      }

      // Verificar se tem fields
      if (!data.fields || !Array.isArray(data.fields)) {
        throw new Error('Serviço não retornou campos (fields)');
      }

      return data.fields as IFieldInfo[];
    } catch (error) {
      console.error('[Setting] Erro ao buscar metadados:', error);

      // Mensagens de erro específicas
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Não foi possível conectar ao serviço. Verifique CORS.');
      }

      throw error;
    }
  };

  /**
   * Handler para buscar campos do serviço geográfico
   */
  handleFetchCamposGeograficos = async (index: number) => {
    const { config } = this.props;
    const variavel = config.variaveis[index];

    if (!variavel.urlGeografico) {
      return;
    }

    // Iniciar loading
    this.setState({
      loadingCamposGeo: {
        ...this.state.loadingCamposGeo,
        [index]: true
      },
      errorCamposGeo: {
        ...this.state.errorCamposGeo,
        [index]: null
      },
      successCamposGeo: {
        ...this.state.successCamposGeo,
        [index]: false
      }
    });

    try {
      const fields = await this.fetchServiceMetadata(variavel.urlGeografico);

      this.setState({
        camposGeoDisponiveis: {
          ...this.state.camposGeoDisponiveis,
          [index]: fields
        },
        loadingCamposGeo: {
          ...this.state.loadingCamposGeo,
          [index]: false
        },
        successCamposGeo: {
          ...this.state.successCamposGeo,
          [index]: true
        }
      });

      console.log(`[Setting] ${fields.length} campos carregados do serviço geográfico`);
      console.log('[Setting] Campos:', fields.map(f => `${f.name} (${f.type})`).join(', '));
    } catch (error) {
      this.setState({
        loadingCamposGeo: {
          ...this.state.loadingCamposGeo,
          [index]: false
        },
        errorCamposGeo: {
          ...this.state.errorCamposGeo,
          [index]: error.message || 'Erro ao acessar serviço'
        },
        camposGeoDisponiveis: {
          ...this.state.camposGeoDisponiveis,
          [index]: []
        }
      });

      console.error('[Setting] Erro ao carregar campos geográficos:', error);
    }
  };

  /**
   * Handler para buscar campos do serviço alfanumérico
   */
  handleFetchCamposAlfanumericos = async (index: number) => {
    const { config } = this.props;
    const variavel = config.variaveis[index];

    if (!variavel.urlAlfanumerico) {
      return;
    }

    // Iniciar loading
    this.setState({
      loadingCamposAlfa: {
        ...this.state.loadingCamposAlfa,
        [index]: true
      },
      errorCamposAlfa: {
        ...this.state.errorCamposAlfa,
        [index]: null
      },
      successCamposAlfa: {
        ...this.state.successCamposAlfa,
        [index]: false
      }
    });

    try {
      const fields = await this.fetchServiceMetadata(variavel.urlAlfanumerico);

      this.setState({
        camposAlfaDisponiveis: {
          ...this.state.camposAlfaDisponiveis,
          [index]: fields
        },
        loadingCamposAlfa: {
          ...this.state.loadingCamposAlfa,
          [index]: false
        },
        successCamposAlfa: {
          ...this.state.successCamposAlfa,
          [index]: true
        }
      });

      console.log(`[Setting] ${fields.length} campos carregados do serviço alfanumérico`);
      console.log('[Setting] Campos:', fields.map(f => `${f.name} (${f.type})`).join(', '));

      // Debug: mostrar quantos campos numéricos foram encontrados
      const numericFields = fields.filter(f =>
        f.type === 'esriFieldTypeInteger' ||
        f.type === 'esriFieldTypeDouble' ||
        f.type === 'esriFieldTypeSmallInteger' ||
        f.type === 'esriFieldTypeSingle'
      );
      console.log(`[Setting] ${numericFields.length} campos numéricos encontrados:`, numericFields.map(f => `${f.name} (${f.type})`).join(', '));
    } catch (error) {
      this.setState({
        loadingCamposAlfa: {
          ...this.state.loadingCamposAlfa,
          [index]: false
        },
        errorCamposAlfa: {
          ...this.state.errorCamposAlfa,
          [index]: error.message || 'Erro ao acessar serviço'
        },
        camposAlfaDisponiveis: {
          ...this.state.camposAlfaDisponiveis,
          [index]: []
        }
      });

      console.error('[Setting] Erro ao carregar campos alfanuméricos:', error);
    }
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

    console.log(`[Setting] onVariavelChange - field: ${field}, value:`, value);

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
  // MÉTODOS DE GESTÃO DE VARIÁVEIS
  // ============================================================================

  /**
   * Adiciona uma nova variável à configuração
   */
  handleAdicionarVariavel = () => {
    const { config } = this.props;
    const variaveis = [...config.variaveis];

    // Gerar ID único baseado em timestamp
    const novoId = `variavel_${Date.now()}`;

    // Nova variável com valores padrão
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

  /**
   * Remove uma variável da configuração
   */
  handleRemoverVariavel = (index: number) => {
    const { config } = this.props;
    const variaveis = [...config.variaveis];

    // Não permitir remover se só tem 1 variável
    if (variaveis.length <= 1) {
      alert('Não é possível remover a última variável. Ao menos uma variável deve existir.');
      return;
    }

    // Confirmar remoção
    const variavel = variaveis[index];
    const confirmar = window.confirm(
      `Tem certeza que deseja remover a variável "${variavel.nome}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmar) {
      return;
    }

    // Remover variável
    variaveis.splice(index, 1);

    this.props.onSettingChange({
      id: this.props.id,
      config: config.set('variaveis', variaveis)
    });

    // Limpar campos carregados desta variável
    const newCamposGeoDisponiveis = { ...this.state.camposGeoDisponiveis };
    const newCamposAlfaDisponiveis = { ...this.state.camposAlfaDisponiveis };
    const newLoadingCamposGeo = { ...this.state.loadingCamposGeo };
    const newLoadingCamposAlfa = { ...this.state.loadingCamposAlfa };
    const newErrorCamposGeo = { ...this.state.errorCamposGeo };
    const newErrorCamposAlfa = { ...this.state.errorCamposAlfa };
    const newSuccessCamposGeo = { ...this.state.successCamposGeo };
    const newSuccessCamposAlfa = { ...this.state.successCamposAlfa };

    delete newCamposGeoDisponiveis[index];
    delete newCamposAlfaDisponiveis[index];
    delete newLoadingCamposGeo[index];
    delete newLoadingCamposAlfa[index];
    delete newErrorCamposGeo[index];
    delete newErrorCamposAlfa[index];
    delete newSuccessCamposGeo[index];
    delete newSuccessCamposAlfa[index];

    this.setState({
      camposGeoDisponiveis: newCamposGeoDisponiveis,
      camposAlfaDisponiveis: newCamposAlfaDisponiveis,
      loadingCamposGeo: newLoadingCamposGeo,
      loadingCamposAlfa: newLoadingCamposAlfa,
      errorCamposGeo: newErrorCamposGeo,
      errorCamposAlfa: newErrorCamposAlfa,
      successCamposGeo: newSuccessCamposGeo,
      successCamposAlfa: newSuccessCamposAlfa
    });

    console.log('[Setting] Variável removida:', variavel.nome);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  render() {
    const { config, useMapWidgetIds } = this.props;

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
        <SettingSection title="Autenticação">
          <div css={{ padding: '12px 16px' }}>
            <p css={{ fontSize: '12px', color: '#6c757d', marginBottom: '16px' }}>
              Configure autenticação caso os serviços REST exijam login
            </p>

            {/* Habilitar Autenticação */}
            <div css={{
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <label css={{ fontSize: '13px', fontWeight: 500, display: 'block' }}>
                  Habilitar Autenticação
                </label>
                <small css={{ fontSize: '11px', color: '#6c757d' }}>
                  Gera token para acessar serviços protegidos
                </small>
              </div>
              <Switch
                checked={config.autenticacao?.enabled || false}
                onChange={(evt) => this.onAutenticacaoChange('enabled', evt.target.checked)}
              />
            </div>

            {/* Campos de autenticação (só aparecem se habilitado) */}
            {config.autenticacao?.enabled && (
              <>
                {/* URL do Portal */}
                <div css={{ marginBottom: '12px' }}>
                  <label css={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    URL do Portal/Server
                  </label>
                  <TextInput
                    value={config.autenticacao.portalUrl}
                    placeholder="https://servidor/arcgis/sharing/rest"
                    onChange={(e) => this.onAutenticacaoChange('portalUrl', e.target.value)}
                    css={{ width: '100%' }}
                  />
                  <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
                    URL base do ArcGIS Server ou Portal (sem /generateToken)
                  </small>
                </div>

                {/* Usuário */}
                <div css={{ marginBottom: '12px' }}>
                  <label css={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    Usuário
                  </label>
                  <TextInput
                    value={config.autenticacao.username}
                    placeholder="usuario"
                    onChange={(e) => this.onAutenticacaoChange('username', e.target.value)}
                    css={{ width: '100%' }}
                  />
                </div>

                {/* Senha */}
                <div css={{ marginBottom: '12px' }}>
                  <label css={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    Senha
                  </label>
                  <TextInput
                    type="password"
                    value={config.autenticacao.password}
                    placeholder="••••••••"
                    onChange={(e) => this.onAutenticacaoChange('password', e.target.value)}
                    css={{ width: '100%' }}
                  />
                  <small css={{ fontSize: '11px', color: '#dc3545', display: 'block', marginTop: '4px' }}>
                    ⚠️ A senha é armazenada em texto simples na configuração
                  </small>
                </div>

                {/* Expiração do Token */}
                <div css={{ marginBottom: '16px' }}>
                  <label css={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    Expiração do Token (minutos)
                  </label>
                  <NumericInput
                    value={config.autenticacao.tokenExpiration || 60}
                    onChange={(value) => this.onAutenticacaoChange('tokenExpiration', value)}
                    min={15}
                    max={1440}
                    css={{ width: '100%' }}
                  />
                  <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
                    Padrão: 60 minutos
                  </small>
                </div>

                {/* Botão Testar Autenticação */}
                <div css={{ marginBottom: '12px' }}>
                  <Button
                    type="primary"
                    disabled={
                      !config.autenticacao.portalUrl ||
                      !config.autenticacao.username ||
                      !config.autenticacao.password ||
                      this.state.testingAuth
                    }
                    onClick={this.handleTestAuth}
                    css={{ width: '100%' }}
                  >
                    {this.state.testingAuth ? (
                      <>
                        <Loading size="sm" css={{ marginRight: '8px' }} />
                        Testando Autenticação...
                      </>
                    ) : this.state.authSuccess ? (
                      <>✓ Testar Autenticação</>
                    ) : (
                      'Testar Autenticação'
                    )}
                  </Button>
                </div>

                {/* Mensagens de feedback */}
                {this.state.authError && (
                  <div css={{
                    padding: '8px 12px',
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px',
                    marginBottom: '12px'
                  }}>
                    <small css={{ fontSize: '11px', color: '#721c24' }}>
                      ⚠️ {this.state.authError}
                    </small>
                  </div>
                )}

                {this.state.authSuccess && !this.state.authError && (
                  <div css={{
                    padding: '8px 12px',
                    backgroundColor: '#d4edda',
                    border: '1px solid #c3e6cb',
                    borderRadius: '4px',
                    marginBottom: '12px'
                  }}>
                    <small css={{ fontSize: '11px', color: '#155724' }}>
                      ✓ Autenticação bem-sucedida! Token válido até{' '}
                      {this.state.authToken && new Date(this.state.authToken.expires).toLocaleString()}
                    </small>
                  </div>
                )}
              </>
            )}
          </div>
        </SettingSection>

        {/* Configuração de Variáveis */}
        <SettingSection title="Variáveis">
          <div css={{ padding: '8px 12px' }}>
            <p css={{ fontSize: '11px', color: '#6c757d', marginBottom: '8px' }}>
              Configure as variáveis de análise
            </p>
            <Button
              type="primary"
              size="sm"
              onClick={this.handleAdicionarVariavel}
              css={{ width: '100%', marginBottom: '12px' }}
            >
              + Adicionar Variável
            </Button>

            {config.variaveis.map((variavel, index) => (
              <div
                key={variavel.id}
                css={{
                  marginBottom: '24px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #dee2e6'
                }}
              >
                {/* Cabeçalho com nome e botão remover */}
                <div css={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <h6 css={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#212529'
                  }}>
                    {variavel.nome || `Variável ${index + 1}`}
                  </h6>
                  <Button
                    type="danger"
                    size="sm"
                    onClick={() => this.handleRemoverVariavel(index)}
                    disabled={config.variaveis.length <= 1}
                    title={config.variaveis.length <= 1 ? 'Não é possível remover a última variável' : 'Remover variável'}
                    css={{ width: '100%' }}
                  >
                    🗑️ Remover Variável
                  </Button>
                </div>

                {/* Nome */}
                <div css={{ marginBottom: '12px' }}>
                  <label css={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    Nome
                  </label>
                  <TextInput
                    value={variavel.nome}
                    placeholder="Ex: Oferta, Procura, Paragens..."
                    onChange={(e) => this.onVariavelChange(index, 'nome', e.target.value)}
                    css={{ width: '100%' }}
                  />
                </div>

                {/* Tipo de Geometria */}
                <div css={{ marginBottom: '12px' }}>
                  <label css={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    Tipo de Geometria
                  </label>
                  <Select
                    value={variavel.tipo}
                    onChange={(e) => this.onVariavelChange(index, 'tipo', e.target.value)}
                    css={{ width: '100%' }}
                  >
                    <Option value="ponto">Ponto</Option>
                    <Option value="linha">Linha</Option>
                    <Option value="poligono">Polígono</Option>
                  </Select>
                  <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
                    Tipo de geometria da camada geográfica
                  </small>
                </div>

                {/* URL Geográfico */}
                <div css={{ marginBottom: '12px' }}>
                  <label css={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    URL Geográfico
                  </label>
                  <TextInput
                    value={variavel.urlGeografico}
                    placeholder="https://servidor/rest/.../FeatureServer/0"
                    onChange={(e) => this.onVariavelChange(index, 'urlGeografico', e.target.value)}
                    css={{ width: '100%', marginBottom: '6px' }}
                  />
                  <Button
                    size="sm"
                    type="tertiary"
                    disabled={!variavel.urlGeografico || this.state.loadingCamposGeo[index]}
                    onClick={() => this.handleFetchCamposGeograficos(index)}
                    css={{ width: '100%' }}
                  >
                    {this.state.loadingCamposGeo[index] ? (
                      <>
                        <Loading size="sm" css={{ marginRight: '4px' }} />
                        Testando Conexão...
                      </>
                    ) : this.state.successCamposGeo[index] ? (
                      <>✓ Testar Conexão</>
                    ) : (
                      'Testar Conexão'
                    )}
                  </Button>
                  {this.state.errorCamposGeo[index] && (
                    <small css={{ fontSize: '11px', color: '#dc3545', display: 'block', marginTop: '4px' }}>
                      ⚠️ {this.state.errorCamposGeo[index]}
                    </small>
                  )}
                  {this.state.successCamposGeo[index] && !this.state.errorCamposGeo[index] && (
                    <small css={{ fontSize: '11px', color: '#28a745', display: 'block', marginTop: '4px' }}>
                      ✓ {this.state.camposGeoDisponiveis[index]?.length || 0} campos carregados
                    </small>
                  )}
                  <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
                    Feature Layer com geometrias
                  </small>
                </div>

                {/* URL Alfanumérico */}
                <div css={{ marginBottom: '12px' }}>
                  <label css={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    URL Alfanumérico
                  </label>
                  <TextInput
                    value={variavel.urlAlfanumerico}
                    placeholder="https://servidor/rest/.../MapServer/0"
                    onChange={(e) => this.onVariavelChange(index, 'urlAlfanumerico', e.target.value)}
                    css={{ width: '100%', marginBottom: '6px' }}
                  />
                  <Button
                    size="sm"
                    type="tertiary"
                    disabled={!variavel.urlAlfanumerico || this.state.loadingCamposAlfa[index]}
                    onClick={() => this.handleFetchCamposAlfanumericos(index)}
                    css={{ width: '100%' }}
                  >
                    {this.state.loadingCamposAlfa[index] ? (
                      <>
                        <Loading size="sm" css={{ marginRight: '4px' }} />
                        Testando Conexão...
                      </>
                    ) : this.state.successCamposAlfa[index] ? (
                      <>✓ Testar Conexão</>
                    ) : (
                      'Testar Conexão'
                    )}
                  </Button>
                  {this.state.errorCamposAlfa[index] && (
                    <small css={{ fontSize: '11px', color: '#dc3545', display: 'block', marginTop: '4px' }}>
                      ⚠️ {this.state.errorCamposAlfa[index]}
                    </small>
                  )}
                  {this.state.successCamposAlfa[index] && !this.state.errorCamposAlfa[index] && (
                    <small css={{ fontSize: '11px', color: '#28a745', display: 'block', marginTop: '4px' }}>
                      ✓ {this.state.camposAlfaDisponiveis[index]?.length || 0} campos carregados
                    </small>
                  )}
                  <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
                    Tabela com dados temporais
                  </small>
                </div>

                {/* Campo de Ligação (Geográfico) */}
                <div css={{ marginBottom: '12px' }}>
                  <label css={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '11px',
                    fontWeight: 500
                  }}>
                    Campo Ligação (Geo)
                  </label>

                  {this.state.camposGeoDisponiveis[index]?.length > 0 ? (
                    // DROPDOWN com campos disponíveis
                    <Select
                      value={variavel.codigoLigacao}
                      onChange={(e) => {
                        console.log('[Setting] Select onChange - e:', e);
                        console.log('[Setting] Select onChange - e.target:', e.target);
                        console.log('[Setting] Select onChange - e.target.value:', e.target.value);
                        this.onVariavelChange(index, 'codigoLigacao', e.target.value);
                      }}
                      css={{ width: '100%' }}
                    >
                      <Option value="">Selecione um campo</Option>
                      {this.state.camposGeoDisponiveis[index]
                        .filter(f => f.type !== 'esriFieldTypeGeometry')
                        .map(field => (
                          <Option key={field.name} value={field.name}>
                            {field.alias || field.name} [{field.name}]
                            {field.type && ` - ${field.type.replace('esriFieldType', '')}`}
                          </Option>
                        ))
                      }
                    </Select>
                  ) : (
                    // FALLBACK: TextInput se não carregou campos ainda
                    <TextInput
                      value={variavel.codigoLigacao}
                      placeholder="Clique em 'Testar' na URL Geográfico primeiro"
                      onChange={(e) => this.onVariavelChange(index, 'codigoLigacao', e.target.value)}
                      css={{ width: '100%' }}
                      disabled={!variavel.urlGeografico}
                    />
                  )}

                  <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
                    Campo da camada geográfica para JOIN
                  </small>
                </div>

                {/* Campo de Ligação (Alfanumérico) */}
                <div css={{ marginBottom: '12px' }}>
                  <label css={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '11px',
                    fontWeight: 500
                  }}>
                    Campo Ligação (Alfa)
                  </label>

                  {this.state.camposAlfaDisponiveis[index]?.length > 0 ? (
                    // DROPDOWN com campos disponíveis
                    <Select
                      value={variavel.codigoLigacaoAlfanumerico || variavel.codigoLigacao}
                      onChange={(e) => this.onVariavelChange(index, 'codigoLigacaoAlfanumerico', e.target.value)}
                      css={{ width: '100%' }}
                    >
                      <Option value="">Selecione um campo (ou deixe igual ao geográfico)</Option>
                      {this.state.camposAlfaDisponiveis[index]
                        .filter(f => f.type !== 'esriFieldTypeGeometry')
                        .map(field => (
                          <Option key={field.name} value={field.name}>
                            {field.alias || field.name} [{field.name}]
                            {field.type && ` - ${field.type.replace('esriFieldType', '')}`}
                          </Option>
                        ))
                      }
                    </Select>
                  ) : (
                    // FALLBACK: TextInput se não carregou campos ainda
                    <TextInput
                      value={variavel.codigoLigacaoAlfanumerico || ''}
                      placeholder="Clique em 'Testar' na URL Alfanumérico primeiro"
                      onChange={(e) => this.onVariavelChange(index, 'codigoLigacaoAlfanumerico', e.target.value)}
                      css={{ width: '100%' }}
                      disabled={!variavel.urlAlfanumerico}
                    />
                  )}

                  <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
                    Campo da tabela alfanumérica para JOIN (opcional se igual ao geográfico)
                  </small>
                </div>

                {/* Campo Eixo/Linha */}
                <div css={{ marginBottom: '12px' }}>
                  <label css={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    Campo Eixo/Linha
                  </label>

                  {this.state.camposGeoDisponiveis[index]?.length > 0 ? (
                    <Select
                      value={variavel.campoEixo || ''}
                      onChange={(e) => this.onVariavelChange(index, 'campoEixo', e.target.value)}
                      css={{ width: '100%' }}
                    >
                      <Option value="">Selecione um campo</Option>
                      {this.state.camposGeoDisponiveis[index]
                        .filter(f =>
                          f.type !== 'esriFieldTypeGeometry' &&
                          f.type !== 'esriFieldTypeOID'
                        )
                        .map(field => (
                          <Option key={field.name} value={field.name}>
                            {field.alias || field.name} [{field.name}]
                          </Option>
                        ))}
                    </Select>
                  ) : (
                    <TextInput
                      value={variavel.campoEixo || ''}
                      placeholder="Carregue campos da camada geográfica primeiro"
                      onChange={(e) => this.onVariavelChange(index, 'campoEixo', e.target.value)}
                      css={{ width: '100%' }}
                      disabled={!variavel.urlGeografico}
                    />
                  )}

                  <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
                    Campo que identifica o eixo/linha para listagem no widget
                  </small>
                </div>

                {/* Campo de Valor */}
                <div css={{ marginBottom: '0' }}>
                  <label css={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    Campo de Valor
                  </label>

                  {this.state.camposAlfaDisponiveis[index]?.length > 0 ? (
                    // DROPDOWN com apenas campos numéricos
                    <Select
                      value={variavel.campoValor}
                      onChange={(e) => this.onVariavelChange(index, 'campoValor', e.target.value)}
                      css={{ width: '100%' }}
                    >
                      <Option value="">Selecione um campo</Option>
                      {this.state.camposAlfaDisponiveis[index]
                        .filter(f =>
                          f.type === 'esriFieldTypeInteger' ||
                          f.type === 'esriFieldTypeDouble' ||
                          f.type === 'esriFieldTypeSmallInteger' ||
                          f.type === 'esriFieldTypeSingle'
                        )
                        .map(field => (
                          <Option key={field.name} value={field.name}>
                            {field.alias || field.name} [{field.name}]
                            {field.type && ` - ${field.type.replace('esriFieldType', '')}`}
                          </Option>
                        ))
                      }
                      {/* Debug: se não houver campos numéricos, mostrar aviso */}
                      {this.state.camposAlfaDisponiveis[index]
                        ?.filter(f =>
                          f.type === 'esriFieldTypeInteger' ||
                          f.type === 'esriFieldTypeDouble' ||
                          f.type === 'esriFieldTypeSmallInteger' ||
                          f.type === 'esriFieldTypeSingle'
                        ).length === 0 && (
                        <Option value="" disabled>
                          Nenhum campo numérico encontrado
                        </Option>
                      )}
                    </Select>
                  ) : (
                    // FALLBACK: TextInput se não carregou campos ainda
                    <TextInput
                      value={variavel.campoValor}
                      placeholder="Clique em 'Testar' na URL Alfanumérico primeiro"
                      onChange={(e) => this.onVariavelChange(index, 'campoValor', e.target.value)}
                      css={{ width: '100%' }}
                      disabled={!variavel.urlAlfanumerico}
                    />
                  )}

                  <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
                    Campo numérico a ser analisado
                  </small>
                </div>

                {/* Campos de Data Temporal */}
                <div css={{ marginBottom: '12px' }}>
                  <label css={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    Configuração de Data
                  </label>

                  {/* Radio buttons para tipo de data */}
                  <div css={{ marginBottom: '8px' }}>
                    <label css={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '11px', marginBottom: '6px' }}>
                      <input
                        type="radio"
                        checked={variavel.tipoData === 'separados' || !variavel.tipoData}
                        onChange={() => this.onVariavelChange(index, 'tipoData', 'separados')}
                      />
                      <span css={{ marginLeft: '6px' }}>Campos Separados (Ano + Mês)</span>
                    </label>
                    <label css={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '11px' }}>
                      <input
                        type="radio"
                        checked={variavel.tipoData === 'unico'}
                        onChange={() => this.onVariavelChange(index, 'tipoData', 'unico')}
                      />
                      <span css={{ marginLeft: '6px' }}>Campo Único (Data)</span>
                    </label>
                  </div>

                  {/* Campos Separados */}
                  {(variavel.tipoData === 'separados' || !variavel.tipoData) && (
                    <div css={{ marginBottom: '8px' }}>
                      {/* Campo Ano */}
                      <div css={{ marginBottom: '8px' }}>
                        <label css={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 500 }}>
                          Campo Ano
                        </label>
                        {this.state.camposAlfaDisponiveis[index]?.length > 0 ? (
                          <Select
                            value={variavel.campoAno || ''}
                            onChange={(e) => this.onVariavelChange(index, 'campoAno', e.target.value)}
                            css={{ width: '100%' }}
                          >
                            <Option value="">Selecione</Option>
                            {this.state.camposAlfaDisponiveis[index]
                              .filter(f =>
                                f.type !== 'esriFieldTypeGeometry' &&
                                f.type !== 'esriFieldTypeOID'
                              )
                              .map(field => (
                                <Option key={field.name} value={field.name}>
                                  {field.alias || field.name} [{field.name}]
                                </Option>
                              ))}
                          </Select>
                        ) : (
                          <TextInput
                            value={variavel.campoAno || ''}
                            placeholder="Carregue campos"
                            onChange={(e) => this.onVariavelChange(index, 'campoAno', e.target.value)}
                            css={{ width: '100%' }}
                            disabled={!variavel.urlAlfanumerico}
                          />
                        )}
                      </div>

                      {/* Campo Mês */}
                      <div>
                        <label css={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 500 }}>
                          Campo Mês
                        </label>
                        {this.state.camposAlfaDisponiveis[index]?.length > 0 ? (
                          <Select
                            value={variavel.campoMes || ''}
                            onChange={(e) => this.onVariavelChange(index, 'campoMes', e.target.value)}
                            css={{ width: '100%' }}
                          >
                            <Option value="">Selecione</Option>
                            {this.state.camposAlfaDisponiveis[index]
                              .filter(f =>
                                f.type !== 'esriFieldTypeGeometry' &&
                                f.type !== 'esriFieldTypeOID'
                              )
                              .map(field => (
                                <Option key={field.name} value={field.name}>
                                  {field.alias || field.name} [{field.name}]
                                </Option>
                              ))}
                          </Select>
                        ) : (
                          <TextInput
                            value={variavel.campoMes || ''}
                            placeholder="Carregue campos"
                            onChange={(e) => this.onVariavelChange(index, 'campoMes', e.target.value)}
                            css={{ width: '100%' }}
                            disabled={!variavel.urlAlfanumerico}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Campo Único (Data) */}
                  {variavel.tipoData === 'unico' && (
                    <div css={{ marginBottom: '8px' }}>
                      <label css={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 500 }}>
                        Campo Data
                      </label>
                      {this.state.camposAlfaDisponiveis[index]?.length > 0 ? (
                        <Select
                          value={variavel.campoData || ''}
                          onChange={(e) => this.onVariavelChange(index, 'campoData', e.target.value)}
                          css={{ width: '100%' }}
                        >
                          <Option value="">Selecione</Option>
                          {this.state.camposAlfaDisponiveis[index]
                            .filter(f =>
                              (f.type === 'esriFieldTypeDate' || f.type.includes('Date')) &&
                              f.type !== 'esriFieldTypeOID'
                            )
                            .map(field => (
                              <Option key={field.name} value={field.name}>
                                {field.alias || field.name} [{field.name}]
                              </Option>
                            ))}
                        </Select>
                      ) : (
                        <TextInput
                          value={variavel.campoData || ''}
                          placeholder="Carregue campos"
                          onChange={(e) => this.onVariavelChange(index, 'campoData', e.target.value)}
                          css={{ width: '100%' }}
                          disabled={!variavel.urlAlfanumerico}
                        />
                      )}
                    </div>
                  )}

                  <small css={{ fontSize: '11px', color: '#6c757d', display: 'block' }}>
                    Filtrar dados por período temporal
                  </small>
                </div>

                {/* Campos para Filtro */}
                <div css={{ marginBottom: '12px' }}>
                  <label css={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    Campos para Filtro ({variavel.camposFiltro?.length || 0} selecionados)
                  </label>

                  {this.state.camposAlfaDisponiveis[index]?.length > 0 ? (
                    <div css={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {this.state.camposAlfaDisponiveis[index]
                        .filter(f =>
                          f.type !== 'esriFieldTypeGeometry' &&
                          f.type !== 'esriFieldTypeOID' &&
                          f.name !== variavel.campoValor &&
                          f.name !== variavel.codigoLigacaoAlfanumerico &&
                          f.name !== variavel.codigoLigacao
                        )
                        .map(field => {
                          const isSelected = variavel.camposFiltro?.includes(field.name) || false;
                          const currentAlias = variavel.camposFiltroAlias?.[field.name] || '';

                          return (
                            <div
                              key={field.name}
                              css={{
                                padding: '8px',
                                marginBottom: '6px',
                                borderRadius: '4px',
                                backgroundColor: 'transparent',
                                border: `1px solid ${isSelected ? '#28a745' : '#dee2e6'}`,
                                borderLeft: isSelected ? '3px solid #28a745' : '1px solid #dee2e6'
                              }}
                            >
                              {/* Checkbox e nome do campo na mesma linha */}
                              <div css={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: isSelected ? '8px' : '0',
                                gap: '8px'
                              }}>
                                <Checkbox
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    let novosCampos = [...(variavel.camposFiltro || [])];

                                    if (checked) {
                                      novosCampos.push(field.name);
                                    } else {
                                      novosCampos = novosCampos.filter(c => c !== field.name);
                                    }

                                    this.onVariavelChange(index, 'camposFiltro', novosCampos);
                                  }}
                                />
                                <div css={{ flex: 1, fontSize: '11px' }}>
                                  <div css={{ fontWeight: 500 }}>{field.alias || field.name}</div>
                                  {field.alias && (
                                    <div css={{ color: '#6c757d', fontSize: '10px' }}>{field.name}</div>
                                  )}
                                </div>
                              </div>

                              {/* Input de apelido aparece abaixo quando selecionado */}
                              {isSelected && (
                                <div css={{ paddingLeft: '32px' }}>
                                  <label css={{
                                    display: 'block',
                                    fontSize: '10px',
                                    color: '#6c757d',
                                    marginBottom: '4px'
                                  }}>
                                    Apelido para exibição:
                                  </label>
                                  <TextInput
                                    value={currentAlias}
                                    placeholder={field.alias || field.name}
                                    onChange={(e) => {
                                      const aliases = {
                                        ...(variavel.camposFiltroAlias || {}),
                                        [field.name]: e.target.value
                                      };
                                      this.onVariavelChange(index, 'camposFiltroAlias', aliases);
                                    }}
                                    css={{
                                      width: '100%',
                                      fontSize: '11px',
                                      padding: '4px 8px'
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div css={{
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: '#6c757d',
                      textAlign: 'center'
                    }}>
                      Carregue os campos da URL Alfanumérico primeiro
                    </div>
                  )}

                  <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '6px' }}>
                    Defina apelidos amigáveis para exibição no widget
                  </small>
                </div>
              </div>
            ))}
          </div>
        </SettingSection>

        {/* Personalização de Textos */}
        <SettingSection title="Textos da Interface">
          <div css={{ padding: '12px 16px' }}>
            <div css={{ marginBottom: '12px' }}>
              <label css={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500
              }}>
                Título
              </label>
              <TextInput
                value={config.textos.titulo}
                onChange={(e) => this.onTextoChange('titulo', e.target.value)}
                css={{ width: '100%' }}
              />
            </div>

            <div css={{ marginBottom: '12px' }}>
              <label css={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500
              }}>
                Subtítulo
              </label>
              <TextInput
                value={config.textos.subtitulo}
                onChange={(e) => this.onTextoChange('subtitulo', e.target.value)}
                css={{ width: '100%' }}
              />
            </div>

            <div css={{ marginBottom: '12px' }}>
              <label css={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500
              }}>
                Texto do Botão
              </label>
              <TextInput
                value={config.textos.botaoGerar}
                onChange={(e) => this.onTextoChange('botaoGerar', e.target.value)}
                css={{ width: '100%' }}
              />
            </div>

            <div css={{ marginBottom: '12px' }}>
              <label css={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500
              }}>
                Mensagem de Sucesso
              </label>
              <TextInput
                value={config.textos.msgSucesso}
                onChange={(e) => this.onTextoChange('msgSucesso', e.target.value)}
                css={{ width: '100%' }}
              />
            </div>

            <div css={{ marginBottom: '12px' }}>
              <label css={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500
              }}>
                Mensagem de Erro
              </label>
              <TextInput
                value={config.textos.msgErro}
                onChange={(e) => this.onTextoChange('msgErro', e.target.value)}
                css={{ width: '100%' }}
              />
            </div>

            <div>
              <label css={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500
              }}>
                Mensagem de Carregamento
              </label>
              <TextInput
                value={config.textos.msgCarregando}
                onChange={(e) => this.onTextoChange('msgCarregando', e.target.value)}
                css={{ width: '100%' }}
              />
            </div>
          </div>
        </SettingSection>

        {/* Configurações Avançadas */}
        <SettingSection title="Configurações Avançadas">
          <div css={{ padding: '12px 16px' }}>
            {/* Cache */}
            <div css={{
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <label css={{ fontSize: '13px', fontWeight: 500, display: 'block' }}>
                  Habilitar Cache
                </label>
                <small css={{ fontSize: '11px', color: '#6c757d' }}>
                  Cachear resultados de queries
                </small>
              </div>
              <Switch
                checked={config.configuracaoAvancada.cache}
                onChange={(evt) => this.onConfiguracaoAvancadaChange('cache', evt.target.checked)}
              />
            </div>

            {/* Tempo de Cache */}
            {config.configuracaoAvancada.cache && (
              <div css={{ marginBottom: '16px' }}>
                <label css={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '12px',
                  fontWeight: 500
                }}>
                  Tempo de Cache (segundos)
                </label>
                <NumericInput
                  value={config.configuracaoAvancada.tempoCache}
                  onChange={(value) => this.onConfiguracaoAvancadaChange('tempoCache', value)}
                  min={60}
                  max={3600}
                  css={{ width: '100%' }}
                />
              </div>
            )}

            {/* Timeout */}
            <div css={{ marginBottom: '16px' }}>
              <label css={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500
              }}>
                Timeout de Queries (segundos)
              </label>
              <NumericInput
                value={config.configuracaoAvancada.timeout}
                onChange={(value) => this.onConfiguracaoAvancadaChange('timeout', value)}
                min={10}
                max={120}
                css={{ width: '100%' }}
              />
            </div>

            {/* Máximo de Features */}
            <div css={{ marginBottom: '16px' }}>
              <label css={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500
              }}>
                Máximo de Features
              </label>
              <NumericInput
                value={config.configuracaoAvancada.maxFeatures}
                onChange={(value) => this.onConfiguracaoAvancadaChange('maxFeatures', value)}
                min={100}
                max={10000}
                step={100}
                css={{ width: '100%' }}
              />
            </div>

            {/* Zoom Automático */}
            <div css={{
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <label css={{ fontSize: '13px', fontWeight: 500, display: 'block' }}>
                  Zoom Automático
                </label>
                <small css={{ fontSize: '11px', color: '#6c757d' }}>
                  Zoom para extent das features
                </small>
              </div>
              <Switch
                checked={config.configuracaoAvancada.zoomAutomatico}
                onChange={(evt) => this.onConfiguracaoAvancadaChange('zoomAutomatico', evt.target.checked)}
              />
            </div>

            {/* Debug Mode */}
            <div css={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <label css={{ fontSize: '13px', fontWeight: 500, display: 'block' }}>
                  Modo Debug
                </label>
                <small css={{ fontSize: '11px', color: '#6c757d' }}>
                  Exibir logs no console
                </small>
              </div>
              <Switch
                checked={config.configuracaoAvancada.debugMode}
                onChange={(evt) => this.onConfiguracaoAvancadaChange('debugMode', evt.target.checked)}
              />
            </div>
          </div>
        </SettingSection>
      </div>
    );
  }
}
