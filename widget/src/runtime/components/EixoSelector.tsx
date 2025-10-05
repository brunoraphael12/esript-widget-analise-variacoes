/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { Checkbox, Loading } from 'jimu-ui';
import { IVariableConfig } from '../../types';

interface IEixoSelectorProps {
  variavelSelecionada: IVariableConfig | null;
  eixosSelecionados: string[];
  onChange: (eixos: string[]) => void;
  filterValues: { [campo: string]: string[] };
  authToken?: string | null;
  periodo1?: { ano: number | null; meses: number[] };
  periodo2?: { ano: number | null; meses: number[] };
  metodo: 'sem-variacao' | 'com-variacao';
}

interface State {
  eixosDisponiveis: string[];
  loading: boolean;
  expanded: boolean;
}

/**
 * Componente seletor de eixos/linhas
 * Carrega valores únicos do campo eixo após aplicar filtros
 */
class EixoSelector extends React.PureComponent<IEixoSelectorProps, State> {
  constructor(props: IEixoSelectorProps) {
    super(props);

    this.state = {
      eixosDisponiveis: [],
      loading: false,
      expanded: true
    };
  }

  componentDidMount() {
    this.loadEixosDisponiveis();
  }

  componentDidUpdate(prevProps: IEixoSelectorProps) {
    // Recarregar se variável mudou
    if (this.props.variavelSelecionada?.id !== prevProps.variavelSelecionada?.id) {
      this.loadEixosDisponiveis();
    }

    // Recarregar se filtros mudaram
    if (JSON.stringify(this.props.filterValues) !== JSON.stringify(prevProps.filterValues)) {
      this.loadEixosDisponiveis();
    }

    // Recarregar se período mudou
    if (JSON.stringify(this.props.periodo1) !== JSON.stringify(prevProps.periodo1)) {
      this.loadEixosDisponiveis();
    }

    // Recarregar se token ficou disponível
    if (!prevProps.authToken && this.props.authToken) {
      this.loadEixosDisponiveis();
    }
  }

  loadEixosDisponiveis = async () => {
    const { variavelSelecionada, authToken, filterValues } = this.props;

    if (!variavelSelecionada || !variavelSelecionada.campoEixo) {
      this.setState({ eixosDisponiveis: [], loading: false });
      return;
    }

    this.setState({ loading: true });

    try {
      const temFiltros = Object.keys(filterValues).some(key => filterValues[key]?.length > 0);

      let eixos: string[];

      if (temFiltros && variavelSelecionada.urlAlfanumerico && variavelSelecionada.codigoLigacao) {
        // Abordagem em 2 etapas:
        // 1. Buscar IDs (codigoLigacao) da tabela alfanumérica que atendem aos filtros
        // 2. Buscar eixos da camada geográfica que correspondem a esses IDs

        const whereClause = this.buildWhereClauseAlfanumerico();
        const campoLigacaoAlfa = variavelSelecionada.codigoLigacaoAlfanumerico || variavelSelecionada.codigoLigacao;

        const ids = await this.fetchUniqueValues(
          variavelSelecionada.urlAlfanumerico,
          campoLigacaoAlfa,
          whereClause,
          authToken
        );

        if (ids.length > 0) {
          const idsStr = ids.map(id => `'${id.replace(/'/g, "''")}'`).join(',');
          const whereGeo = `${variavelSelecionada.codigoLigacao} IN (${idsStr})`;

          eixos = await this.fetchUniqueValues(
            variavelSelecionada.urlGeografico,
            variavelSelecionada.campoEixo,
            whereGeo,
            authToken
          );
        } else {
          eixos = [];
        }
      } else {
        eixos = await this.fetchUniqueValues(
          variavelSelecionada.urlGeografico,
          variavelSelecionada.campoEixo,
          '1=1',
          authToken
        );
      }

      this.setState({ eixosDisponiveis: eixos, loading: false });
    } catch (error) {
      console.error('[EixoSelector] Erro ao carregar eixos:', error);
      this.setState({ loading: false });
    }
  };

  buildWhereClauseAlfanumerico = (): string => {
    const { variavelSelecionada, filterValues, periodo1 } = this.props;

    if (!variavelSelecionada) return '1=1';

    const conditions: string[] = [];

    // Filtros dinâmicos (campos da tabela alfanumérica)
    if (variavelSelecionada.camposFiltro && filterValues) {
      variavelSelecionada.camposFiltro.forEach(campo => {
        const valores = filterValues[campo];
        if (valores && valores.length > 0) {
          // Escapar aspas simples nos valores
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
        // Construir valores no formato que existe no banco (ex: '2025-01', '2025-02')
        // ou apenas números (1, 2) dependendo do formato do campo

        // Tentar detectar o formato: se o campo tem '-' no nome, provavelmente é formato 'YYYY-MM'
        // Caso contrário, usar apenas os números
        const mesesFormatados = periodo1.meses.map(m => {
          const mesStr = String(m).padStart(2, '0'); // '01', '02', etc
          return `'${periodo1.ano}-${mesStr}'`; // '2025-01', '2025-02'
        });

        conditions.push(`${variavelSelecionada.campoMes} IN (${mesesFormatados.join(',')})`);
      }
    }

    return conditions.length > 0 ? conditions.join(' AND ') : '1=1';
  };

  fetchUniqueValues = async (
    url: string,
    fieldName: string,
    whereClause: string,
    authToken?: string | null
  ): Promise<string[]> => {
    // Se WHERE clause é muito grande (> 1500 chars), usar POST
    const usePost = whereClause.length > 1500;

    if (usePost) {
      const formData = new URLSearchParams();
      formData.append('where', whereClause);
      formData.append('returnGeometry', 'false');
      formData.append('outFields', fieldName);
      formData.append('returnDistinctValues', 'true');
      formData.append('f', 'json');
      if (authToken) {
        formData.append('token', authToken);
      }

      const response = await fetch(`${url}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      const data = await response.json();

      if (data.error) {
        console.error('[EixoSelector] Erro na resposta:', data.error);
        throw new Error(data.error.message || 'Erro ao buscar valores únicos');
      }

      const values = data.features
        .map((f: any) => f.attributes[fieldName])
        .filter((v: any) => v !== null && v !== undefined && v !== '')
        .map((v: any) => String(v))
        .sort();

      return [...new Set(values)];
    } else {
      const queryUrl = `${url}/query?where=${encodeURIComponent(whereClause)}&returnGeometry=false&outFields=${fieldName}&returnDistinctValues=true&f=json${authToken ? `&token=${authToken}` : ''}`;

      const response = await fetch(queryUrl);
      const data = await response.json();

      if (data.error) {
        console.error('[EixoSelector] Erro na resposta:', data.error);
        throw new Error(data.error.message || 'Erro ao buscar valores únicos');
      }

      const values = data.features
        .map((f: any) => f.attributes[fieldName])
        .filter((v: any) => v !== null && v !== undefined && v !== '')
        .map((v: any) => String(v))
        .sort();

      return [...new Set(values)];
    }
  };

  handleTogglePanel = () => {
    this.setState(prev => ({ expanded: !prev.expanded }));
  };

  handleToggleTodos = () => {
    const { eixosSelecionados, onChange } = this.props;
    const { eixosDisponiveis } = this.state;

    // Se todos estão selecionados, desselecionar todos. Caso contrário, selecionar todos
    const novosEixos = eixosSelecionados.length === eixosDisponiveis.length ? [] : [...eixosDisponiveis];
    onChange(novosEixos);
  };

  handleCheckboxChange = (eixo: string, checked: boolean) => {
    const { eixosSelecionados, onChange } = this.props;

    let novosEixos: string[];
    if (checked) {
      novosEixos = [...eixosSelecionados, eixo];
    } else {
      novosEixos = eixosSelecionados.filter(e => e !== eixo);
    }

    onChange(novosEixos);
  };

  render() {
    const { variavelSelecionada, eixosSelecionados } = this.props;
    const { eixosDisponiveis, loading, expanded } = this.state;

    if (!variavelSelecionada || !variavelSelecionada.campoEixo) {
      return null;
    }

    const allSelected = eixosDisponiveis.length > 0 && eixosSelecionados.length === eixosDisponiveis.length;

    return (
      <div className="eixo-selector" css={{ marginBottom: '16px' }}>
        <label css={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '13px',
          fontWeight: 500
        }}>
          Eixos/Linhas
        </label>

        <div css={{
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          backgroundColor: 'white'
        }}>
          {/* Header clicável */}
          <div
            css={{
              padding: '10px 12px',
              cursor: 'pointer',
              backgroundColor: '#f8f9fa',
              borderBottom: expanded ? '1px solid #dee2e6' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            onClick={this.handleTogglePanel}
          >
            <span css={{ fontSize: '13px', fontWeight: 500 }}>
              {expanded ? '▼' : '▶'} Selecione os eixos
            </span>
            <span css={{ fontSize: '11px', color: '#6c757d' }}>
              {eixosDisponiveis.length} disponíveis
            </span>
          </div>

          {/* Conteúdo expansível */}
          {expanded && (
            <div css={{ padding: '12px', maxHeight: '200px', overflowY: 'auto' }}>
              {loading ? (
                <div css={{ textAlign: 'center', padding: '12px' }}>
                  <Loading size="sm" />
                  <div css={{ fontSize: '11px', color: '#6c757d', marginTop: '4px' }}>
                    Carregando eixos...
                  </div>
                </div>
              ) : eixosDisponiveis.length > 0 ? (
                <>
                  {/* Opção "Todos" */}
                  <div css={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #dee2e6' }}>
                    <label css={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <Checkbox
                        checked={allSelected}
                        onChange={this.handleToggleTodos}
                      />
                      <span css={{ marginLeft: '8px', fontSize: '12px', fontWeight: 600 }}>
                        Todos
                      </span>
                    </label>
                  </div>

                  {/* Lista de eixos */}
                  <div>
                    {eixosDisponiveis.map(eixo => (
                      <div key={eixo} css={{ marginBottom: '6px' }}>
                        <label css={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <Checkbox
                            checked={eixosSelecionados.includes(eixo)}
                            onChange={(e) => this.handleCheckboxChange(eixo, e.target.checked)}
                          />
                          <span css={{ marginLeft: '8px', fontSize: '12px' }}>
                            {eixo}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div css={{ fontSize: '11px', color: '#6c757d', textAlign: 'center', padding: '8px' }}>
                  Nenhum eixo encontrado
                </div>
              )}
            </div>
          )}
        </div>

        <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
          {eixosSelecionados.length} eixo(s) selecionado(s)
        </small>
      </div>
    );
  }
}

export default EixoSelector;
