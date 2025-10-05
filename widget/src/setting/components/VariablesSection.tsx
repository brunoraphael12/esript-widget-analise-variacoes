/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { SettingSection } from 'jimu-ui/advanced/setting-components';
import { Button } from 'jimu-ui';
import { IVariableConfig, IFieldInfo } from '../../types';
import { VariableCard } from './VariableCard';

interface Props {
  variaveis: IVariableConfig[];
  camposGeoDisponiveis: { [index: number]: IFieldInfo[] };
  camposAlfaDisponiveis: { [index: number]: IFieldInfo[] };
  loadingCamposGeo: { [index: number]: boolean };
  loadingCamposAlfa: { [index: number]: boolean };
  errorCamposGeo: { [index: number]: string | null };
  errorCamposAlfa: { [index: number]: string | null };
  successCamposGeo: { [index: number]: boolean };
  successCamposAlfa: { [index: number]: boolean };
  onVariavelChange: (index: number, field: string, value: any) => void;
  onAdicionarVariavel: () => void;
  onRemoverVariavel: (index: number) => void;
  onFetchCamposGeo: (index: number) => void;
  onFetchCamposAlfa: (index: number) => void;
}

/**
 * Seção de configuração de variáveis
 */
export const VariablesSection: React.FC<Props> = ({
  variaveis,
  camposGeoDisponiveis,
  camposAlfaDisponiveis,
  loadingCamposGeo,
  loadingCamposAlfa,
  errorCamposGeo,
  errorCamposAlfa,
  successCamposGeo,
  successCamposAlfa,
  onVariavelChange,
  onAdicionarVariavel,
  onRemoverVariavel,
  onFetchCamposGeo,
  onFetchCamposAlfa
}) => {
  return (
    <SettingSection title="Variáveis">
      <div css={{ padding: '8px 12px' }}>
        <p css={{ fontSize: '11px', color: '#6c757d', marginBottom: '8px' }}>
          Configure as variáveis de análise
        </p>
        <Button
          type="primary"
          size="sm"
          onClick={onAdicionarVariavel}
          css={{ width: '100%', marginBottom: '12px' }}
        >
          + Adicionar Variável
        </Button>

        {variaveis.map((variavel, index) => (
          <VariableCard
            key={variavel.id}
            variavel={variavel}
            index={index}
            canRemove={variaveis.length > 1}
            camposGeoDisponiveis={camposGeoDisponiveis[index] || []}
            camposAlfaDisponiveis={camposAlfaDisponiveis[index] || []}
            loadingCamposGeo={loadingCamposGeo[index] || false}
            loadingCamposAlfa={loadingCamposAlfa[index] || false}
            errorCamposGeo={errorCamposGeo[index] || null}
            errorCamposAlfa={errorCamposAlfa[index] || null}
            successCamposGeo={successCamposGeo[index] || false}
            successCamposAlfa={successCamposAlfa[index] || false}
            onChange={onVariavelChange}
            onRemove={onRemoverVariavel}
            onFetchCamposGeo={onFetchCamposGeo}
            onFetchCamposAlfa={onFetchCamposAlfa}
          />
        ))}
      </div>
    </SettingSection>
  );
};
