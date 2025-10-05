/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { Button, NumericInput, TextInput, Label, Icon } from 'jimu-ui';
import { IClassBreak } from '../../types';

interface ISymbologyControlsProps {
  classes: IClassBreak[];
  onChange: (classes: IClassBreak[]) => void;
  onApply: () => void;
  isVisible?: boolean;
}

/**
 * Componente para edição dinâmica da simbolização
 * Permite adicionar/remover classes, editar ranges e cores
 */
const SymbologyControls: React.FC<ISymbologyControlsProps> = ({
  classes,
  onChange,
  onApply,
  isVisible = true
}) => {
  if (!isVisible) return null;

  // Converter RGBA array para hex
  const rgbaToHex = (rgba: number[]): string => {
    const [r, g, b] = rgba;
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // Converter hex para RGBA array
  const hexToRgba = (hex: string, alpha: number = 255): number[] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
          alpha
        ]
      : [0, 0, 0, 255];
  };

  const handleClassChange = (index: number, field: keyof IClassBreak, value: any) => {
    const newClasses = [...classes];
    newClasses[index] = {
      ...newClasses[index],
      [field]: value
    };
    onChange(newClasses);
  };

  const handleColorChange = (index: number, hex: string) => {
    const rgba = hexToRgba(hex, classes[index].cor[3] || 255);
    handleClassChange(index, 'cor', rgba);
  };

  const handleAddClass = () => {
    const newClass: IClassBreak = {
      min: 0,
      max: 100,
      cor: [128, 128, 128, 255],
      label: `Nova Classe ${classes.length + 1}`,
      largura: 2
    };
    onChange([...classes, newClass]);
  };

  const handleRemoveClass = (index: number) => {
    if (classes.length <= 1) {
      alert('Deve haver ao menos uma classe');
      return;
    }
    const newClasses = classes.filter((_, i) => i !== index);
    onChange(newClasses);
  };

  return (
    <div
      className="symbology-controls"
      css={{
        backgroundColor: '#f8f9fa',
        padding: '12px',
        borderRadius: '4px',
        marginTop: '16px',
        border: '1px solid #dee2e6'
      }}
    >
      {/* Header */}
      <div
        css={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid #dee2e6'
        }}
      >
        <h6 css={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>
          Controles de Simbolização
        </h6>
        <Button
          type="primary"
          size="sm"
          onClick={onApply}
          css={{ fontSize: '11px', padding: '4px 12px' }}
        >
          Aplicar
        </Button>
      </div>

      {/* Lista de Classes */}
      <div css={{ marginBottom: '12px' }}>
        {classes.map((classItem, index) => (
          <div
            key={index}
            css={{
              marginBottom: '12px',
              padding: '12px',
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '4px'
            }}
          >
            {/* Header da classe */}
            <div
              css={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}
            >
              <span css={{ fontSize: '11px', fontWeight: 600, color: '#495057' }}>
                Classe {index + 1}
              </span>
              <Button
                type="danger"
                size="sm"
                onClick={() => handleRemoveClass(index)}
                disabled={classes.length <= 1}
                title="Remover classe"
                css={{ fontSize: '10px', padding: '2px 8px' }}
              >
                ✕
              </Button>
            </div>

            {/* Label */}
            <div css={{ marginBottom: '8px' }}>
              <Label css={{ fontSize: '10px', marginBottom: '4px', display: 'block' }}>
                Label
              </Label>
              <TextInput
                value={classItem.label}
                onChange={(e) => handleClassChange(index, 'label', e.target.value)}
                css={{ width: '100%', fontSize: '11px' }}
                size="sm"
              />
            </div>

            {/* Min e Max */}
            <div
              css={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginBottom: '8px'
              }}
            >
              <div>
                <Label css={{ fontSize: '10px', marginBottom: '4px', display: 'block' }}>
                  Mínimo
                </Label>
                <NumericInput
                  value={classItem.min === -999999 ? -Infinity : classItem.min}
                  onChange={(value) => handleClassChange(index, 'min', value)}
                  css={{ width: '100%', fontSize: '11px' }}
                  size="sm"
                />
              </div>
              <div>
                <Label css={{ fontSize: '10px', marginBottom: '4px', display: 'block' }}>
                  Máximo
                </Label>
                <NumericInput
                  value={classItem.max === 999999 ? Infinity : classItem.max}
                  onChange={(value) => handleClassChange(index, 'max', value)}
                  css={{ width: '100%', fontSize: '11px' }}
                  size="sm"
                />
              </div>
            </div>

            {/* Cor e Largura */}
            <div
              css={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '8px'
              }}
            >
              <div>
                <Label css={{ fontSize: '10px', marginBottom: '4px', display: 'block' }}>
                  Cor
                </Label>
                <div css={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={rgbaToHex(classItem.cor)}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    css={{
                      width: '40px',
                      height: '28px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                  <code css={{ fontSize: '10px', color: '#6c757d' }}>
                    {rgbaToHex(classItem.cor)}
                  </code>
                </div>
              </div>
              <div>
                <Label css={{ fontSize: '10px', marginBottom: '4px', display: 'block' }}>
                  Largura
                </Label>
                <NumericInput
                  value={classItem.largura || 2}
                  onChange={(value) => handleClassChange(index, 'largura', value)}
                  min={1}
                  max={10}
                  css={{ width: '100%', fontSize: '11px' }}
                  size="sm"
                />
              </div>
            </div>

            {/* Preview da linha */}
            <div css={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
              <div css={{ fontSize: '9px', color: '#6c757d', marginBottom: '4px' }}>
                Preview:
              </div>
              <div
                css={{
                  height: `${classItem.largura || 2}px`,
                  backgroundColor: rgbaToHex(classItem.cor),
                  borderRadius: '1px',
                  maxHeight: '10px'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Botão Adicionar Classe */}
      <Button
        type="secondary"
        size="sm"
        onClick={handleAddClass}
        css={{
          width: '100%',
          fontSize: '11px',
          padding: '6px 12px'
        }}
      >
        + Adicionar Classe
      </Button>

      {/* Info */}
      <div
        css={{
          marginTop: '12px',
          padding: '8px',
          backgroundColor: '#e7f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#004085'
        }}
      >
        💡 <strong>Dica:</strong> Clique em "Aplicar" após fazer alterações para atualizar a camada no mapa.
      </div>
    </div>
  );
};

export default React.memo(SymbologyControls);
