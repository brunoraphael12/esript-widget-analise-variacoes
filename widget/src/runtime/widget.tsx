/** @jsx jsx */
import { React, jsx, AllWidgetProps } from 'jimu-core';
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis';
import { Button, Tab, Tabs } from 'jimu-ui';
import { IMConfig, ITemporalSelection, IFilterValues, AnalysisMethod, IVariableConfig } from '../types';

// Componentes
import VariableSelector from './components/VariableSelector';
import AnalysisMethodToggle from './components/AnalysisMethodToggle';
import TemporalSelector from './components/TemporalSelector';
import DynamicFilters from './components/DynamicFilters';
import EixoSelector from './components/EixoSelector';
import LoadingSpinner from './components/LoadingSpinner';
import MessageAlert from './components/MessageAlert';
import SymbologyControls from './components/SymbologyControls';

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

      // Criar novo renderer com as classes editadas
      const newRenderer = this.createClassBreaksRenderer(
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
    const errors: string[] = [];
    const { variavelSelecionada, metodoAnalise, periodo1, periodo2, filtros } = this.state;

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
      if (this.periodosIguais(periodo1, periodo2)) {
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

    // Criar dados fictícios baseados no método
    let demoClasses: IClassBreak[];
    let fieldName: string;

    if (metodoAnalise === 'com-variacao') {
      demoClasses = config.simbologiaPadrao.comVariacao.classes;
      fieldName = 'VARIACAO';
    } else {
      demoClasses = [
        {
          min: 0,
          max: 500,
          cor: [173, 216, 230, 255],
          label: 'Muito Baixo',
          largura: 1
        },
        {
          min: 500,
          max: 1500,
          cor: [144, 238, 144, 255],
          label: 'Baixo',
          largura: 2
        },
        {
          min: 1500,
          max: 3000,
          cor: [255, 255, 0, 255],
          label: 'Médio',
          largura: 3
        },
        {
          min: 3000,
          max: 5000,
          cor: [255, 165, 0, 255],
          label: 'Alto',
          largura: 4
        },
        {
          min: 5000,
          max: 999999,
          cor: [220, 20, 60, 255],
          label: 'Muito Alto',
          largura: 5
        }
      ];
      fieldName = 'VALOR_ANALISE';
    }

    // Criar features fictícias (linhas)
    const features = this.createFakeFeatures(Graphic.default, Polyline.default, demoClasses, fieldName, metodoAnalise);

    // Criar renderer
    const renderer = this.createClassBreaksRenderer(
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

  createFakeFeatures = (Graphic: any, Polyline: any, classes: IClassBreak[], fieldName: string, metodo: AnalysisMethod) => {
    const features: any[] = [];
    const numFeaturesPerClass = metodo === 'com-variacao' ? 20 : 15;

    // Para cada classe, criar algumas features
    classes.forEach((classItem, classIndex) => {
      for (let i = 0; i < numFeaturesPerClass; i++) {
        // Gerar valor aleatório dentro do intervalo da classe
        const minVal = classItem.min === -999999 ? -100 : classItem.min;
        const maxVal = classItem.max === 999999 ? 10000 : classItem.max;
        const valor = minVal + Math.random() * (maxVal - minVal);

        // Criar geometria de linha fictícia (coordenadas em Lisboa/Portugal)
        const baseX = -9.1393; // Longitude base (Lisboa)
        const baseY = 38.7223; // Latitude base (Lisboa)
        const offsetX = (Math.random() - 0.5) * 0.5;
        const offsetY = (Math.random() - 0.5) * 0.5;

        const paths = [
          [
            [baseX + offsetX, baseY + offsetY],
            [baseX + offsetX + (Math.random() - 0.5) * 0.1, baseY + offsetY + (Math.random() - 0.5) * 0.1],
            [baseX + offsetX + (Math.random() - 0.5) * 0.15, baseY + offsetY + (Math.random() - 0.5) * 0.15]
          ]
        ];

        const polyline = new Polyline({
          paths: paths,
          spatialReference: { wkid: 4326 }
        });

        const graphic = new Graphic({
          geometry: polyline,
          attributes: {
            ObjectID: classIndex * numFeaturesPerClass + i + 1,
            Nome: `${classItem.label} - Linha ${i + 1}`,
            [fieldName]: valor
          }
        });

        features.push(graphic);
      }
    });

    return features;
  };

  createClassBreaksRenderer = (ClassBreaksRenderer: any, SimpleLineSymbol: any, classes: IClassBreak[], fieldName: string) => {
    const classBreakInfos = classes.map(classItem => {
      const [r, g, b, a] = classItem.cor;
      return {
        minValue: classItem.min === -999999 ? -Infinity : classItem.min,
        maxValue: classItem.max === 999999 ? Infinity : classItem.max,
        symbol: new SimpleLineSymbol({
          color: [r, g, b, a / 255],
          width: classItem.largura || 2
        }),
        label: classItem.label
      };
    });

    return new ClassBreaksRenderer({
      field: fieldName,
      classBreakInfos: classBreakInfos
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
              <div css={{ padding: '16px 4px' }}>
                {/* Seleção de Variável */}
                <div className="section" css={{ marginBottom: '20px' }}>
                  <VariableSelector
                    variaveis={config.variaveis}
                    selectedVariavelId={variavelSelecionada}
                    onChange={this.handleVariavelChange}
                    label={config.textos.labelVariavel}
                  />
                </div>

                {/* Método de Análise */}
                <div className="section" css={{ marginBottom: '20px' }}>
                  <AnalysisMethodToggle
                    selectedMethod={metodoAnalise}
                    onChange={this.handleMetodoChange}
                    label={config.textos.labelMetodo}
                  />
                </div>

                {/* Seleção Temporal - 1º Período */}
                <div className="section" css={{ marginBottom: '20px' }}>
                  <TemporalSelector
                    selection={periodo1}
                    onChange={this.handlePeriodo1Change}
                    label={
                      metodoAnalise === 'sem-variacao'
                        ? config.textos.labelPeriodo
                        : config.textos.labelPeriodo1
                    }
                    labelAno={config.textos.labelAno}
                    labelMeses={config.textos.labelMeses}
                    variavelSelecionada={variavelConfig}
                    authToken={this.state.authToken}
                    required={true}
                  />
                </div>

                {/* Seleção Temporal - 2º Período (apenas Com Variação) */}
                {metodoAnalise === 'com-variacao' && (
                  <div className="section" css={{ marginBottom: '20px' }}>
                    <TemporalSelector
                      selection={periodo2}
                      onChange={this.handlePeriodo2Change}
                      label={config.textos.labelPeriodo2}
                      labelAno={config.textos.labelAno}
                      labelMeses={config.textos.labelMeses}
                      variavelSelecionada={variavelConfig}
                      authToken={this.state.authToken}
                      required={true}
                    />
                  </div>
                )}

                {/* Filtros Dinâmicos */}
                <div className="section" css={{ marginBottom: '20px' }}>
                  <DynamicFilters
                    variavelSelecionada={variavelConfig}
                    filterValues={filtros}
                    onChange={this.handleFiltrosChange}
                    authToken={this.state.authToken}
                    periodo1={periodo1}
                  />
                </div>

                {/* Seletor de Eixos/Linhas */}
                <div className="section" css={{ marginBottom: '20px' }}>
                  <EixoSelector
                    variavelSelecionada={variavelConfig}
                    eixosSelecionados={this.state.eixosSelecionados}
                    onChange={(eixos) => this.setState({ eixosSelecionados: eixos })}
                    filterValues={filtros}
                    authToken={this.state.authToken}
                    periodo1={periodo1}
                    periodo2={periodo2}
                    metodo={metodoAnalise}
                  />
                </div>

                {/* Botão Gerar Mapa */}
                <div className="section" css={{ marginTop: '24px' }}>
                  <Button
                    type="primary"
                    onClick={this.handleGerarMapa}
                    disabled={!this.isBotaoHabilitado()}
                    css={{ width: '100%', height: '40px' }}
                  >
                    {config.textos.botaoGerar}
                  </Button>
                </div>
              </div>
            </Tab>

            {/* Aba Simbolização (só aparece após gerar mapa) */}
            {this.state.showDemo && this.state.editableClasses.length > 0 && (
              <Tab
                id="simbolizacao"
                title="🎨 Simbolização"
                css={{ fontSize: '13px' }}
              >
                <div css={{ padding: '16px 4px' }}>
                  {/* Informação sobre a camada */}
                  <div
                    css={{
                      padding: '12px',
                      backgroundColor: '#e7f3ff',
                      border: '1px solid #b3d9ff',
                      borderRadius: '4px',
                      marginBottom: '16px',
                      fontSize: '12px',
                      color: '#004085'
                    }}
                  >
                    <strong>📍 Camada ativa:</strong> {this.state.demoFeatureCount} features no mapa
                    <br />
                    <span css={{ fontSize: '11px', color: '#6c757d' }}>
                      Edite as classes abaixo e clique em "Aplicar" para atualizar o mapa
                    </span>
                  </div>

                  {/* Controles de Simbolização */}
                  <SymbologyControls
                    classes={this.state.editableClasses}
                    onChange={this.handleEditableClassesChange}
                    onApply={this.handleApplySymbology}
                    isVisible={true}
                  />
                </div>
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
