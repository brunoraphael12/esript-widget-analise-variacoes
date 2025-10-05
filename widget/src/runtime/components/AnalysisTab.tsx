/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { Button } from 'jimu-ui';
import { IMConfig, IVariableConfig, AnalysisMethod, ITemporalSelection, IFilterValues } from '../../types';

import VariableSelector from './VariableSelector';
import AnalysisMethodToggle from './AnalysisMethodToggle';
import TemporalSelector from './TemporalSelector';
import DynamicFilters from './DynamicFilters';
import EixoSelector from './EixoSelector';

interface Props {
  config: IMConfig;
  variavelSelecionada: string | null;
  metodoAnalise: AnalysisMethod;
  periodo1: ITemporalSelection;
  periodo2: ITemporalSelection;
  filtros: IFilterValues;
  eixosSelecionados: string[];
  authToken: string | null;
  isBotaoHabilitado: boolean;
  onVariavelChange: (variavelId: string) => void;
  onMetodoChange: (metodo: AnalysisMethod) => void;
  onPeriodo1Change: (periodo: ITemporalSelection) => void;
  onPeriodo2Change: (periodo: ITemporalSelection) => void;
  onFiltrosChange: (filtros: IFilterValues) => void;
  onEixosChange: (eixos: string[]) => void;
  onGerarMapa: () => void;
  variavelConfig: IVariableConfig | null;
}

/**
 * Aba de análise - configuração dos parâmetros de análise
 */
export const AnalysisTab: React.FC<Props> = ({
  config,
  variavelSelecionada,
  metodoAnalise,
  periodo1,
  periodo2,
  filtros,
  eixosSelecionados,
  authToken,
  isBotaoHabilitado,
  onVariavelChange,
  onMetodoChange,
  onPeriodo1Change,
  onPeriodo2Change,
  onFiltrosChange,
  onEixosChange,
  onGerarMapa,
  variavelConfig
}) => {
  return (
    <div css={{ padding: '16px 4px' }}>
      {/* Seleção de Variável */}
      <div className="section" css={{ marginBottom: '20px' }}>
        <VariableSelector
          variaveis={config.variaveis}
          selectedVariavelId={variavelSelecionada}
          onChange={onVariavelChange}
          label={config.textos.labelVariavel}
        />
      </div>

      {/* Método de Análise */}
      <div className="section" css={{ marginBottom: '20px' }}>
        <AnalysisMethodToggle
          selectedMethod={metodoAnalise}
          onChange={onMetodoChange}
          label={config.textos.labelMetodo}
        />
      </div>

      {/* Seleção Temporal - 1º Período */}
      <div className="section" css={{ marginBottom: '20px' }}>
        <TemporalSelector
          selection={periodo1}
          onChange={onPeriodo1Change}
          label={
            metodoAnalise === 'sem-variacao'
              ? config.textos.labelPeriodo
              : config.textos.labelPeriodo1
          }
          labelAno={config.textos.labelAno}
          labelMeses={config.textos.labelMeses}
          variavelSelecionada={variavelConfig}
          authToken={authToken}
          required={true}
        />
      </div>

      {/* Seleção Temporal - 2º Período (apenas Com Variação) */}
      {metodoAnalise === 'com-variacao' && (
        <div className="section" css={{ marginBottom: '20px' }}>
          <TemporalSelector
            selection={periodo2}
            onChange={onPeriodo2Change}
            label={config.textos.labelPeriodo2}
            labelAno={config.textos.labelAno}
            labelMeses={config.textos.labelMeses}
            variavelSelecionada={variavelConfig}
            authToken={authToken}
            required={true}
          />
        </div>
      )}

      {/* Filtros Dinâmicos */}
      <div className="section" css={{ marginBottom: '20px' }}>
        <DynamicFilters
          variavelSelecionada={variavelConfig}
          filterValues={filtros}
          onChange={onFiltrosChange}
          authToken={authToken}
          periodo1={periodo1}
        />
      </div>

      {/* Seletor de Eixos/Linhas */}
      <div className="section" css={{ marginBottom: '20px' }}>
        <EixoSelector
          variavelSelecionada={variavelConfig}
          eixosSelecionados={eixosSelecionados}
          onChange={onEixosChange}
          filterValues={filtros}
          authToken={authToken}
          periodo1={periodo1}
          periodo2={periodo2}
          metodo={metodoAnalise}
        />
      </div>

      {/* Botão Gerar Mapa */}
      <div className="section" css={{ marginTop: '24px' }}>
        <Button
          type="primary"
          onClick={onGerarMapa}
          disabled={!isBotaoHabilitado}
          css={{ width: '100%', height: '40px' }}
        >
          {config.textos.botaoGerar}
        </Button>
      </div>
    </div>
  );
};
