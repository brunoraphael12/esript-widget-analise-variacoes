/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { TextInput, Select, Option, Button, Loading, Checkbox } from 'jimu-ui';
import { IVariableConfig, IFieldInfo } from '../../types';

interface Props {
  variavel: IVariableConfig;
  index: number;
  canRemove: boolean;
  camposGeoDisponiveis: IFieldInfo[];
  camposAlfaDisponiveis: IFieldInfo[];
  loadingCamposGeo: boolean;
  loadingCamposAlfa: boolean;
  errorCamposGeo: string | null;
  errorCamposAlfa: string | null;
  successCamposGeo: boolean;
  successCamposAlfa: boolean;
  onChange: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  onFetchCamposGeo: (index: number) => void;
  onFetchCamposAlfa: (index: number) => void;
}

/**
 * Card de configuração de uma variável individual
 */
export const VariableCard: React.FC<Props> = ({
  variavel,
  index,
  canRemove,
  camposGeoDisponiveis,
  camposAlfaDisponiveis,
  loadingCamposGeo,
  loadingCamposAlfa,
  errorCamposGeo,
  errorCamposAlfa,
  successCamposGeo,
  successCamposAlfa,
  onChange,
  onRemove,
  onFetchCamposGeo,
  onFetchCamposAlfa
}) => {
  return (
    <div css={{
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '1px solid #dee2e6'
    }}>
      {/* Cabeçalho */}
      <div css={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <h6 css={{
          margin: 0,
          fontSize: '13px',
          fontWeight: 600,
          color: '#212529'
        }}>
          {variavel.nome || `Variável ${index + 1}`}
        </h6>
        <Button
          type="danger"
          size="sm"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          title={!canRemove ? 'Não é possível remover a última variável' : 'Remover variável'}
          css={{ width: '100%' }}
        >
          🗑️ Remover Variável
        </Button>
      </div>

      {/* Nome */}
      <div css={{ marginBottom: '12px' }}>
        <label css={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '12px',
          fontWeight: 500
        }}>
          Nome
        </label>
        <TextInput
          value={variavel.nome}
          placeholder="Ex: Oferta, Procura, Paragens..."
          onChange={(e) => onChange(index, 'nome', e.target.value)}
          css={{ width: '100%' }}
        />
      </div>

      {/* Tipo de Geometria */}
      <div css={{ marginBottom: '12px' }}>
        <label css={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '12px',
          fontWeight: 500
        }}>
          Tipo de Geometria
        </label>
        <Select
          value={variavel.tipo}
          onChange={(e) => onChange(index, 'tipo', e.target.value)}
          css={{ width: '100%' }}
        >
          <Option value="ponto">Ponto</Option>
          <Option value="linha">Linha</Option>
          <Option value="poligono">Polígono</Option>
        </Select>
        <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
          Tipo de geometria da camada geográfica
        </small>
      </div>

      {/* URL Geográfico */}
      <div css={{ marginBottom: '12px' }}>
        <label css={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '12px',
          fontWeight: 500
        }}>
          URL Geográfico
        </label>
        <TextInput
          value={variavel.urlGeografico}
          placeholder="https://servidor/rest/.../FeatureServer/0"
          onChange={(e) => onChange(index, 'urlGeografico', e.target.value)}
          css={{ width: '100%', marginBottom: '6px' }}
        />
        <Button
          size="sm"
          type="tertiary"
          disabled={!variavel.urlGeografico || loadingCamposGeo}
          onClick={() => onFetchCamposGeo(index)}
          css={{ width: '100%' }}
        >
          {loadingCamposGeo ? (
            <>
              <Loading size="sm" css={{ marginRight: '4px' }} />
              Testando Conexão...
            </>
          ) : successCamposGeo ? (
            <>✓ Carregar Campos</>
          ) : (
            'Carregar Campos'
          )}
        </Button>
        {errorCamposGeo && (
          <small css={{ fontSize: '11px', color: '#dc3545', display: 'block', marginTop: '4px' }}>
            ⚠️ {errorCamposGeo}
          </small>
        )}
        {successCamposGeo && !errorCamposGeo && (
          <small css={{ fontSize: '11px', color: '#28a745', display: 'block', marginTop: '4px' }}>
            ✓ {camposGeoDisponiveis?.length || 0} campos carregados
          </small>
        )}
        <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
          Feature Layer com geometrias
        </small>
      </div>

      {/* URL Alfanumérico */}
      <div css={{ marginBottom: '12px' }}>
        <label css={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '12px',
          fontWeight: 500
        }}>
          URL Alfanumérico
        </label>
        <TextInput
          value={variavel.urlAlfanumerico}
          placeholder="https://servidor/rest/.../MapServer/0"
          onChange={(e) => onChange(index, 'urlAlfanumerico', e.target.value)}
          css={{ width: '100%', marginBottom: '6px' }}
        />
        <Button
          size="sm"
          type="tertiary"
          disabled={!variavel.urlAlfanumerico || loadingCamposAlfa}
          onClick={() => onFetchCamposAlfa(index)}
          css={{ width: '100%' }}
        >
          {loadingCamposAlfa ? (
            <>
              <Loading size="sm" css={{ marginRight: '4px' }} />
              Testando Conexão...
            </>
          ) : successCamposAlfa ? (
            <>✓ Carregar Campos</>
          ) : (
            'Carregar Campos'
          )}
        </Button>
        {errorCamposAlfa && (
          <small css={{ fontSize: '11px', color: '#dc3545', display: 'block', marginTop: '4px' }}>
            ⚠️ {errorCamposAlfa}
          </small>
        )}
        {successCamposAlfa && !errorCamposAlfa && (
          <small css={{ fontSize: '11px', color: '#28a745', display: 'block', marginTop: '4px' }}>
            ✓ {camposAlfaDisponiveis?.length || 0} campos carregados
          </small>
        )}
        <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
          Tabela com dados temporais
        </small>
      </div>

      {/* Campo de Ligação (Geográfico) */}
      <div css={{ marginBottom: '12px' }}>
        <label css={{
          display: 'block',
          marginBottom: '4px',
          fontSize: '11px',
          fontWeight: 500
        }}>
          Campo Ligação (Geo)
        </label>

        {camposGeoDisponiveis?.length > 0 ? (
          <Select
            value={variavel.codigoLigacao}
            onChange={(e) => onChange(index, 'codigoLigacao', e.target.value)}
            css={{ width: '100%' }}
          >
            <Option value="">Selecione um campo</Option>
            {camposGeoDisponiveis
              .filter(f => f.type !== 'esriFieldTypeGeometry')
              .map(field => (
                <Option key={field.name} value={field.name}>
                  {field.alias || field.name} [{field.name}]
                  {field.type && ` - ${field.type.replace('esriFieldType', '')}`}
                </Option>
              ))
            }
          </Select>
        ) : (
          <TextInput
            value={variavel.codigoLigacao}
            placeholder="Clique em 'Testar' na URL Geográfico primeiro"
            onChange={(e) => onChange(index, 'codigoLigacao', e.target.value)}
            css={{ width: '100%' }}
            disabled={!variavel.urlGeografico}
          />
        )}

        <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
          Campo da camada geográfica para JOIN
        </small>
      </div>

      {/* Campo de Ligação (Alfanumérico) */}
      <div css={{ marginBottom: '12px' }}>
        <label css={{
          display: 'block',
          marginBottom: '4px',
          fontSize: '11px',
          fontWeight: 500
        }}>
          Campo Ligação (Alfa)
        </label>

        {camposAlfaDisponiveis?.length > 0 ? (
          <Select
            value={variavel.codigoLigacaoAlfanumerico || variavel.codigoLigacao}
            onChange={(e) => onChange(index, 'codigoLigacaoAlfanumerico', e.target.value)}
            css={{ width: '100%' }}
          >
            <Option value="">Selecione um campo (ou deixe igual ao geográfico)</Option>
            {camposAlfaDisponiveis
              .filter(f => f.type !== 'esriFieldTypeGeometry')
              .map(field => (
                <Option key={field.name} value={field.name}>
                  {field.alias || field.name} [{field.name}]
                  {field.type && ` - ${field.type.replace('esriFieldType', '')}`}
                </Option>
              ))
            }
          </Select>
        ) : (
          <TextInput
            value={variavel.codigoLigacaoAlfanumerico || ''}
            placeholder="Clique em 'Testar' na URL Alfanumérico primeiro"
            onChange={(e) => onChange(index, 'codigoLigacaoAlfanumerico', e.target.value)}
            css={{ width: '100%' }}
            disabled={!variavel.urlAlfanumerico}
          />
        )}

        <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
          Campo da tabela alfanumérica para JOIN (opcional se igual ao geográfico)
        </small>
      </div>

      {/* Campo Eixo/Linha */}
      <div css={{ marginBottom: '12px' }}>
        <label css={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '12px',
          fontWeight: 500
        }}>
          Campo Eixo/Linha
        </label>

        {camposGeoDisponiveis?.length > 0 ? (
          <Select
            value={variavel.campoEixo || ''}
            onChange={(e) => onChange(index, 'campoEixo', e.target.value)}
            css={{ width: '100%' }}
          >
            <Option value="">Selecione um campo</Option>
            {camposGeoDisponiveis
              .filter(f =>
                f.type !== 'esriFieldTypeGeometry' &&
                f.type !== 'esriFieldTypeOID'
              )
              .map(field => (
                <Option key={field.name} value={field.name}>
                  {field.alias || field.name} [{field.name}]
                </Option>
              ))}
          </Select>
        ) : (
          <TextInput
            value={variavel.campoEixo || ''}
            placeholder="Carregue campos da camada geográfica primeiro"
            onChange={(e) => onChange(index, 'campoEixo', e.target.value)}
            css={{ width: '100%' }}
            disabled={!variavel.urlGeografico}
          />
        )}

        <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
          Campo que identifica o eixo/linha para listagem no widget
        </small>
      </div>

      {/* Campo de Valor */}
      <div css={{ marginBottom: '12px' }}>
        <label css={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '12px',
          fontWeight: 500
        }}>
          Campo de Valor
        </label>

        {camposAlfaDisponiveis?.length > 0 ? (
          <Select
            value={variavel.campoValor}
            onChange={(e) => onChange(index, 'campoValor', e.target.value)}
            css={{ width: '100%' }}
          >
            <Option value="">Selecione um campo</Option>
            {camposAlfaDisponiveis
              .filter(f =>
                f.type === 'esriFieldTypeInteger' ||
                f.type === 'esriFieldTypeDouble' ||
                f.type === 'esriFieldTypeSmallInteger' ||
                f.type === 'esriFieldTypeSingle'
              )
              .map(field => (
                <Option key={field.name} value={field.name}>
                  {field.alias || field.name} [{field.name}]
                  {field.type && ` - ${field.type.replace('esriFieldType', '')}`}
                </Option>
              ))
            }
          </Select>
        ) : (
          <TextInput
            value={variavel.campoValor}
            placeholder="Clique em 'Testar' na URL Alfanumérico primeiro"
            onChange={(e) => onChange(index, 'campoValor', e.target.value)}
            css={{ width: '100%' }}
            disabled={!variavel.urlAlfanumerico}
          />
        )}

        <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '4px' }}>
          Campo numérico a ser analisado
        </small>
      </div>

      {/* Configuração de Data */}
      <div css={{ marginBottom: '12px' }}>
        <label css={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '12px',
          fontWeight: 500
        }}>
          Configuração de Data
        </label>

        <div css={{ marginBottom: '8px' }}>
          <label css={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '11px', marginBottom: '6px' }}>
            <input
              type="radio"
              checked={variavel.tipoData === 'separados' || !variavel.tipoData}
              onChange={() => onChange(index, 'tipoData', 'separados')}
            />
            <span css={{ marginLeft: '6px' }}>Campos Separados (Ano + Mês)</span>
          </label>
          <label css={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '11px' }}>
            <input
              type="radio"
              checked={variavel.tipoData === 'unico'}
              onChange={() => onChange(index, 'tipoData', 'unico')}
            />
            <span css={{ marginLeft: '6px' }}>Campo Único (Data)</span>
          </label>
        </div>

        {/* Campos Separados */}
        {(variavel.tipoData === 'separados' || !variavel.tipoData) && (
          <div css={{ marginBottom: '8px' }}>
            <div css={{ marginBottom: '8px' }}>
              <label css={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 500 }}>
                Campo Ano
              </label>
              {camposAlfaDisponiveis?.length > 0 ? (
                <Select
                  value={variavel.campoAno || ''}
                  onChange={(e) => onChange(index, 'campoAno', e.target.value)}
                  css={{ width: '100%' }}
                >
                  <Option value="">Selecione</Option>
                  {camposAlfaDisponiveis
                    .filter(f =>
                      f.type !== 'esriFieldTypeGeometry' &&
                      f.type !== 'esriFieldTypeOID'
                    )
                    .map(field => (
                      <Option key={field.name} value={field.name}>
                        {field.alias || field.name} [{field.name}]
                      </Option>
                    ))}
                </Select>
              ) : (
                <TextInput
                  value={variavel.campoAno || ''}
                  placeholder="Carregue campos"
                  onChange={(e) => onChange(index, 'campoAno', e.target.value)}
                  css={{ width: '100%' }}
                  disabled={!variavel.urlAlfanumerico}
                />
              )}
            </div>

            <div>
              <label css={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 500 }}>
                Campo Mês
              </label>
              {camposAlfaDisponiveis?.length > 0 ? (
                <Select
                  value={variavel.campoMes || ''}
                  onChange={(e) => onChange(index, 'campoMes', e.target.value)}
                  css={{ width: '100%' }}
                >
                  <Option value="">Selecione</Option>
                  {camposAlfaDisponiveis
                    .filter(f =>
                      f.type !== 'esriFieldTypeGeometry' &&
                      f.type !== 'esriFieldTypeOID'
                    )
                    .map(field => (
                      <Option key={field.name} value={field.name}>
                        {field.alias || field.name} [{field.name}]
                      </Option>
                    ))}
                </Select>
              ) : (
                <TextInput
                  value={variavel.campoMes || ''}
                  placeholder="Carregue campos"
                  onChange={(e) => onChange(index, 'campoMes', e.target.value)}
                  css={{ width: '100%' }}
                  disabled={!variavel.urlAlfanumerico}
                />
              )}
            </div>
          </div>
        )}

        {/* Campo Único (Data) */}
        {variavel.tipoData === 'unico' && (
          <div css={{ marginBottom: '8px' }}>
            <label css={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 500 }}>
              Campo Data
            </label>
            {camposAlfaDisponiveis?.length > 0 ? (
              <Select
                value={variavel.campoData || ''}
                onChange={(e) => onChange(index, 'campoData', e.target.value)}
                css={{ width: '100%' }}
              >
                <Option value="">Selecione</Option>
                {camposAlfaDisponiveis
                  .filter(f =>
                    (f.type === 'esriFieldTypeDate' || f.type.includes('Date')) &&
                    f.type !== 'esriFieldTypeOID'
                  )
                  .map(field => (
                    <Option key={field.name} value={field.name}>
                      {field.alias || field.name} [{field.name}]
                    </Option>
                  ))}
              </Select>
            ) : (
              <TextInput
                value={variavel.campoData || ''}
                placeholder="Carregue campos"
                onChange={(e) => onChange(index, 'campoData', e.target.value)}
                css={{ width: '100%' }}
                disabled={!variavel.urlAlfanumerico}
              />
            )}
          </div>
        )}

        <small css={{ fontSize: '11px', color: '#6c757d', display: 'block' }}>
          Filtrar dados por período temporal
        </small>
      </div>

      {/* Campos para Filtro */}
      <div css={{ marginBottom: '0' }}>
        <label css={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '12px',
          fontWeight: 500
        }}>
          Campos para Filtro ({variavel.camposFiltro?.length || 0} selecionados)
        </label>

        {camposAlfaDisponiveis?.length > 0 ? (
          <div css={{ maxHeight: '300px', overflowY: 'auto' }}>
            {camposAlfaDisponiveis
              .filter(f =>
                f.type !== 'esriFieldTypeGeometry' &&
                f.type !== 'esriFieldTypeOID' &&
                f.name !== variavel.campoValor &&
                f.name !== variavel.codigoLigacaoAlfanumerico &&
                f.name !== variavel.codigoLigacao
              )
              .map(field => {
                const isSelected = variavel.camposFiltro?.includes(field.name) || false;
                const currentAlias = variavel.camposFiltroAlias?.[field.name] || '';

                return (
                  <div
                    key={field.name}
                    css={{
                      padding: '8px',
                      marginBottom: '6px',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      border: `1px solid ${isSelected ? '#28a745' : '#dee2e6'}`,
                      borderLeft: isSelected ? '3px solid #28a745' : '1px solid #dee2e6'
                    }}
                  >
                    <div css={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: isSelected ? '8px' : '0',
                      gap: '8px'
                    }}>
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          let novosCampos = [...(variavel.camposFiltro || [])];

                          if (checked) {
                            novosCampos.push(field.name);
                          } else {
                            novosCampos = novosCampos.filter(c => c !== field.name);
                          }

                          onChange(index, 'camposFiltro', novosCampos);
                        }}
                      />
                      <div css={{ flex: 1, fontSize: '11px' }}>
                        <div css={{ fontWeight: 500 }}>{field.alias || field.name}</div>
                        {field.alias && (
                          <div css={{ color: '#6c757d', fontSize: '10px' }}>{field.name}</div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div css={{ paddingLeft: '32px' }}>
                        <label css={{
                          display: 'block',
                          fontSize: '10px',
                          color: '#6c757d',
                          marginBottom: '4px'
                        }}>
                          Apelido para exibição:
                        </label>
                        <TextInput
                          value={currentAlias}
                          placeholder={field.alias || field.name}
                          onChange={(e) => {
                            const aliases = {
                              ...(variavel.camposFiltroAlias || {}),
                              [field.name]: e.target.value
                            };
                            onChange(index, 'camposFiltroAlias', aliases);
                          }}
                          css={{
                            width: '100%',
                            fontSize: '11px',
                            padding: '4px 8px'
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          <div css={{
            padding: '12px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#6c757d',
            textAlign: 'center'
          }}>
            Carregue os campos da URL Alfanumérico primeiro
          </div>
        )}

        <small css={{ fontSize: '11px', color: '#6c757d', display: 'block', marginTop: '6px' }}>
          Defina apelidos amigáveis para exibição no widget
        </small>
      </div>
    </div>
  );
};
