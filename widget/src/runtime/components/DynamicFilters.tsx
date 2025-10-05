/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { Checkbox, Loading } from 'jimu-ui';
import { IVariableConfig } from '../../types';

interface IDynamicFiltersProps {
  variavelSelecionada: IVariableConfig | null;
  filterValues: { [campo: string]: string[] };
  onChange: (values: { [campo: string]: string[] }) => void;
  authToken?: string | null;
  periodo1?: { ano: number | null; meses: number[] };
}

interface State {
  uniqueValues: { [campo: string]: string[] };
  loadingFields: { [campo: string]: boolean };
  expandedPanels: string[];
}

/**
 * Componente de filtros dinâmicos
 * Carrega automaticamente os valores únicos de cada campo marcado como filtro
 */
class DynamicFilters extends React.PureComponent<IDynamicFiltersProps, State> {
  constructor(props: IDynamicFiltersProps) {
    super(props);

    this.state = {
      uniqueValues: {},
      loadingFields: {},
      expandedPanels: []
    };
  }

  componentDidMount() {
    this.loadUniqueValues();
  }

  componentDidUpdate(prevProps: IDynamicFiltersProps) {
    // Recarregar se a variável mudou
    if (this.props.variavelSelecionada?.id !== prevProps.variavelSelecionada?.id) {
      this.loadUniqueValues();
      return;
    }

    // Recarregar se o token ficou disponível
    if (!prevProps.authToken && this.props.authToken) {
      this.loadUniqueValues();
      return;
    }

    // Recarregar se os filtros mudaram (filtros cascateados)
    if (JSON.stringify(this.props.filterValues) !== JSON.stringify(prevProps.filterValues)) {
      this.loadUniqueValues();
      return;
    }

    // Recarregar se o período mudou
    if (JSON.stringify(this.props.periodo1) !== JSON.stringify(prevProps.periodo1)) {
      this.loadUniqueValues();
      return;
    }
  }

  loadUniqueValues = async () => {
    const { variavelSelecionada } = this.props;

    if (!variavelSelecionada || !variavelSelecionada.urlAlfanumerico) {
      return;
    }

    const { camposFiltro } = variavelSelecionada;

    if (!camposFiltro || camposFiltro.length === 0) {
      return;
    }

    // Para cada campo filtro, carregar unique values CONSIDERANDO os outros filtros
    for (const campo of camposFiltro) {
      this.setState(prev => ({
        loadingFields: { ...prev.loadingFields, [campo]: true }
      }));

      try {
        const whereClause = this.buildWhereClause(campo);
        const values = await this.fetchUniqueValues(
          variavelSelecionada.urlAlfanumerico,
          campo,
          whereClause
        );

        this.setState(prev => ({
          uniqueValues: { ...prev.uniqueValues, [campo]: values },
          loadingFields: { ...prev.loadingFields, [campo]: false }
        }));
      } catch (error) {
        console.error(`[DynamicFilters] Erro ao carregar valores únicos para ${campo}:`, error);
        this.setState(prev => ({
          loadingFields: { ...prev.loadingFields, [campo]: false }
        }));
      }
    }
  };

  /**
   * Constrói WHERE clause para um campo, considerando OUTROS filtros (exceto o próprio)
   */
  buildWhereClause = (currentField: string): string => {
    const { variavelSelecionada, filterValues, periodo1 } = this.props;

    if (!variavelSelecionada) return '1=1';

    const conditions: string[] = [];

    // Filtros dinâmicos (EXCETO o campo atual)
    if (variavelSelecionada.camposFiltro && filterValues) {
      variavelSelecionada.camposFiltro.forEach(campo => {
        // Pular o campo atual (não filtrar ele mesmo)
        if (campo === currentField) return;

        const valores = filterValues[campo];
        if (valores && valores.length > 0) {
          const valoresEscapados = valores.map(v => `'${v.replace(/'/g, "''")}'`);
          conditions.push(`${campo} IN (${valoresEscapados.join(',')})`);
        }
      });
    }

    // Filtro de período temporal
    if (periodo1?.ano && variavelSelecionada.tipoData === 'separados') {
      if (variavelSelecionada.campoAno) {
        conditions.push(`${variavelSelecionada.campoAno} = ${periodo1.ano}`);
      }

      if (variavelSelecionada.campoMes && periodo1.meses?.length > 0) {
        const mesesFormatados = periodo1.meses.map(m => {
          const mesStr = String(m).padStart(2, '0');
          return `'${periodo1.ano}-${mesStr}'`;
        });
        conditions.push(`${variavelSelecionada.campoMes} IN (${mesesFormatados.join(',')})`);
      }
    }

    return conditions.length > 0 ? conditions.join(' AND ') : '1=1';
  };

  fetchUniqueValues = async (url: string, fieldName: string, whereClause: string = '1=1'): Promise<string[]> => {
    const { authToken } = this.props;
    const queryUrl = `${url}/query?where=${encodeURIComponent(whereClause)}&returnGeometry=false&outFields=${fieldName}&returnDistinctValues=true&f=json${authToken ? `&token=${authToken}` : ''}`;

    const response = await fetch(queryUrl);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Erro ao buscar valores únicos');
    }

    const values = data.features
      .map((f: any) => f.attributes[fieldName])
      .filter((v: any) => v !== null && v !== undefined && v !== '')
      .map((v: any) => String(v)) // Converter para string
      .sort();

    return values;
  };

  handleTogglePanel = (campo: string) => {
    this.setState(prev => {
      const isExpanded = prev.expandedPanels.includes(campo);
      return {
        expandedPanels: isExpanded
          ? prev.expandedPanels.filter(p => p !== campo)
          : [...prev.expandedPanels, campo]
      };
    });
  };

  handleCheckboxChange = (campo: string, value: string, checked: boolean) => {
    const { filterValues, onChange } = this.props;
    const currentValues = filterValues[campo] || [];

    let newValues: string[];
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }

    onChange({
      ...filterValues,
      [campo]: newValues
    });
  };

  handleToggleTodos = (campo: string) => {
    const { filterValues, onChange } = this.props;
    const { uniqueValues } = this.state;

    const currentValues = filterValues[campo] || [];
    const allValues = uniqueValues[campo] || [];

    // Se todos estão selecionados, desselecionar todos. Caso contrário, selecionar todos
    const newValues = currentValues.length === allValues.length ? [] : [...allValues];

    onChange({
      ...filterValues,
      [campo]: newValues
    });
  };

  render() {
    const { variavelSelecionada, filterValues } = this.props;
    const { uniqueValues, loadingFields, expandedPanels } = this.state;

    if (!variavelSelecionada) {
      return (
        <div css={{
          padding: '12px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#6c757d',
          textAlign: 'center'
        }}>
          Selecione uma variável primeiro
        </div>
      );
    }

    if (!variavelSelecionada.camposFiltro || variavelSelecionada.camposFiltro.length === 0) {
      return (
        <div css={{
          padding: '12px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#856404',
          textAlign: 'center'
        }}>
          ⚠️ Nenhum campo de filtro configurado para esta variável
        </div>
      );
    }

    return (
      <div className="dynamic-filters">
        <label css={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '13px',
          fontWeight: 500
        }}>
          Filtros
        </label>

        {variavelSelecionada.camposFiltro.map((campo) => {
          const values = uniqueValues[campo] || [];
          const selectedValues = filterValues[campo] || [];
          const isLoading = loadingFields[campo];
          const isExpanded = expandedPanels.includes(campo);
          const allSelected = values.length > 0 && selectedValues.length === values.length;

          // Obter alias do campo, se existir
          const alias = variavelSelecionada.camposFiltroAlias?.[campo] || campo;

          return (
            <div
              key={campo}
              css={{
                marginBottom: '12px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                backgroundColor: 'white'
              }}
            >
              {/* Header clicável */}
              <div
                css={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  backgroundColor: '#f8f9fa',
                  borderBottom: isExpanded ? '1px solid #dee2e6' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onClick={() => this.handleTogglePanel(campo)}
              >
                <span css={{ fontSize: '13px', fontWeight: 500 }}>
                  {isExpanded ? '▼' : '▶'} {alias}
                </span>
                <span css={{ fontSize: '11px', color: '#6c757d' }}>
                  {values.length} opções
                </span>
              </div>

              {/* Conteúdo expansível */}
              {isExpanded && (
                <div css={{ padding: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                  {isLoading ? (
                    <div css={{ textAlign: 'center', padding: '12px' }}>
                      <Loading size="sm" />
                      <div css={{ fontSize: '11px', color: '#6c757d', marginTop: '4px' }}>
                        Carregando opções...
                      </div>
                    </div>
                  ) : values.length > 0 ? (
                    <>
                      {/* Opção "Todos" */}
                      <div css={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #dee2e6' }}>
                        <label css={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <Checkbox
                            checked={allSelected}
                            onChange={() => this.handleToggleTodos(campo)}
                          />
                          <span css={{ marginLeft: '8px', fontSize: '12px', fontWeight: 600 }}>
                            Todos
                          </span>
                        </label>
                      </div>

                      {/* Valores únicos */}
                      <div>
                        {values.map(value => (
                          <div key={value} css={{ marginBottom: '6px' }}>
                            <label css={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                              <Checkbox
                                checked={selectedValues.includes(value)}
                                onChange={(e) => this.handleCheckboxChange(campo, value, e.target.checked)}
                              />
                              <span css={{ marginLeft: '8px', fontSize: '12px' }}>
                                {value}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div css={{ fontSize: '11px', color: '#6c757d', textAlign: 'center', padding: '8px' }}>
                      Nenhum valor encontrado
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
}

export default DynamicFilters;
