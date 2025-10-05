/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { Checkbox, Label, Loading } from 'jimu-ui';

interface IFilterCheckboxGroupProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
  showSelectAll?: boolean;
  selectAllLabel?: string;
  required?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Componente genérico para grupo de checkboxes
 * Usado para filtros como Serviço, Eixo/Linha, etc.
 */
const FilterCheckboxGroup: React.FC<IFilterCheckboxGroupProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  showSelectAll = true,
  selectAllLabel = 'Todos',
  required = false,
  isLoading = false,
  disabled = false
}) => {
  const handleToggleOption = (value: string) => {
    if (disabled) return;

    const newValues = [...selectedValues];
    const index = newValues.indexOf(value);

    if (index > -1) {
      newValues.splice(index, 1);
    } else {
      newValues.push(value);
    }

    onChange(newValues);
  };

  const handleToggleAll = () => {
    if (disabled) return;

    if (todosSelecionados) {
      onChange([]);
    } else {
      onChange(options.map(opt => opt.value));
    }
  };

  const todosSelecionados = selectedValues.length === options.length && options.length > 0;
  const algunsSelecionados = selectedValues.length > 0 && selectedValues.length < options.length;

  if (isLoading) {
    return (
      <div className="filter-checkbox-group">
        <Label className="mb-2">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </Label>
        <div className="d-flex align-items-center">
          <Loading size="sm" />
          <span className="ml-2 text-muted">A carregar opções...</span>
        </div>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="filter-checkbox-group">
        <Label className="mb-2">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </Label>
        <small className="text-muted">Nenhuma opção disponível</small>
      </div>
    );
  }

  return (
    <div className="filter-checkbox-group">
      <Label className="mb-2">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </Label>

      {/* Opção "Todos" */}
      {showSelectAll && (
        <div className="form-check mb-2">
          <Checkbox
            id={`select-all-${label.replace(/\s/g, '-')}`}
            checked={todosSelecionados}
            indeterminate={algunsSelecionados}
            onChange={handleToggleAll}
            disabled={disabled}
          />
          <label
            htmlFor={`select-all-${label.replace(/\s/g, '-')}`}
            className="form-check-label ml-2 font-weight-bold"
            css={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
          >
            {selectAllLabel}
          </label>
        </div>
      )}

      {/* Opções individuais */}
      <div className="options-list" css={{ maxHeight: '200px', overflowY: 'auto' }}>
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          const checkboxId = `${label.replace(/\s/g, '-')}-${option.value}`;

          return (
            <div key={option.value} className="form-check mb-1">
              <Checkbox
                id={checkboxId}
                checked={isSelected}
                onChange={() => handleToggleOption(option.value)}
                disabled={disabled}
              />
              <label
                htmlFor={checkboxId}
                className="form-check-label ml-2"
                css={{
                  fontSize: '0.9rem',
                  cursor: disabled ? 'not-allowed' : 'pointer'
                }}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>

      {/* Contador de selecionados */}
      {selectedValues.length > 0 && (
        <small className="text-muted mt-2 d-block">
          {selectedValues.length} de {options.length} selecionado{selectedValues.length > 1 ? 's' : ''}
        </small>
      )}
    </div>
  );
};

export default React.memo(FilterCheckboxGroup);
