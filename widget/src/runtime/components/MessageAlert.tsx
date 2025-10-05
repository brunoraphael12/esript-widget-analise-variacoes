/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { Button, Icon } from 'jimu-ui';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface IMessageAlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

/**
 * Componente para exibir mensagens de feedback ao usuário
 * Tipos: success, error, warning, info
 */
const MessageAlert: React.FC<IMessageAlertProps> = ({
  type,
  message,
  onClose,
  showCloseButton = true
}) => {
  const getAlertStyles = () => {
    const baseStyles = {
      padding: '12px 16px',
      borderRadius: '4px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      fontSize: '0.9rem',
      lineHeight: '1.5'
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: '#d4edda',
          color: '#155724',
          borderLeft: '4px solid #28a745'
        };
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderLeft: '4px solid #dc3545'
        };
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: '#fff3cd',
          color: '#856404',
          borderLeft: '4px solid #ffc107'
        };
      case 'info':
        return {
          ...baseStyles,
          backgroundColor: '#d1ecf1',
          color: '#0c5460',
          borderLeft: '4px solid #17a2b8'
        };
      default:
        return baseStyles;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'exclamation-triangle';
      case 'warning':
        return 'exclamation-circle';
      case 'info':
        return 'info-circle';
      default:
        return 'info-circle';
    }
  };

  return (
    <div className={`message-alert alert-${type}`} css={getAlertStyles()}>
      <div css={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
        <Icon
          icon={getIcon()}
          size={18}
          css={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}
        />
        <div css={{ flex: 1 }}>
          {message}
        </div>
      </div>

      {showCloseButton && onClose && (
        <Button
          type="tertiary"
          size="sm"
          icon
          onClick={onClose}
          css={{
            padding: '4px',
            marginLeft: '12px',
            minWidth: 'auto',
            flexShrink: 0
          }}
          aria-label="Fechar mensagem"
        >
          <Icon icon="close" size={14} />
        </Button>
      )}
    </div>
  );
};

export default React.memo(MessageAlert);
