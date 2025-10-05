/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { SettingSection } from 'jimu-ui/advanced/setting-components';
import { NumericInput, Switch } from 'jimu-ui';
import { IConfiguracaoAvancada } from '../../types';

interface Props {
  configuracaoAvancada: IConfiguracaoAvancada;
  onChange: (field: string, value: any) => void;
}

/**
 * Seção de configurações avançadas
 */
export const AdvancedSettingsSection: React.FC<Props> = ({ configuracaoAvancada, onChange }) => {
  return (
    <SettingSection title="Configurações Avançadas">
      <div css={{ padding: '12px 16px' }}>
        {/* Cache */}
        <div css={{
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <label css={{ fontSize: '13px', fontWeight: 500, display: 'block' }}>
              Habilitar Cache
            </label>
            <small css={{ fontSize: '11px', color: '#6c757d' }}>
              Cachear resultados de queries
            </small>
          </div>
          <Switch
            checked={configuracaoAvancada.cache}
            onChange={(evt) => onChange('cache', evt.target.checked)}
          />
        </div>

        {/* Tempo de Cache */}
        {configuracaoAvancada.cache && (
          <div css={{ marginBottom: '16px' }}>
            <label css={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '12px',
              fontWeight: 500
            }}>
              Tempo de Cache (segundos)
            </label>
            <NumericInput
              value={configuracaoAvancada.tempoCache}
              onChange={(value) => onChange('tempoCache', value)}
              min={60}
              max={3600}
              css={{ width: '100%' }}
            />
          </div>
        )}

        {/* Timeout */}
        <div css={{ marginBottom: '16px' }}>
          <label css={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '12px',
            fontWeight: 500
          }}>
            Timeout de Queries (segundos)
          </label>
          <NumericInput
            value={configuracaoAvancada.timeout}
            onChange={(value) => onChange('timeout', value)}
            min={10}
            max={120}
            css={{ width: '100%' }}
          />
        </div>

        {/* Máximo de Features */}
        <div css={{ marginBottom: '16px' }}>
          <label css={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '12px',
            fontWeight: 500
          }}>
            Máximo de Features
          </label>
          <NumericInput
            value={configuracaoAvancada.maxFeatures}
            onChange={(value) => onChange('maxFeatures', value)}
            min={100}
            max={10000}
            step={100}
            css={{ width: '100%' }}
          />
        </div>

        {/* Zoom Automático */}
        <div css={{
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <label css={{ fontSize: '13px', fontWeight: 500, display: 'block' }}>
              Zoom Automático
            </label>
            <small css={{ fontSize: '11px', color: '#6c757d' }}>
              Zoom para extent das features
            </small>
          </div>
          <Switch
            checked={configuracaoAvancada.zoomAutomatico}
            onChange={(evt) => onChange('zoomAutomatico', evt.target.checked)}
          />
        </div>

        {/* Debug Mode */}
        <div css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <label css={{ fontSize: '13px', fontWeight: 500, display: 'block' }}>
              Modo Debug
            </label>
            <small css={{ fontSize: '11px', color: '#6c757d' }}>
              Exibir logs no console
            </small>
          </div>
          <Switch
            checked={configuracaoAvancada.debugMode}
            onChange={(evt) => onChange('debugMode', evt.target.checked)}
          />
        </div>
      </div>
    </SettingSection>
  );
};
