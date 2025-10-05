/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { SettingSection } from 'jimu-ui/advanced/setting-components';
import { TextInput, Switch, NumericInput, Button, Loading } from 'jimu-ui';
import { IAuthConfig, IAuthToken } from '../../types';

interface Props {
  autenticacao: IAuthConfig;
  authToken: IAuthToken | null;
  testingAuth: boolean;
  authError: string | null;
  authSuccess: boolean;
  onChange: (field: string, value: any) => void;
  onTestAuth: () => void;
}

/**
 * Seção de configuração de autenticação
 */
export const AuthenticationSection: React.FC<Props> = ({
  autenticacao,
  authToken,
  testingAuth,
  authError,
  authSuccess,
  onChange,
  onTestAuth
}) => {
  return (
    <SettingSection title="Autenticação">
      <div css={{ padding: '12px 16px' }}>
        <p css={{ fontSize: '12px', color: '#6c757d', marginBottom: '16px' }}>
          Configure autenticação caso os serviços REST exijam login
        </p>

        {/* Habilitar Autenticação */}
        <div css={{
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <label css={{ fontSize: '13px', fontWeight: 500, display: 'block' }}>
              Habilitar Autenticação
            </label>
            <small css={{ fontSize: '11px', color: '#6c757d' }}>
              Gera token para acessar serviços protegidos
            </small>
          </div>
          <Switch
            checked={autenticacao?.enabled || false}
            onChange={(evt) => onChange('enabled', evt.target.checked)}
          />
        </div>

        {/* Campos de autenticação */}
        {autenticacao?.enabled && (
          <>
            {/* URL do Portal */}
            <div css={{ marginBottom: '12px' }}>
              <label css={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500
              }}>
                URL do Portal/Server
              </label>
              <TextInput
                value={autenticacao.portalUrl}
                placeholder="https://servidor/arcgis/sharing/rest"
                onChange={(e) => onChange('portalUrl', e.target.value)}
                css={{ width: '100%' }}
              />
              <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
                URL base do ArcGIS Server ou Portal (sem /generateToken)
              </small>
            </div>

            {/* Usuário */}
            <div css={{ marginBottom: '12px' }}>
              <label css={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500
              }}>
                Usuário
              </label>
              <TextInput
                value={autenticacao.username}
                placeholder="usuario"
                onChange={(e) => onChange('username', e.target.value)}
                css={{ width: '100%' }}
              />
            </div>

            {/* Senha */}
            <div css={{ marginBottom: '12px' }}>
              <label css={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500
              }}>
                Senha
              </label>
              <TextInput
                type="password"
                value={autenticacao.password}
                placeholder="••••••••"
                onChange={(e) => onChange('password', e.target.value)}
                css={{ width: '100%' }}
              />
              <small css={{ fontSize: '11px', color: '#dc3545', display: 'block', marginTop: '4px' }}>
                ⚠️ A senha é armazenada em texto simples na configuração
              </small>
            </div>

            {/* Expiração do Token */}
            <div css={{ marginBottom: '16px' }}>
              <label css={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500
              }}>
                Expiração do Token (minutos)
              </label>
              <NumericInput
                value={autenticacao.tokenExpiration || 60}
                onChange={(value) => onChange('tokenExpiration', value)}
                min={15}
                max={1440}
                css={{ width: '100%' }}
              />
              <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
                Padrão: 60 minutos
              </small>
            </div>

            {/* Botão Testar Autenticação */}
            <div css={{ marginBottom: '12px' }}>
              <Button
                type="primary"
                disabled={
                  !autenticacao.portalUrl ||
                  !autenticacao.username ||
                  !autenticacao.password ||
                  testingAuth
                }
                onClick={onTestAuth}
                css={{ width: '100%' }}
              >
                {testingAuth ? (
                  <>
                    <Loading size="sm" css={{ marginRight: '8px' }} />
                    Testando Autenticação...
                  </>
                ) : authSuccess ? (
                  <>✓ Testar Autenticação</>
                ) : (
                  'Testar Autenticação'
                )}
              </Button>
            </div>

            {/* Mensagens de feedback */}
            {authError && (
              <div css={{
                padding: '8px 12px',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                marginBottom: '12px'
              }}>
                <small css={{ fontSize: '11px', color: '#721c24' }}>
                  ⚠️ {authError}
                </small>
              </div>
            )}

            {authSuccess && !authError && (
              <div css={{
                padding: '8px 12px',
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '4px',
                marginBottom: '12px'
              }}>
                <small css={{ fontSize: '11px', color: '#155724' }}>
                  ✓ Autenticação bem-sucedida! Token válido até{' '}
                  {authToken && new Date(authToken.expires).toLocaleString()}
                </small>
              </div>
            )}
          </>
        )}
      </div>
    </SettingSection>
  );
};
