/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { Select, Option, Label } from 'jimu-ui';
import { IVariableConfig } from '../../types';

interface IVariableSelectorProps {
  variaveis: IVariableConfig[];
  selectedVariavelId: string | null;
  onChange: (variavelId: string) => void;
  label: string;
  placeholder?: string;
}

/**
 * Componente para seleção de variável de análise
 * (Oferta, Procura, Paragens, etc.)
 */
const VariableSelector: React.FC<IVariableSelectorProps> = ({
  variaveis,
  selectedVariavelId,
  onChange,
  label,
  placeholder = 'Selecione...'
}) => {
  const handleChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const value = evt.target.value;
    if (value) {
      onChange(value);
    }
  };

  return (
    <div className="variable-selector">
      <Label>
        {label}
        <span className="text-danger ml-1">*</span>
      </Label>
      <Select
        value={selectedVariavelId || ''}
        onChange={handleChange}
        placeholder={placeholder}
        required
      >
        <Option value="">{placeholder}</Option>
        {variaveis.map((variavel) => (
          <Option key={variavel.id} value={variavel.id}>
            {variavel.nome}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default React.memo(VariableSelector);
