/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { Label, Radio } from 'jimu-ui';
import { AnalysisMethod } from '../../types';

interface IAnalysisMethodToggleProps {
  selectedMethod: AnalysisMethod;
  onChange: (method: AnalysisMethod) => void;
  label: string;
}

/**
 * Componente para alternar entre métodos de análise:
 * - Sem Variação (análise de um único período)
 * - Com Variação (comparação entre dois períodos)
 */
const AnalysisMethodToggle: React.FC<IAnalysisMethodToggleProps> = ({
  selectedMethod,
  onChange,
  label
}) => {
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    onChange(evt.target.value as AnalysisMethod);
  };

  return (
    <div className="analysis-method-toggle">
      <Label className="mb-2">
        {label}
        <span className="text-danger ml-1">*</span>
      </Label>

      <div className="method-options">
        <div className="form-check mb-2">
          <Radio
            id="method-sem-variacao"
            name="analysisMethod"
            value="sem-variacao"
            checked={selectedMethod === 'sem-variacao'}
            onChange={handleChange}
          />
          <label htmlFor="method-sem-variacao" className="form-check-label ml-2">
            Sem Variação
          </label>
          <small className="d-block text-muted ml-4">
            Análise de um único período temporal
          </small>
        </div>

        <div className="form-check">
          <Radio
            id="method-com-variacao"
            name="analysisMethod"
            value="com-variacao"
            checked={selectedMethod === 'com-variacao'}
            onChange={handleChange}
          />
          <label htmlFor="method-com-variacao" className="form-check-label ml-2">
            Com Variação
          </label>
          <small className="d-block text-muted ml-4">
            Comparação entre dois períodos (cálculo de variação percentual)
          </small>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AnalysisMethodToggle);
