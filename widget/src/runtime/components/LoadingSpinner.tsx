/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { Loading } from 'jimu-ui';

interface ILoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Componente de indicador de carregamento
 * Exibe spinner com mensagem opcional
 */
const LoadingSpinner: React.FC<ILoadingSpinnerProps> = ({
  message = 'A carregar...',
  size = 'md'
}) => {
  return (
    <div
      className="loading-spinner"
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center'
      }}
    >
      <Loading size={size} />
      {message && (
        <p className="mt-3 text-muted" css={{ fontSize: '0.9rem' }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default React.memo(LoadingSpinner);
