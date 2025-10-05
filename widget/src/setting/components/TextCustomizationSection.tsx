/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { SettingSection } from 'jimu-ui/advanced/setting-components';
import { TextInput } from 'jimu-ui';
import { ITextos } from '../../types';

interface Props {
  textos: ITextos;
  onChange: (field: string, value: string) => void;
}

/**
 * Seção de personalização de textos da interface
 */
export const TextCustomizationSection: React.FC<Props> = ({ textos, onChange }) => {
  return (
    <SettingSection title="Textos da Interface">
      <div css={{ padding: '12px 16px' }}>
        <div css={{ marginBottom: '12px' }}>
          <label css={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '12px',
            fontWeight: 500
          }}>
            Título
          </label>
          <TextInput
            value={textos.titulo}
            onChange={(e) => onChange('titulo', e.target.value)}
            css={{ width: '100%' }}
          />
        </div>

        <div css={{ marginBottom: '12px' }}>
          <label css={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '12px',
            fontWeight: 500
          }}>
            Subtítulo
          </label>
          <TextInput
            value={textos.subtitulo}
            onChange={(e) => onChange('subtitulo', e.target.value)}
            css={{ width: '100%' }}
          />
        </div>

        <div css={{ marginBottom: '12px' }}>
          <label css={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '12px',
            fontWeight: 500
          }}>
            Texto do Botão
          </label>
          <TextInput
            value={textos.botaoGerar}
            onChange={(e) => onChange('botaoGerar', e.target.value)}
            css={{ width: '100%' }}
          />
        </div>

        <div css={{ marginBottom: '12px' }}>
          <label css={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '12px',
            fontWeight: 500
          }}>
            Mensagem de Sucesso
          </label>
          <TextInput
            value={textos.msgSucesso}
            onChange={(e) => onChange('msgSucesso', e.target.value)}
            css={{ width: '100%' }}
          />
        </div>

        <div css={{ marginBottom: '12px' }}>
          <label css={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '12px',
            fontWeight: 500
          }}>
            Mensagem de Erro
          </label>
          <TextInput
            value={textos.msgErro}
            onChange={(e) => onChange('msgErro', e.target.value)}
            css={{ width: '100%' }}
          />
        </div>

        <div>
          <label css={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '12px',
            fontWeight: 500
          }}>
            Mensagem de Carregamento
          </label>
          <TextInput
            value={textos.msgCarregando}
            onChange={(e) => onChange('msgCarregando', e.target.value)}
            css={{ width: '100%' }}
          />
        </div>
      </div>
    </SettingSection>
  );
};
