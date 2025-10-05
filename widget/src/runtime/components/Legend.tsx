/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { IClassBreak } from '../../types';

interface ILegendProps {
  classes: IClassBreak[];
  title?: string;
  isVisible?: boolean;
}

/**
 * Componente de legenda para visualizar as classes de simbolização
 * Mostra cores, intervalos e labels
 */
const Legend: React.FC<ILegendProps> = ({
  classes,
  title = 'Legenda',
  isVisible = true
}) => {
  if (!isVisible || classes.length === 0) return null;

  const formatNumber = (value: number): string => {
    if (value >= 1000000 || value <= -1000000) {
      return value.toLocaleString('pt-PT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }
    return value.toLocaleString('pt-PT', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const formatRange = (min: number, max: number): string => {
    const minStr = formatNumber(min);
    const maxStr = formatNumber(max);

    if (min <= -999999) {
      return `< ${maxStr}`;
    }
    if (max >= 999999) {
      return `> ${minStr}`;
    }
    return `${minStr} - ${maxStr}`;
  };

  const rgbaToCss = (rgba: number[]): string => {
    return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] / 255})`;
  };

  return (
    <div
      className="legend-component"
      css={{
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #dee2e6',
        marginTop: '12px'
      }}
    >
      <h6 css={{ marginBottom: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
        {title}
      </h6>

      <div className="legend-items">
        {classes.map((classItem, index) => (
          <div
            key={index}
            className="legend-item"
            css={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
              fontSize: '0.85rem'
            }}
          >
            {/* Símbolo de cor */}
            <div
              className="legend-symbol"
              css={{
                width: '24px',
                height: '16px',
                backgroundColor: rgbaToCss(classItem.cor),
                border: '1px solid #999',
                borderRadius: '2px',
                marginRight: '8px',
                flexShrink: 0
              }}
            />

            {/* Label e intervalo */}
            <div css={{ flex: 1, lineHeight: 1.3 }}>
              <div css={{ fontWeight: 500 }}>
                {classItem.label}
              </div>
              <div css={{ color: '#6c757d', fontSize: '0.75rem' }}>
                {formatRange(classItem.min, classItem.max)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contador total */}
      <div
        css={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #dee2e6',
          fontSize: '0.75rem',
          color: '#6c757d'
        }}
      >
        Total de classes: {classes.length}
      </div>
    </div>
  );
};

export default React.memo(Legend);
