/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import SymbologyControls from './SymbologyControls';

interface IClassBreak {
  min: number;
  max: number;
  cor: number[];
  label: string;
  largura?: number;
}

interface Props {
  editableClasses: IClassBreak[];
  demoFeatureCount: number;
  onChange: (classes: IClassBreak[]) => void;
  onApply: () => void;
}

/**
 * Aba de simbolização - controles de edição de classes
 */
export const SymbologyTab: React.FC<Props> = ({
  editableClasses,
  demoFeatureCount,
  onChange,
  onApply
}) => {
  return (
    <div css={{ padding: '16px 4px' }}>
      {/* Informação sobre a camada */}
      <div css={{
        padding: '12px',
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '4px',
        marginBottom: '16px',
        fontSize: '12px',
        color: '#004085'
      }}>
        <strong>📍 Camada ativa:</strong> {demoFeatureCount} features no mapa
        <br />
        <span css={{ fontSize: '11px', color: '#6c757d' }}>
          Edite as classes abaixo e clique em "Aplicar" para atualizar o mapa
        </span>
      </div>

      {/* Controles de Simbolização */}
      <SymbologyControls
        classes={editableClasses}
        onChange={onChange}
        onApply={onApply}
        isVisible={true}
      />
    </div>
  );
};
