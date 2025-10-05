/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { Select, Option, Label, Checkbox, Loading } from 'jimu-ui';
import { ITemporalSelection, IVariableConfig } from '../../types';

interface ITemporalSelectorProps {
  selection: ITemporalSelection;
  onChange: (selection: ITemporalSelection) => void;
  label: string;
  labelAno?: string;
  labelMeses?: string;
  required?: boolean;
  variavelSelecionada: IVariableConfig | null;
  authToken?: string | null;
}

interface State {
  anosDisponiveis: number[];
  mesesDisponiveis: number[];
  loadingAnos: boolean;
  loadingMeses: boolean;
}

const MESES_LABELS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

/**
 * Componente para seleção de período temporal (ano + meses)
 * Carrega anos e meses disponíveis dinamicamente da tabela alfanumérica
 */
class TemporalSelector extends React.PureComponent<ITemporalSelectorProps, State> {
  constructor(props: ITemporalSelectorProps) {
    super(props);

    this.state = {
      anosDisponiveis: [],
      mesesDisponiveis: [],
      loadingAnos: false,
      loadingMeses: false
    };
  }

  componentDidMount() {
    this.loadAnosDisponiveis();
  }

  componentDidUpdate(prevProps: ITemporalSelectorProps) {
    if (this.props.variavelSelecionada?.id !== prevProps.variavelSelecionada?.id) {
      this.loadAnosDisponiveis();
    }

    if (!prevProps.authToken && this.props.authToken) {
      this.loadAnosDisponiveis();
    }

    if (this.props.selection.ano !== prevProps.selection.ano && this.props.selection.ano) {
      this.loadMesesDisponiveis();
    }
  }

  loadAnosDisponiveis = async () => {
    const { variavelSelecionada, authToken } = this.props;

    if (!variavelSelecionada || !variavelSelecionada.urlAlfanumerico) {
      return;
    }

    if (variavelSelecionada.tipoData === 'separados' && !variavelSelecionada.campoAno) {
      return;
    }

    this.setState({ loadingAnos: true });

    try {
      const campoAno = variavelSelecionada.tipoData === 'separados'
        ? variavelSelecionada.campoAno
        : variavelSelecionada.campoData;

      if (!campoAno) {
        this.setState({ loadingAnos: false });
        return;
      }

      const anos = await this.fetchUniqueValues(
        variavelSelecionada.urlAlfanumerico,
        campoAno,
        authToken
      );

      const anosNum = anos
        .map(a => {
          if (variavelSelecionada.tipoData === 'unico') {
            const date = new Date(a);
            return date.getFullYear();
          }
          return parseInt(a, 10);
        })
        .filter(a => !isNaN(a))
        .sort((a, b) => b - a);

      const anosUnicos = [...new Set(anosNum)];

      this.setState({ anosDisponiveis: anosUnicos, loadingAnos: false });

      if (this.props.selection.ano) {
        this.loadMesesDisponiveis();
      }
    } catch (error) {
      console.error('[TemporalSelector] Erro ao carregar anos:', error);
      this.setState({ loadingAnos: false });
    }
  };

  loadMesesDisponiveis = async () => {
    const { variavelSelecionada, authToken, selection } = this.props;

    if (!variavelSelecionada || !variavelSelecionada.urlAlfanumerico || !selection.ano) {
      return;
    }

    if (variavelSelecionada.tipoData !== 'separados' || !variavelSelecionada.campoMes) {
      this.setState({ mesesDisponiveis: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] });
      return;
    }

    this.setState({ loadingMeses: true });

    try {
      const whereClause = `${variavelSelecionada.campoAno} = ${selection.ano}`;

      const meses = await this.fetchUniqueValuesWithWhere(
        variavelSelecionada.urlAlfanumerico,
        variavelSelecionada.campoMes,
        whereClause,
        authToken
      );

      const mesesNum = meses
        .map(m => {
          if (m.includes('-')) {
            const parts = m.split('-');
            return parseInt(parts[parts.length - 1], 10);
          }
          if (m.includes('/')) {
            const parts = m.split('/');
            return parseInt(parts[parts.length - 1], 10);
          }
          return parseInt(m, 10);
        })
        .filter(m => !isNaN(m) && m >= 1 && m <= 12)
        .sort((a, b) => a - b);

      this.setState({ mesesDisponiveis: mesesNum, loadingMeses: false });
    } catch (error) {
      console.error('[TemporalSelector] Erro ao carregar meses:', error);
      this.setState({
        mesesDisponiveis: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        loadingMeses: false
      });
    }
  };

  fetchUniqueValues = async (
    url: string,
    fieldName: string,
    authToken?: string | null
  ): Promise<string[]> => {
    const queryUrl = `${url}/query?where=1=1&returnGeometry=false&outFields=${fieldName}&returnDistinctValues=true&orderByFields=${fieldName} DESC&f=json${authToken ? `&token=${authToken}` : ''}`;

    const response = await fetch(queryUrl);
    const data = await response.json();

    if (data.error) {
      console.error('[TemporalSelector] Erro na query:', data.error);
      throw new Error(data.error.message || 'Erro ao buscar valores únicos');
    }

    return data.features
      .map((f: any) => f.attributes[fieldName])
      .filter((v: any) => v !== null && v !== undefined && v !== '')
      .map((v: any) => String(v));
  };

  fetchUniqueValuesWithWhere = async (
    url: string,
    fieldName: string,
    whereClause: string,
    authToken?: string | null
  ): Promise<string[]> => {
    const queryUrl = `${url}/query?where=${encodeURIComponent(whereClause)}&returnGeometry=false&outFields=${fieldName}&returnDistinctValues=true&orderByFields=${fieldName}&f=json${authToken ? `&token=${authToken}` : ''}`;

    const response = await fetch(queryUrl);
    const data = await response.json();

    if (data.error) {
      console.error('[TemporalSelector] Erro na query:', data.error);
      throw new Error(data.error.message || 'Erro ao buscar valores únicos');
    }

    return data.features
      .map((f: any) => f.attributes[fieldName])
      .filter((v: any) => v !== null && v !== undefined && v !== '')
      .map((v: any) => String(v));
  };

  handleAnoChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const ano = evt.target.value ? parseInt(evt.target.value, 10) : null;
    this.props.onChange({
      ...this.props.selection,
      ano,
      meses: [] // Limpar meses ao mudar ano
    });
  };

  handleMesToggle = (mesValue: number) => {
    const { selection, onChange } = this.props;
    const meses = [...selection.meses];
    const index = meses.indexOf(mesValue);

    if (index > -1) {
      meses.splice(index, 1);
    } else {
      meses.push(mesValue);
    }

    onChange({
      ...selection,
      meses: meses.sort((a, b) => a - b)
    });
  };

  handleTodosToggle = () => {
    const { selection, onChange } = this.props;
    const { mesesDisponiveis } = this.state;

    if (selection.meses.length === mesesDisponiveis.length) {
      onChange({
        ...selection,
        meses: []
      });
    } else {
      onChange({
        ...selection,
        meses: [...mesesDisponiveis]
      });
    }
  };

  render() {
    const { selection, label, labelAno = 'Ano', labelMeses = 'Meses', required = false } = this.props;
    const { anosDisponiveis, mesesDisponiveis, loadingAnos, loadingMeses } = this.state;

    const todosSelecionados = mesesDisponiveis.length > 0 && selection.meses.length === mesesDisponiveis.length;
    const algunsSelecionados = selection.meses.length > 0 && selection.meses.length < mesesDisponiveis.length;

    return (
      <div className="temporal-selector">
        <Label className="mb-2">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </Label>

        {/* Seletor de Ano */}
        <div className="mb-3">
          <Label className="mb-1">{labelAno}</Label>
          {loadingAnos ? (
            <div css={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loading size="sm" />
              <span css={{ fontSize: '12px', color: '#6c757d' }}>Carregando anos...</span>
            </div>
          ) : (
            <Select
              value={selection.ano?.toString() || ''}
              onChange={this.handleAnoChange}
              placeholder="Selecione o ano"
            >
              <Option value="">Selecione...</Option>
              {anosDisponiveis.map((ano) => (
                <Option key={ano} value={ano.toString()}>
                  {ano}
                </Option>
              ))}
            </Select>
          )}
        </div>

        {/* Checkboxes de Meses */}
        {selection.ano && (
          <div>
            <Label className="mb-2">{labelMeses}</Label>

            {loadingMeses ? (
              <div css={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loading size="sm" />
                <span css={{ fontSize: '12px', color: '#6c757d' }}>Carregando meses...</span>
              </div>
            ) : (
              <>
                {/* Opção "Todos" */}
                <div className="form-check mb-2">
                  <Checkbox
                    id={`todos-meses-${label.replace(/\s/g, '-')}`}
                    checked={todosSelecionados}
                    indeterminate={algunsSelecionados}
                    onChange={this.handleTodosToggle}
                  />
                  <label
                    htmlFor={`todos-meses-${label.replace(/\s/g, '-')}`}
                    className="form-check-label ml-2 font-weight-bold"
                  >
                    Todos os meses
                  </label>
                </div>

                {/* Grid de meses */}
                <div className="meses-grid" css={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px'
                }}>
                  {MESES_LABELS.map((mes) => {
                    const isSelected = selection.meses.includes(mes.value);
                    const isDisponivel = mesesDisponiveis.includes(mes.value);
                    return (
                      <div key={mes.value} className="form-check">
                        <Checkbox
                          id={`mes-${mes.value}-${label.replace(/\s/g, '-')}`}
                          checked={isSelected}
                          disabled={!isDisponivel}
                          onChange={() => this.handleMesToggle(mes.value)}
                        />
                        <label
                          htmlFor={`mes-${mes.value}-${label.replace(/\s/g, '-')}`}
                          className="form-check-label ml-2"
                          css={{
                            fontSize: '0.9rem',
                            opacity: isDisponivel ? 1 : 0.5,
                            cursor: isDisponivel ? 'pointer' : 'not-allowed'
                          }}
                        >
                          {mes.label}
                        </label>
                      </div>
                    );
                  })}
                </div>

                {/* Contador de meses selecionados */}
                {selection.meses.length > 0 && (
                  <small className="text-muted mt-2 d-block">
                    {selection.meses.length} {selection.meses.length === 1 ? 'mês' : 'meses'} selecionado{selection.meses.length > 1 ? 's' : ''}
                  </small>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default TemporalSelector;
