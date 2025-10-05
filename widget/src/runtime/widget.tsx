/** @jsx jsx */
/** @jsxFrag React.Fragment */
import { React, jsx, AllWidgetProps } from 'jimu-core';
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis';
import { Tab, Tabs } from 'jimu-ui';
import { IMConfig, ITemporalSelection, IFilterValues, AnalysisMethod, IVariableConfig } from '../types';

// Componentes
import LoadingSpinner from './components/LoadingSpinner';
import MessageAlert from './components/MessageAlert';
import { AnalysisTab } from './components/AnalysisTab';
import { SymbologyTab } from './components/SymbologyTab';

// Hooks
import { useValidation } from './hooks/useValidation';

// Utils
import { createClassBreaksRenderer, createFakeFeatures, getAnalysisFieldAndClasses } from './utils/symbologyHelpers';

import './style.scss';

interface State {
  jimuMapView: JimuMapView | null;
  variavelSelecionada: string | null;
  metodoAnalise: AnalysisMethod;
  periodo1: ITemporalSelection;
  periodo2: ITemporalSelection;
  filtros: { [campo: string]: string[] }; // Filtros genéricos por campo
  eixosSelecionados: string[]; // Eixos/linhas selecionados
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  currentLayer: __esri.FeatureLayer | null;
  // Demo
  showDemo: boolean;
  demoClasses: IClassBreak[];
  demoFeatureCount: number;
  // Edição de simbolização
  editableClasses: IClassBreak[];
  fieldName: string;
  // Tabs
  activeTab: string;
  // Token de autenticação
  authToken: string | null;
}

export default class AnaliseVariacoes extends React.PureComponent<
  AllWidgetProps<IMConfig>,
  State
> {
  constructor(props: AllWidgetProps<IMConfig>) {
    super(props);

    this.state = {
      jimuMapView: null,
      variavelSelecionada: null,
      metodoAnalise: 'sem-variacao',
      periodo1: {
        ano: null,
        meses: []
      },
      periodo2: {
        ano: null,
        meses: []
      },
      filtros: {}, // Filtros dinâmicos vazios inicialmente
      eixosSelecionados: [], // Eixos selecionados inicialmente vazio
      isLoading: false,
      errorMessage: null,
      successMessage: null,
      currentLayer: null,
      // Demo
      showDemo: false,
      demoClasses: [],
      demoFeatureCount: 0,
      // Edição de simbolização
      editableClasses: [],
      fieldName: '',
      // Tabs
      activeTab: 'analise',
      // Token de autenticação
      authToken: null
    };
  }

  // ============================================================================
  // LIFECYCLE METHODS
  // ============================================================================

  async componentDidMount() {
    const { config } = this.props;

    if (config?.autenticacao?.enabled) {
      await this.generateToken();
    }
  }

  // ============================================================================
  // AUTENTICAÇÃO
  // ============================================================================

  generateToken = async () => {
    const { config } = this.props;
    if (!config?.autenticacao?.enabled) return;

    try {
      const { portalUrl, username, password } = config.autenticacao;

      if (!portalUrl || !username || !password) {
        return;
      }

      const tokenUrl = `${portalUrl}/generateToken`;
      const params = new URLSearchParams({
        username,
        password,
        f: 'json',
        referer: window.location.origin,
        expiration: String((config.autenticacao.tokenExpiration || 60) * 60)
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        body: params
      });

      const data = await response.json();

      if (data.token) {
        this.setState({ authToken: data.token });
      } else {
        console.error('[AnaliseVariacoes] Erro ao gerar token:', data.error);
      }
    } catch (error) {
      console.error('[AnaliseVariacoes] Erro ao gerar token:', error);
    }
  };

  componentWillUnmount() {
    this.removeCurrentLayer();
  }

  // ============================================================================
  // MAP VIEW HANDLERS
  // ============================================================================

  onActiveViewChange = (jimuMapView: JimuMapView) => {
    if (jimuMapView) {
      this.setState({ jimuMapView });
    }
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  handleVariavelChange = (variavelId: string) => {
    this.setState({
      variavelSelecionada: variavelId,
      filtros: {}
    });
  };

  handleMetodoChange = (metodo: AnalysisMethod) => {
    this.setState({ metodoAnalise: metodo });
  };

  handlePeriodo1Change = (periodo: ITemporalSelection) => {
    this.setState({ periodo1: periodo });
  };

  handlePeriodo2Change = (periodo: ITemporalSelection) => {
    this.setState({ periodo2: periodo });
  };

  handleFiltrosChange = (filtros: IFilterValues) => {
    this.setState({ filtros });
  };

  handleGerarMapa = async () => {
    const validation = this.validateInputs();

    if (!validation.valid) {
      this.setState({
        errorMessage: validation.errors.join(', '),
        successMessage: null
      });
      return;
    }

    try {
      this.setState({
        isLoading: true,
        errorMessage: null,
        successMessage: null
      });

      // TODO: Implementar lógica de análise
      // 1. Query dados geográficos
      // 2. Query dados alfanuméricos
      // 3. Join e agregação
      // 4. Calcular variação (se aplicável)
      // 5. Criar camada com simbolização
      // 6. Adicionar ao mapa

      await this.simulateAnalysis();

      // Mensagem de sucesso com contador de features e muda para aba de simbolização
      const { demoFeatureCount } = this.state;
      this.setState({
        isLoading: false,
        successMessage: `Camada gerada com sucesso! ${demoFeatureCount} features encontradas.`,
        activeTab: 'simbolizacao' // Muda automaticamente para a aba de simbolização
      });

    } catch (error) {
      console.error('[AnaliseVariacoes] Erro:', error);
      this.setState({
        isLoading: false,
        errorMessage: 'Erro ao gerar análise. Tente novamente.'
      });
    }
  };

  handleCloseErrorMessage = () => {
    this.setState({ errorMessage: null });
  };

  handleCloseSuccessMessage = () => {
    this.setState({ successMessage: null });
  };

  handleEditableClassesChange = (classes: IClassBreak[]) => {
    this.setState({ editableClasses: classes });
  };

  handleApplySymbology = async () => {
    const { currentLayer, editableClasses, fieldName } = this.state;

    if (!currentLayer || editableClasses.length === 0) {
      console.error('[AnaliseVariacoes] Não há camada ou classes para atualizar');
      return;
    }

    try {
      // Importar módulos Esri
      const [ClassBreaksRenderer, SimpleLineSymbol] = await Promise.all([
        import('esri/renderers/ClassBreaksRenderer'),
        import('esri/symbols/SimpleLineSymbol')
      ]);

      // Criar novo renderer usando helper
      const newRenderer = createClassBreaksRenderer(
        ClassBreaksRenderer.default,
        SimpleLineSymbol.default,
        editableClasses,
        fieldName
      );

      // Atualizar renderer da camada
      currentLayer.renderer = newRenderer;

      this.setState({
        successMessage: 'Simbolização atualizada com sucesso!'
      });

      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        this.setState({ successMessage: null });
      }, 3000);

    } catch (error) {
      console.error('[AnaliseVariacoes] Erro ao atualizar simbolização:', error);
      this.setState({
        errorMessage: 'Erro ao atualizar simbolização'
      });
    }
  };

  handleTabChange = (tabId: string) => {
    this.setState({ activeTab: tabId });
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  validateInputs = () => {
    const { variavelSelecionada, metodoAnalise, periodo1, periodo2, filtros } = this.state;

    // Usar hook de validação via wrapper funcional
    const validator = {
      validateInputs: (inputs) => {
        const errors: string[] = [];

        if (!inputs.variavelSelecionada) {
          errors.push('Selecione uma variável');
        }

        if (!inputs.periodo1.ano || inputs.periodo1.meses.length === 0) {
          errors.push('Selecione o período');
        }

        if (inputs.metodoAnalise === 'com-variacao') {
          if (!inputs.periodo2.ano || inputs.periodo2.meses.length === 0) {
            errors.push('Selecione o 2º período');
          }
          if (this.periodosIguais(inputs.periodo1, inputs.periodo2)) {
            errors.push('Os períodos devem ser diferentes');
          }
        }

        const temFiltrosSelecionados = Object.values(inputs.filtros).some(arr => arr && arr.length > 0);
        if (!temFiltrosSelecionados) {
          errors.push('Selecione ao menos um filtro');
        }

        return {
          valid: errors.length === 0,
          errors
        };
      }
    };

    return validator.validateInputs({
      variavelSelecionada,
      metodoAnalise,
      periodo1,
      periodo2,
      filtros
    });
  };

  periodosIguais = (p1: ITemporalSelection, p2: ITemporalSelection): boolean => {
    return p1.ano === p2.ano &&
           JSON.stringify(p1.meses.sort()) === JSON.stringify(p2.meses.sort());
  };

  simulateAnalysis = async () => {
    const { metodoAnalise, jimuMapView } = this.state;
    const { config } = this.props;

    if (!jimuMapView) {
      throw new Error('MapView não está disponível');
    }

    // Simula processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Importar módulos Esri dinamicamente
    const [
      Graphic,
      Polyline,
      FeatureLayer,
      ClassBreaksRenderer,
      SimpleLineSymbol
    ] = await Promise.all([
      import('esri/Graphic'),
      import('esri/geometry/Polyline'),
      import('esri/layers/FeatureLayer'),
      import('esri/renderers/ClassBreaksRenderer'),
      import('esri/symbols/SimpleLineSymbol')
    ]);

    // Obter campo e classes usando helper
    const { fieldName, classes: demoClasses } = getAnalysisFieldAndClasses(
      metodoAnalise,
      config.simbologiaPadrao.comVariacao.classes
    );

    // Criar features usando helper
    const features = createFakeFeatures(
      Graphic.default,
      Polyline.default,
      demoClasses,
      fieldName,
      metodoAnalise
    );

    // Criar renderer usando helper
    const renderer = createClassBreaksRenderer(
      ClassBreaksRenderer.default,
      SimpleLineSymbol.default,
      demoClasses,
      fieldName
    );

    // Criar FeatureLayer
    const layer = new FeatureLayer.default({
      source: features,
      objectIdField: 'ObjectID',
      fields: [
        {
          name: 'ObjectID',
          alias: 'ObjectID',
          type: 'oid'
        },
        {
          name: 'Nome',
          alias: 'Nome',
          type: 'string'
        },
        {
          name: fieldName,
          alias: metodoAnalise === 'com-variacao' ? 'Variação (%)' : 'Valor',
          type: 'double'
        }
      ],
      renderer: renderer,
      title: `Análise ${metodoAnalise === 'com-variacao' ? 'com Variação' : 'sem Variação'}`,
      popupTemplate: {
        title: '{Nome}',
        content: metodoAnalise === 'com-variacao'
          ? '<b>Variação:</b> {VARIACAO}%'
          : '<b>Valor:</b> {VALOR_ANALISE}'
      }
    });

    // Remover camada anterior se existir
    this.removeCurrentLayer();

    // Adicionar ao mapa
    jimuMapView.view.map.add(layer);

    // Zoom para extent das features
    await jimuMapView.view.goTo(features);

    // Salvar referência e classes editáveis
    this.setState({
      currentLayer: layer,
      showDemo: true,
      demoClasses,
      demoFeatureCount: features.length,
      editableClasses: [...demoClasses], // Cópia para edição
      fieldName: fieldName
    });
  };

  removeCurrentLayer = () => {
    const { currentLayer, jimuMapView } = this.state;

    if (currentLayer && jimuMapView?.view) {
      jimuMapView.view.map.remove(currentLayer);
    }
  };

  isBotaoHabilitado = (): boolean => {
    const { variavelSelecionada, metodoAnalise, periodo1, periodo2, filtros } = this.state;

    const temFiltrosSelecionados = Object.values(filtros).some(arr => arr && arr.length > 0);

    return !!(
      variavelSelecionada &&
      periodo1.ano &&
      periodo1.meses.length > 0 &&
      (metodoAnalise === 'sem-variacao' || (
        periodo2.ano &&
        periodo2.meses.length > 0 &&
        !this.periodosIguais(periodo1, periodo2)
      )) &&
      temFiltrosSelecionados
    );
  };

  getVariavelSelecionada = (): IVariableConfig | null => {
    const { config } = this.props;
    const { variavelSelecionada } = this.state;

    if (!variavelSelecionada || !config) return null;

    return config.variaveis.find(v => v.id === variavelSelecionada) || null;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  render() {
    const { config, useMapWidgetIds } = this.props;
    const {
      isLoading,
      errorMessage,
      successMessage,
      metodoAnalise,
      variavelSelecionada,
      periodo1,
      periodo2,
      filtros
    } = this.state;

    if (!config) {
      return <div className="widget-analise-variacoes">Configuração não encontrada</div>;
    }

    const variavelConfig = this.getVariavelSelecionada();

    return (
      <div
        className="widget-analise-variacoes jimu-widget"
        css={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div className="widget-header" css={{ padding: '16px', paddingBottom: '12px', flexShrink: 0 }}>
          <h3 css={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            {config.textos.titulo}
          </h3>
          {config.textos.subtitulo && (
            <p className="widget-subtitle" css={{ margin: '4px 0 0 0', color: '#6c757d', fontSize: '0.9rem' }}>
              {config.textos.subtitulo}
            </p>
          )}
        </div>

        {/* Container com scroll para o conteúdo */}
        <div
          css={{
            flex: 1,
            overflow: 'auto',
            padding: '0 16px 16px 16px'
          }}
        >
          {/* Mensagens de Feedback */}
          {errorMessage && (
            <MessageAlert
              type="error"
              message={errorMessage}
              onClose={this.handleCloseErrorMessage}
            />
          )}
          {successMessage && (
            <MessageAlert
              type="success"
              message={successMessage}
              onClose={this.handleCloseSuccessMessage}
            />
          )}

          {/* Loading State */}
          {isLoading && (
            <LoadingSpinner message={config.textos.msgCarregando} size="md" />
          )}

          {/* Tabs */}
          {!isLoading && (
            <Tabs
              type="underline"
              value={this.state.activeTab}
              onChange={this.handleTabChange}
              css={{ marginTop: '8px' }}
            >
              {/* Aba Análise */}
              <Tab
                id="analise"
                title="📊 Análise"
                css={{ fontSize: '13px' }}
              >
                <AnalysisTab
                  config={config}
                  variavelSelecionada={variavelSelecionada}
                  metodoAnalise={metodoAnalise}
                  periodo1={periodo1}
                  periodo2={periodo2}
                  filtros={filtros}
                  eixosSelecionados={this.state.eixosSelecionados}
                  authToken={this.state.authToken}
                  isBotaoHabilitado={this.isBotaoHabilitado()}
                  onVariavelChange={this.handleVariavelChange}
                  onMetodoChange={this.handleMetodoChange}
                  onPeriodo1Change={this.handlePeriodo1Change}
                  onPeriodo2Change={this.handlePeriodo2Change}
                  onFiltrosChange={this.handleFiltrosChange}
                  onEixosChange={(eixos) => this.setState({ eixosSelecionados: eixos })}
                  onGerarMapa={this.handleGerarMapa}
                  variavelConfig={variavelConfig}
                />
              </Tab>

              {/* Aba Simbolização (só aparece após gerar mapa) */}
              {this.state.showDemo && this.state.editableClasses.length > 0 && (
                <Tab
                  id="simbolizacao"
                  title="🎨 Simbolização"
                  css={{ fontSize: '13px' }}
                >
                  <SymbologyTab
                    editableClasses={this.state.editableClasses}
                    demoFeatureCount={this.state.demoFeatureCount}
                    onChange={this.handleEditableClassesChange}
                    onApply={this.handleApplySymbology}
                  />
                </Tab>
              )}
            </Tabs>
          )}
        </div>

        {/* Map View (invisível, apenas conecta ao mapa) */}
        {useMapWidgetIds && useMapWidgetIds.length > 0 && (
          <JimuMapViewComponent
            useMapWidgetId={useMapWidgetIds[0]}
            onActiveViewChange={this.onActiveViewChange}
          />
        )}
      </div>
    );
  }
}
