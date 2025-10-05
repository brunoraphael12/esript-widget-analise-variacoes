- Backend validation é adicional (defesa em profundidade)

### 5. Por que remover camada anterior automaticamente?

**Decisão:** Sempre remover camada anterior ao gerar nova

**Razões:**
- Evita confusão com múltiplas camadas
- Performance (menos camadas no mapa)
- UX mais limpa
- Análise focada em resultado atual
- Usuário pode sempre regenerar análise anterior

### 6. Por que 6 classes fixas para análise com variação?

**Decisão:** Classes padrão específicas mas customizáveis

**Razões:**
- Padrão definido pelo cliente/negócio
- Facilita interpretação consistente
- Cores têm significado semântico (vermelho=perda, verde=ganho)
- Customização opcional mantém flexibilidade
- Intervalos fazem sentido para o domínio

### 7. Por que filtros encadeados?

**Decisão:** Eixo/Linha depende de Serviço selecionado

**Razões:**
- Reduz opções irrelevantes
- Melhora UX (menos informação)
- Reflete relação real dos dados
- Evita queries que retornariam vazio
- Performance (menos dados para filtrar)

### 8. Por que soma automática de meses?

**Decisão:** Somar valores quando múltiplos meses selecionados

**Razões:**
- Requisito de negócio explícito
- Análise trimestral/semestral/anual comum
- Simplifica interface (não precisa escolher operação)
- Consistente com expectativas do usuário
- Alternativas (média, máximo) não fazem sentido no domínio

### 9. Por que TypeScript?

**Decisão:** Usar TypeScript ao invés de JavaScript puro

**Razões:**
- Catch de erros em tempo de compilação
- IntelliSense e autocomplete
- Refactoring mais seguro
- Documentação inline (types como docs)
- Padrão do Experience Builder SDK
- Facilita manutenção em longo prazo

### 10. Por que não usar Redux?

**Decisão:** Gerenciar estado com React Hooks (useState, useContext)

**Razões:**
- Widget é componente isolado (não precisa estado global)
- Redux adiciona complexidade desnecessária
- Hooks são suficientes para este escopo
- Menos boilerplate
- Performance adequada
- Mais fácil de entender e manter

---

## DEPENDÊNCIAS E VERSÕES

### Principais Dependências

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "jimu-core": "experience-builder-1.13",
    "jimu-arcgis": "experience-builder-1.13",
    "jimu-ui": "experience-builder-1.13",
    "jimu-for-builder": "experience-builder-1.13",
    "@arcgis/core": "^4.28.0",
    "immutable": "^4.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^4.9.0",
    "eslint": "^8.50.0",
    "prettier": "^3.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

### Módulos Esri Utilizados

```typescript
// Geometrias
import Point from 'esri/geometry/Point';
import Polyline from 'esri/geometry/Polyline';
import Polygon from 'esri/geometry/Polygon';
import Extent from 'esri/geometry/Extent';

// Layers
import FeatureLayer from 'esri/layers/FeatureLayer';
import GraphicsLayer from 'esri/layers/GraphicsLayer';

// Rendering
import SimpleRenderer from 'esri/renderers/SimpleRenderer';
import ClassBreaksRenderer from 'esri/renderers/ClassBreaksRenderer';
import SimpleLineSymbol from 'esri/symbols/SimpleLineSymbol';
import SimpleFillSymbol from 'esri/symbols/SimpleFillSymbol';
import SimpleMarkerSymbol from 'esri/symbols/SimpleMarkerSymbol';

// Queries
import Query from 'esri/rest/support/Query';
import * as query from 'esri/rest/query';

// Popups
import PopupTemplate from 'esri/PopupTemplate';

// Outros
import Graphic from 'esri/Graphic';
import Color from 'esri/Color';
```

### Jimu Framework Components

```typescript
// Core
import { React, AllWidgetProps, IMState } from 'jimu-core';
import { JimuMapView, JimuMapViewComponent } from 'jimu-arcgis';

// UI Components básicos
import { 
  Button, 
  Select, 
  Option,
  Checkbox, 
  Radio,
  Label,
  TextInput,
  NumericInput,
  Icon,
  Loading,
  Modal,
  Tabs,
  Tab,
  Collapse,
  Switch,
  Slider
} from 'jimu-ui';

// UI Components avançados
import { 
  MapWidgetSelector,
  SettingSection,
  SettingRow 
} from 'jimu-ui/advanced/setting-components';

// Builder
import { AllWidgetSettingProps } from 'jimu-for-builder';
```

---

## SEGURANÇA E PERMISSÕES

### Considerações de Segurança

**1. Autenticação:**
- Widget usa autenticação do Portal ArcGIS
- Token é gerenciado automaticamente pelo Experience Builder
- Não armazenar credenciais no código

**2. CORS:**
- REST services devem ter CORS habilitado
- Configurar em ArcGIS Server Manager
- Adicionar domínio do Experience Builder

**3. Permissões de Dados:**
- Respeitar permissões do Portal
- Usuário só acessa dados que tem permissão
- Queries respeitam security do serviço

**4. Validação de Inputs:**
- Sempre validar inputs do usuário
- Sanitizar strings em queries
- Prevenir SQL injection (usar Query objects)
- Limitar tamanho de resultados

**5. HTTPS:**
- Todos os REST services devem usar HTTPS
- Nunca usar HTTP em produção
- Validar certificados SSL

### Configuração de CORS

No ArcGIS Server Manager:

```
Site > Security > Settings

Allowed Origins:
https://seu-portal.com
https://experience-builder.seu-portal.com
```

### Permissões Necessárias

**Para Usar o Widget:**
- Acesso ao Portal ArcGIS Enterprise
- Permissão de leitura nos Feature Layers
- Permissão de leitura nas tabelas alfanuméricas

**Para Configurar o Widget:**
- Role de Publisher ou Administrator
- Permissão para editar app Experience Builder

**Para Deployment:**
- Role de Administrator
- Acesso ao servidor Experience Builder

---

## MONITORAMENTO E ANALYTICS

### Eventos para Tracking

```typescript
// Eventos importantes para monitorar
enum AnalyticsEvents {
  WIDGET_LOADED = 'widget_loaded',
  VARIABLE_SELECTED = 'variable_selected',
  METHOD_CHANGED = 'method_changed',
  ANALYSIS_STARTED = 'analysis_started',
  ANALYSIS_COMPLETED = 'analysis_completed',
  ANALYSIS_FAILED = 'analysis_failed',
  LAYER_CREATED = 'layer_created',
  SYMBOLOGY_CHANGED = 'symbology_changed',
  FILTER_APPLIED = 'filter_applied',
  ERROR_OCCURRED = 'error_occurred'
}

// Implementação
const trackEvent = (event: AnalyticsEvents, data?: any) => {
  if (config.debugMode) {
    console.log(`[Analytics] ${event}`, data);
  }
  
  // Integrar com sistema de analytics
  // Ex: Google Analytics, Application Insights, etc.
  if (window.gtag) {
    window.gtag('event', event, data);
  }
};

// Uso
trackEvent(AnalyticsEvents.ANALYSIS_COMPLETED, {
  variable: 'oferta',
  method: 'com-variacao',
  featuresCount: 234,
  executionTime: 2.3
});
```

### Métricas Importantes

**Performance:**
- Tempo de query (por tipo)
- Tempo total de análise
- Tempo de renderização
- Tamanho de resultados (número de features)

**Uso:**
- Variáveis mais usadas
- Métodos mais usados (sem/com variação)
- Filtros mais aplicados
- Períodos mais consultados
- Horários de maior uso

**Erros:**
- Taxa de erro por tipo
- Erros mais frequentes
- Queries que falham
- Timeouts

**Qualidade:**
- Análises que retornam 0 features
- Análises canceladas
- Tempo até primeira interação

---

## MANUTENÇÃO E ATUALIZAÇÕES

### Checklist de Manutenção Mensal

- [ ] Revisar logs de erro
- [ ] Analisar métricas de performance
- [ ] Verificar queries lentas
- [ ] Atualizar dependências (patches)
- [ ] Testar com dados novos
- [ ] Validar links de documentação
- [ ] Revisar issues reportadas
- [ ] Backup de configurações

### Checklist de Atualização Major

**Antes:**
- [ ] Backup completo da configuração
- [ ] Documentar versão atual
- [ ] Comunicar usuários (downtime)
- [ ] Testar em ambiente de homologação
- [ ] Preparar rollback plan

**Durante:**
- [ ] Seguir processo de deployment
- [ ] Validar cada etapa
- [ ] Monitorar logs em tempo real
- [ ] Testar funcionalidades críticas

**Depois:**
- [ ] Validar todas as funcionalidades
- [ ] Verificar métricas de performance
- [ ] Coletar feedback de usuários
- [ ] Atualizar documentação
- [ ] Comunicar conclusão

### Versionamento Semântico

Seguir padrão SemVer (MAJOR.MINOR.PATCH):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
  - Mudança na estrutura de config
  - Remoção de funcionalidades
  - API incompatível

- **MINOR** (1.0.0 → 1.1.0): Novas funcionalidades
  - Novos filtros
  - Nova funcionalidade de exportação
  - Melhorias backward-compatible

- **PATCH** (1.0.0 → 1.0.1): Correções
  - Bug fixes
  - Melhorias de performance
  - Correções de documentação

### Changelog Structure

```markdown
# Changelog

## [1.1.0] - 2024-03-15

### Added
- Exportação de resultados para CSV
- Histórico de últimas 10 análises
- Botão "Limpar tudo"

### Changed
- Melhorado performance de queries (30% mais rápido)
- Interface de simbolização mais intuitiva

### Fixed
- Corrigido cálculo de variação quando valor P1 é zero
- Corrigido filtro de eixos que não atualizava
- Corrigido zoom automático em algumas situações

### Deprecated
- Nada

### Removed
- Nada

### Security
- Atualizada biblioteca X para corrigir vulnerabilidade
```

---

## FAQ - PERGUNTAS FREQUENTES

### Desenvolvimento

**Q: Como adiciono uma nova variável?**
A: Via painel de settings, clique em "Adicionar Variável" e preencha todos os campos obrigatórios.

**Q: Como faço debug do widget?**
A: Use `npm start -- --inspect` e abra Chrome DevTools. Adicione breakpoints em src/runtime/widget.tsx.

**Q: Por que meu widget não aparece?**
A: Verifique se a pasta está em `your-extensions/widgets/`, se manifest.json está correto, e reinicie o servidor.

**Q: Como testo queries sem usar o widget?**
A: Acesse diretamente a URL REST no navegador, adicionando parâmetros de query.

**Q: Posso usar bibliotecas externas?**
A: Sim, mas evite bibliotecas muito grandes. Prefira usar funcionalidades nativas do Jimu e Esri.

### Funcionalidades

**Q: Posso comparar mais de 2 períodos?**
A: Na versão 1.0 não, mas está planejado para versão 1.2.

**Q: Como exporto os resultados?**
A: Planejado para versão 1.1. Por enquanto, use print screen ou export do mapa.

**Q: Posso salvar minhas análises favoritas?**
A: Planejado para versão 1.1.

**Q: O widget funciona offline?**
A: Não, requer conexão com REST services. Modo offline planejado para versão 2.0.

**Q: Posso mudar as cores padrão?**
A: Sim, em FrontOffice através dos controles de simbolização, ou em BackOffice nas configurações.

### Performance

**Q: Minha query está muito lenta, o que fazer?**
A: Crie índices nos campos de filtro, reduza o período, use filtros mais específicos, aumente timeout.

**Q: Qual o máximo de features suportado?**
A: Configurável, padrão é 5000. Acima disso pode haver lentidão.

**Q: Cache funciona bem?**
A: Sim, mas pode desabilitar se os dados mudam frequentemente.

**Q: Como otimizo para dados muito grandes?**
A: Use aggregation no servidor (REST service), implemente pagination, considere pré-processar dados.

### Troubleshooting

**Q: Erro "Service unavailable"?**
A: Verifique se REST service está acessível, se CORS está habilitado, se tem permissões.

**Q: Erro "Query returned 0 features"?**
A: Normal se filtros são muito restritivos. Tente "Todos" em Serviço.

**Q: Simbolização não atualiza?**
A: Bug conhecido, remova e recrie camada. Será corrigido em patch.

**Q: Filtros encadeados não funcionam?**
A: Verifique se campo "dependeDe" está correto no config, e se unique values estão corretos.

---

## RECURSOS ADICIONAIS

### Documentação Oficial

- [ArcGIS Experience Builder](https://developers.arcgis.com/experience-builder/)
- [Jimu Framework API](https://developers.arcgis.com/experience-builder/api-reference/jimu-core/)
- [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/latest/)
- [ArcGIS REST API](https://developers.arcgis.com/rest/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Exemplos de Código

- [Experience Builder Samples](https://github.com/Esri/experience-builder-samples)
- [Custom Widget Templates](https://github.com/Esri/arcgis-experience-builder-sdk-resources)
- [Jimu UI Components Showcase](https://developers.arcgis.com/experience-builder/storybook/)

### Comunidade

- [Esri Community - Experience Builder](https://community.esri.com/t5/arcgis-experience-builder/ct-p/arcgis-experience-builder)
- [GeoNet Forums](https://community.esri.com/t5/geonet/ct-p/geonet)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/arcgis-experience-builder)
- [Reddit r/gis](https://www.reddit.com/r/gis/)

### Ferramentas Úteis

- [VS Code](https://code.visualstudio.com/) - Editor recomendado
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [ArcGIS REST API Explorer](https://developers.arcgis.com/rest/services-reference/)
- [JSON Validator](https://jsonlint.com/)
- [Color Picker](https://htmlcolorcodes.com/)

---

## NOTES PARA O DESENVOLVEDOR

### Armadilhas Comuns

1. **Não usar await em queries**
   - Sempre use `await` em chamadas assíncronas
   - Trate erros com try/catch

2. **Esquecer de remover camada anterior**
   - Sempre remover antes de adicionar nova
   - Guardar referência da camada atual

3. **Não validar inputs antes de query**
   - Sempre validar antes de executar
   - Mostrar mensagens claras

4. **Comparar objetos com ===**
   - Use lodash isEqual ou compare manualmente
   - Cuidado com arrays e objetos

5. **Não memoizar cálculos pesados**
   - Use useMemo para evitar recalcular
   - Use useCallback para callbacks

6. **Ignorar acessibilidade**
   - Sempre adicionar labels e ARIA
   - Testar com navegação por teclado

7. **Hardcoded strings**
   - Use configuração de textos
   - Facilita internacionalização

8. **Não tratar erros de rede**
   - Sempre ter try/catch em queries
   - Mostrar mensagens úteis ao usuário

### Padrões de Código

```typescript
// ✅ BOM: Componente bem estruturado
const TemporalSelector: React.FC<ITemporalSelectorProps> = ({
  ano,
  meses,
  onChange,
  label
}) => {
  // State local
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([]);
  
  // Effects
  useEffect(() => {
    loadAnosDisponiveis();
  }, []);
  
  // Handlers memoizados
  const handleAnoChange = useCallback((novoAno: number) => {
    onChange({ ano: novoAno, meses });
  }, [meses, onChange]);
  
  const handleMesesChange = useCallback((novosMeses: number[]) => {
    onChange({ ano, meses: novosMeses });
  }, [ano, onChange]);
  
  // Render
  return (
    <div className="temporal-selector">
      <Label>{label}</Label>
      <Select value={ano} onChange={handleAnoChange}>
        {anosDisponiveis.map(a => (
          <Option key={a} value={a}>{a}</Option>
        ))}
      </Select>
      <MonthCheckboxes 
        selected={meses}
        onChange={handleMesesChange}
      />
    </div>
  );
};

export default React.memo(TemporalSelector);
```

### Debugging Tips

```typescript
// Adicione logs estruturados
const DEBUG = config.debugMode;

const executeAnalysis = async (config: IAnalysisConfig) => {
  if (DEBUG) console.log('[Analysis] Starting with config:', config);
  
  try {
    const startTime = performance.now();
    
    const result = await AnalysisWorkflow.execute(config);
    
    const endTime = performance.now();
    if (DEBUG) {
      console.log('[Analysis] Completed in', endTime - startTime, 'ms');
      console.log('[Analysis] Features:', result.features.length);
    }
    
    return result;
  } catch (error) {
    console.error('[Analysis] Error:', error);
    throw error;
  }
};
```

---

## FINAL NOTES

Este documento serve como **fonte única de verdade** para o projeto Widget "Análise de Variações". 

**Mantenha este documento atualizado** à medida que o projeto evolui:
- Decisões arquiteturais
- Mudanças de requisitos
- Novos padrões adotados
- Lições aprendidas
- FAQ com novos problemas resolvidos

**Use este documento ativamente** durante desenvolvimento:
- Consulte antes de tomar decisões
- Adicione novas seções conforme necessário
- Documente problemas encontrados e soluções
- Mantenha exemplos de código atualizados

**Ao trabalhar com Claude Code:**
- Sempre referencie este documento
- Use o agent `experience-builder-specialist`
- Seja específico em seus prompts
- Valide outputs contra especificações deste doc

---

**Versão deste documento:** 1.0.0  
**Última atualização:** [DATA ATUAL]  
**Próxima revisão:** [DATA + 1 MÊS]

---

**BOA SORTE COM O DESENVOLVIMENTO! 🚀**

# Debug
npm start -- --inspect                 # Debug mode
npm start -- --verbose                 # Verbose logging
```

---

## CONVENÇÕES DE COMMIT

Seguir padrão Conventional Commits:

```
feat: adiciona novo filtro de região
fix: corrige cálculo de variação quando valor é zero
docs: atualiza README com exemplos
style: formata código com Prettier
refactor: reorganiza estrutura de serviços
test: adiciona testes para QueryService
chore: atualiza dependências
perf: otimiza query de unique values
```

---

## CONTEXTO PARA DESENVOLVIMENTO COM CLAUDE CODE

### Como Usar Este Documento

Este arquivo `claude.md` serve como **contexto completo do projeto** para o Claude Code. Ao trabalhar no projeto:

1. **Coloque este arquivo na raiz do projeto**
2. **Claude Code lerá automaticamente** este contexto
3. **Sempre mencione `experience-builder-specialist`** para usar o agent específico

### Templates de Prompts

#### Iniciar Desenvolvimento
```
experience-builder-specialist: Vamos iniciar o desenvolvimento do widget Análise de Variações.

Leia o arquivo claude.md para contexto completo.

Comece criando:
1. Estrutura de pastas completa
2. manifest.json
3. Interfaces TypeScript em types.ts
4. config.json com schema

Implemente seguindo exatamente as especificações do claude.md.
```

#### Implementar Componente Específico
```
experience-builder-specialist: Implemente o componente [NOME_COMPONENTE] conforme especificado no claude.md.

Contexto adicional:
- [Adicione detalhes específicos]

Siga as boas práticas definidas no documento.
```

#### Debugar Problema
```
experience-builder-specialist: Estou tendo o seguinte problema:

[DESCREVA O PROBLEMA]

Erro: [COLE O ERRO]

Consulte o claude.md seção Troubleshooting e me ajude a resolver.
```

#### Adicionar Funcionalidade
```
experience-builder-specialist: Quero adicionar a seguinte funcionalidade:

[DESCREVA A FUNCIONALIDADE]

Baseando-se na arquitetura descrita no claude.md, como devo implementar isso?
```

#### Revisar Código
```
experience-builder-specialist: Revise este código considerando:

1. Boas práticas do claude.md
2. Arquitetura do projeto
3. Performance e otimização
4. TypeScript types

[COLE O CÓDIGO]
```

### Estrutura de Trabalho Recomendada

**Dia 1-3: Setup e Estrutura Base**
```
1. Criar estrutura de pastas
2. Configurar manifest.json e config.json
3. Definir todas as interfaces TypeScript
4. Criar componentes base (vazios)
5. Setup de estilos base
```

**Dia 4-7: Componentes de UI**
```
1. Implementar VariableSelector
2. Implementar AnalysisMethodToggle
3. Implementar TemporalSelector
4. Implementar DynamicFilters
5. Testar interações básicas
```

**Dia 8-12: Lógica de Negócio**
```
1. Implementar QueryService
2. Implementar AggregationService
3. Implementar AnalysisWorkflow
4. Testar queries com dados reais
5. Tratar casos extremos
```

**Dia 13-17: Simbolização e Camadas**
```
1. Implementar SymbologyService
2. Implementar LayerService
3. Criar renderers sem variação
4. Criar renderers com variação
5. Implementar controles de simbolização
```

**Dia 18-21: Painel de Settings**
```
1. Implementar setting.tsx base
2. Criar configuração de variáveis
3. Criar configuração de filtros
4. Implementar validações
5. Testar exportação/importação
```

**Dia 22-25: Testes e Refinamento**
```
1. Escrever testes unitários
2. Escrever testes de integração
3. Testar todos os cenários de negócio
4. Corrigir bugs encontrados
5. Otimizar performance
```

**Dia 26-28: Documentação e Deploy**
```
1. Finalizar documentação
2. Criar screenshots
3. Preparar exemplos
4. Build de produção
5. Testar deployment
```

### Checkpoint Questions

**Antes de cada fase, pergunte:**
1. Entendi completamente os requisitos?
2. A arquitetura está clara?
3. Tenho todos os recursos necessários?
4. Há dependências bloqueando?
5. Como vou validar esta fase?

**Após cada fase, pergunte:**
1. Todos os requisitos foram atendidos?
2. O código está testado?
3. A documentação está atualizada?
4. Há débitos técnicos para registrar?
5. Posso avançar com segurança?

---

## DECISÕES ARQUITETURAIS IMPORTANTES

### 1. Por que React Hooks ao invés de Class Components?

**Decisão:** Usar Functional Components com Hooks

**Razões:**
- Código mais limpo e conciso
- Melhor performance com React.memo
- Facilita compartilhamento de lógica (custom hooks)
- Padrão moderno do React
- Melhor suporte a TypeScript

### 2. Por que separar em múltiplos Services?

**Decisão:** QueryService, AggregationService, AnalysisWorkflow, etc.

**Razões:**
- Separation of Concerns
- Facilita testes unitários
- Reutilização de código
- Manutenção mais fácil
- Possibilidade de mock em testes

### 3. Por que cache de queries?

**Decisão:** Implementar cache em memória para unique values

**Razões:**
- Reduz chamadas desnecessárias ao servidor
- Melhora experiência do usuário
- Unique values raramente mudam
- Performance significativamente melhor
- Configurável (pode ser desabilitado)

### 4. Por que validação no frontend E backend?

**Decisão:** Validar inputs no widget antes de query

**Razões:**
- Feedback imediato ao usuário
- Reduz queries inválidas
- Economiza recursos do servidor
- Melhor UX
- Backend validation é adicional (defesa em profundidade)# Projeto: Widget "Análise de Variações" - ArcGIS Experience Builder 11.3

## CONTEXTO DO PROJETO

**Ambiente:** ArcGIS Experience Builder Developer Edition  
**Versão ArcGIS Enterprise:** 11.3  
**Data de Início:** 10 de dezembro de 2024  
**Tipo de Projeto:** Widget Customizado para Análise Temporal de Dados de Transporte  

## OBJETIVO PRINCIPAL

Desenvolver um widget customizado para ArcGIS Experience Builder que permita análises temporais de dados geográficos de transporte público (oferta, procura, paragens), com capacidade de comparação entre períodos e visualização automática de variações através de camadas simbolizadas dinamicamente.

---

## ESPECIFICAÇÃO FUNCIONAL COMPLETA

### 1. SELEÇÃO DE VARIÁVEIS

**Requisito:** Permitir seleção de variáveis de análise (pontos, linhas ou polígonos)

**Implementação:**
- Dropdown configurável via BackOffice
- Cada variável deve ter:
  - Nome de exibição
  - Tipo de geometria (ponto, linha, polígono)
  - URL REST geográfico (Feature Layer)
  - URL REST alfanumérico (Tabela com dados temporais)
  - Campo de código de ligação (join entre serviços)
  - Campo de valor (campo numérico a ser analisado)
  - Lista de serviços disponíveis para esta variável

**Variáveis Iniciais:**
1. **Oferta** (linhas)
   - Serviços: AP, IC, Internacional, Regional, InterRegional, Urbanos Porto, Urbanos Coimbra, Urbanos Lisboa (8 total)
   
2. **Procura** (linhas)
   - Serviços: AP, IC, Regional, Internacional (4 total)
   
3. **Paragens** (pontos)
   - Configuração específica a definir

**Estrutura de Dados:**
```json
{
  "id": "oferta",
  "nome": "Oferta",
  "tipo": "linha",
  "urlGeografico": "https://servidor/arcgis/rest/services/eixos/FeatureServer/0",
  "urlAlfanumerico": "https://servidor/arcgis/rest/services/dados_oferta/MapServer/0",
  "codigoLigacao": "ID_EIXO",
  "campoValor": "VALOR_OFERTA",
  "servicosDisponiveis": ["AP", "IC", "Internacional", "Regional", "InterRegional", "Urbanos Porto", "Urbanos Coimbra", "Urbanos Lisboa"]
}
```

### 2. MÉTODOS DE ANÁLISE

**Requisito:** Dois métodos distintos de análise

#### 2.1 Análise SEM VARIAÇÃO (padrão)
- Analisa dados de **um único período temporal**
- Interface mostra **1 seletor de período**
- Resultado: camada com **valores absolutos** (soma)
- Simbolização: classificação por cor/grossura baseada nos valores

#### 2.2 Análise COM VARIAÇÃO
- Compara dados de **dois períodos temporais**
- Interface mostra **2 seletores de período** (1º período e 2º período)
- Cálculo: `((Período2 - Período1) / Período1) × 100`
- Resultado: camada com **percentuais de variação**
- Simbolização: 6 classes predefinidas com cores específicas

**UI Behavior:**
- Toggle/Radio buttons para alternar entre métodos
- Por defeito: "Sem variação" selecionado
- Ao mudar para "Com variação": interface expande mostrando segundo seletor temporal

### 3. SELEÇÃO TEMPORAL

**Requisito:** Seleção de ano e mês(es) para análise

**Componentes:**
1. **Dropdown de Ano:**
   - Populado dinamicamente com anos disponíveis nos dados
   - Query ao serviço alfanumérico: `SELECT DISTINCT ANO ORDER BY ANO DESC`

2. **Checkboxes de Meses:**
   - 12 checkboxes (Janeiro a Dezembro)
   - Seleção múltipla permitida
   - Opção "Todos os meses" que seleciona automaticamente todos

**Lógica de Agregação:**
- Se múltiplos meses selecionados → **SOMA** de todos os valores
- Exemplo: Jan + Fev + Mar = SUM(valor_jan, valor_fev, valor_mar)

**Modo Com Variação:**
- Duplicar componente temporal
- Labels: "1º Período" e "2º Período"
- Validação: períodos devem ser diferentes

### 4. FILTROS DINÂMICOS (CARACTERÍSTICAS)

**Requisito:** Filtros configuráveis e encadeados para refinar análise

#### 4.1 Filtro SERVIÇO (obrigatório)
- Tipo: Seleção múltipla (checkboxes)
- Opção "Todos" disponível
- Valores: unique values do campo TIPO_SERVICO
- Filtrado por variável selecionada (regra de negócio)

**Regra de Negócio:**
- Variável "Oferta" → Mostra todos os 8 serviços
- Variável "Procura" → Mostra apenas 4 serviços (AP, IC, Regional, Internacional)

#### 4.2 Filtro EIXO/LINHA (obrigatório)
- Tipo: Seleção múltipla (checkboxes)
- Opção "Todos" disponível
- **Dependente do filtro Serviço**: mostra apenas eixos/linhas dos serviços selecionados
- Query dinâmica: `WHERE TIPO_SERVICO IN (servicos_selecionados)`

#### 4.3 Filtros Adicionais (extensível)
- Configuráveis via JSON no BackOffice
- Cada filtro pode ter:
  - Nome customizável
  - Tipo de seleção (único ou múltiplo)
  - Campo da tabela
  - Dependência de outro filtro
  - Regras de agregação

**Estrutura de Configuração:**
```json
{
  "id": "servico",
  "nome": "Serviço",
  "tipo": "multiplo",
  "campo": "TIPO_SERVICO",
  "opcaoTodos": true,
  "dependeDe": null
},
{
  "id": "eixo",
  "nome": "Eixo/Linha",
  "tipo": "multiplo",
  "campo": "EIXO",
  "opcaoTodos": true,
  "dependeDe": "servico"
}
```

### 5. BOTÃO "GERAR MAPA"

**Requisito:** Botão que executa análise e gera camada

**Estados do Botão:**
- **Disabled (cinza):** Inputs mínimos não preenchidos
- **Enabled (ativo):** Todos os inputs obrigatórios preenchidos

**Inputs Obrigatórios:**
1. Variável selecionada
2. Método de análise selecionado
3. Período(s) temporal(is) selecionado(s)
4. Ao menos um serviço selecionado

**Ação ao Clicar:**
1. Validar inputs
2. Mostrar loading spinner
3. Executar queries aos REST services
4. Processar dados (agregações, joins, cálculos)
5. Criar camada no mapa com simbolização
6. Remover camada anterior (se existir)
7. Zoom to extent das features
8. Mostrar controles de simbolização
9. Exibir mensagem de sucesso com contador de features

### 6. GERAÇÃO DE CAMADAS E QUERIES

#### 6.1 Fluxo SEM VARIAÇÃO

**Passo 1:** Query dados geográficos
```sql
SELECT * FROM eixos_geograficos
```

**Passo 2:** Query dados alfanuméricos
```sql
SELECT 
  ID_EIXO,
  SUM(VALOR) as TOTAL
FROM dados_alfanumericos
WHERE 
  ANO = {ano_selecionado}
  AND MES IN ({meses_selecionados})
  AND TIPO_SERVICO IN ({servicos_selecionados})
  AND EIXO IN ({eixos_selecionados})
GROUP BY ID_EIXO
```

**Passo 3:** Join por código de ligação
```javascript
const featuresEnriquecidas = geographicFeatures.map(geoFeature => {
  const alphaData = alphanumericData.find(
    a => a.ID_EIXO === geoFeature.attributes.ID_EIXO
  );
  return {
    ...geoFeature,
    attributes: {
      ...geoFeature.attributes,
      VALOR_ANALISE: alphaData?.TOTAL || 0
    }
  };
});
```

**Passo 4:** Criar camada com renderer

#### 6.2 Fluxo COM VARIAÇÃO

**Passo 1:** Query dados geográficos (igual ao anterior)

**Passo 2:** Query 1º período
```sql
SELECT 
  ID_EIXO,
  SUM(VALOR) as TOTAL_P1
FROM dados_alfanumericos
WHERE 
  ANO = {ano_periodo1}
  AND MES IN ({meses_periodo1})
  AND [filtros...]
GROUP BY ID_EIXO
```

**Passo 3:** Query 2º período
```sql
SELECT 
  ID_EIXO,
  SUM(VALOR) as TOTAL_P2
FROM dados_alfanumericos
WHERE 
  ANO = {ano_periodo2}
  AND MES IN ({meses_periodo2})
  AND [filtros...]
GROUP BY ID_EIXO
```

**Passo 4:** Calcular variação
```javascript
const featuresComVariacao = geographicFeatures.map(geoFeature => {
  const dadosP1 = periodo1Data.find(p => p.ID_EIXO === geoFeature.attributes.ID_EIXO);
  const dadosP2 = periodo2Data.find(p => p.ID_EIXO === geoFeature.attributes.ID_EIXO);
  
  const valorP1 = dadosP1?.TOTAL_P1 || 0;
  const valorP2 = dadosP2?.TOTAL_P2 || 0;
  
  // Calcular variação percentual
  const variacao = valorP1 !== 0 
    ? ((valorP2 - valorP1) / valorP1) * 100 
    : (valorP2 > 0 ? 100 : 0);
  
  return {
    ...geoFeature,
    attributes: {
      ...geoFeature.attributes,
      VALOR_P1: valorP1,
      VALOR_P2: valorP2,
      VARIACAO: variacao
    }
  };
});
```

### 7. SIMBOLIZAÇÃO

#### 7.1 Simbolização SEM VARIAÇÃO

**Para Linhas:**
- Classificação por **cor E grossura**
- Método: Natural Breaks, Equal Interval ou Quantile
- Número de classes: 3-10 (configurável pelo usuário)
- Rampa de cores: selecionável (verde-amarelo-vermelho, azul-vermelho, etc.)

**Para Pontos e Polígonos:**
- Classificação por **cor apenas**
- Mesmas opções de método e classes

**Controles FrontOffice:**
- Slider para número de classes
- Dropdown para método de classificação
- Seletor visual de rampa de cores
- Preview da legenda em tempo real

#### 7.2 Simbolização COM VARIAÇÃO

**Classes Padrão (6 classes):**

| Classe | Intervalo | Cor | Hex | Label |
|--------|-----------|-----|-----|-------|
| 1 | < -50% | Vermelho escuro | #8B0000 | "Redução > 50%" |
| 2 | -50% a -25% | Vermelho claro | #FF6347 | "Redução 25-50%" |
| 3 | -25% a 0% | Amarelo | #FFFF00 | "Redução < 25%" |
| 4 | 0% a 25% | Verde claro | #90EE90 | "Crescimento < 25%" |
| 5 | 25% a 50% | Verde | #008000 | "Crescimento 25-50%" |
| 6 | > 50% | Verde escuro | #006400 | "Crescimento > 50%" |

**Customização Permitida:**
- Alterar número de classes
- Redefinir intervalos
- Escolher cores personalizadas
- Renomear labels

### 8. POPUP TEMPLATE

#### 8.1 Popup SEM VARIAÇÃO
```
Título: {NOME_EIXO}

Conteúdo:
━━━━━━━━━━━━━━━━━━━━
Serviço: {TIPO_SERVICO}
Eixo: {EIXO}
━━━━━━━━━━━━━━━━━━━━
Período: {ANO} - {MESES_FORMATADOS}
Valor: {VALOR_ANALISE:NumberFormat}
━━━━━━━━━━━━━━━━━━━━
```

#### 8.2 Popup COM VARIAÇÃO
```
Título: {NOME_EIXO}

Conteúdo:
━━━━━━━━━━━━━━━━━━━━
Serviço: {TIPO_SERVICO}
Eixo: {EIXO}
━━━━━━━━━━━━━━━━━━━━
1º Período: {ANO_P1} - {MESES_P1}
Valor: {VALOR_P1:NumberFormat}

2º Período: {ANO_P2} - {MESES_P2}
Valor: {VALOR_P2:NumberFormat}
━━━━━━━━━━━━━━━━━━━━
Variação: {VARIACAO:NumberFormat}%
[Ícone ▲ verde se positivo / ▼ vermelho se negativo]
━━━━━━━━━━━━━━━━━━━━
```

---

## ARQUITETURA TÉCNICA

### STACK TECNOLÓGICO

**Core:**
- React 18+ (Functional Components + Hooks)
- TypeScript 4.5+
- Jimu Framework (Experience Builder SDK)
- ArcGIS Maps SDK for JavaScript 4.x

**Bibliotecas:**
- Jimu Core (React, Immutable, IMState)
- Jimu ArcGIS (JimuMapView, DataSource)
- Jimu UI (Button, Select, Checkbox, Modal, etc.)
- Esri Modules (FeatureLayer, Query, ClassBreaksRenderer, etc.)

### ESTRUTURA DE ARQUIVOS

```
your-extensions/widgets/analise-variacoes/
│
├── manifest.json                    # Configuração e metadados do widget
├── config.json                      # Schema de configuração
├── icon.svg                         # Ícone do widget (otimizado)
│
├── src/
│   ├── runtime/                     # Código principal do widget
│   │   ├── widget.tsx              # Componente principal
│   │   │
│   │   ├── components/             # Componentes React
│   │   │   ├── VariableSelector.tsx
│   │   │   ├── AnalysisMethodToggle.tsx
│   │   │   ├── TemporalSelector.tsx
│   │   │   ├── DynamicFilters.tsx
│   │   │   ├── FilterCheckboxGroup.tsx
│   │   │   ├── SymbologyControls.tsx
│   │   │   ├── Legend.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── MessageAlert.tsx
│   │   │
│   │   ├── services/               # Lógica de negócio
│   │   │   ├── QueryService.ts     # Queries aos REST services
│   │   │   ├── AggregationService.ts
│   │   │   ├── AnalysisWorkflow.ts # Orquestração da análise
│   │   │   ├── SymbologyService.ts # Criação de renderers
│   │   │   └── LayerService.ts     # Gerenciamento de camadas
│   │   │
│   │   ├── utils/                  # Utilitários
│   │   │   ├── ErrorHandler.ts
│   │   │   ├── Validators.ts
│   │   │   ├── Formatters.ts
│   │   │   └── Constants.ts
│   │   │
│   │   └── hooks/                  # Custom React Hooks
│   │       ├── useMapView.ts
│   │       ├── useAnalysisConfig.ts
│   │       └── useLayerManager.ts
│   │
│   ├── setting/                    # Painel de configurações
│   │   ├── setting.tsx            # Componente principal
│   │   │
│   │   └── components/            # Componentes de configuração
│   │       ├── VariableConfiguration.tsx
│   │       ├── FilterConfiguration.tsx
│   │       ├── TextCustomization.tsx
│   │       └── SymbologyDefaults.tsx
│   │
│   ├── types.ts                   # Interfaces TypeScript
│   └── config.ts                  # Configuração do widget
│
├── styles/
│   └── style.scss                 # Estilos do widget
│
└── tests/                         # Testes (opcional)
    ├── unit/
    ├── integration/
    └── fixtures/
```

### INTERFACES TYPESCRIPT PRINCIPAIS

```typescript
// Configuração de Variável
interface IVariableConfig {
  id: string;
  nome: string;
  tipo: 'ponto' | 'linha' | 'poligono';
  urlGeografico: string;
  urlAlfanumerico: string;
  codigoLigacao: string;
  campoValor: string;
  servicosDisponiveis: string[];
}

// Configuração de Filtro
interface IFilterConfig {
  id: string;
  nome: string;
  tipo: 'unico' | 'multiplo';
  campo: string;
  opcaoTodos: boolean;
  dependeDe: string | null;
}

// Seleção Temporal
interface ITemporalSelection {
  ano: number;
  meses: number[]; // 1-12
}

// Configuração da Análise
interface IAnalysisConfig {
  variavel: IVariableConfig;
  metodo: 'sem-variacao' | 'com-variacao';
  periodo1: ITemporalSelection;
  periodo2?: ITemporalSelection;
  filtros: {
    servico: string[];
    eixo: string[];
    [key: string]: string[];
  };
}

// Configuração de Simbolização
interface ISymbologyConfig {
  numClasses: number;
  metodo: 'natural-breaks' | 'equal-interval' | 'quantile';
  rampa: string;
  classesCustomizadas?: IClassBreak[];
}

interface IClassBreak {
  min: number;
  max: number;
  cor: number[]; // RGBA
  label: string;
}

// Resultado de Query
interface IQueryResult {
  features: __esri.Graphic[];
  count: number;
  executionTime: number;
}

// Feature Enriquecida
interface IFeatureEnriquecida extends __esri.Graphic {
  attributes: {
    [key: string]: any;
    VALOR_ANALISE?: number;
    VALOR_P1?: number;
    VALOR_P2?: number;
    VARIACAO?: number;
  };
}
```

### FLUXO DE DADOS

```
[1] Usuário seleciona inputs
      ↓
[2] Validação em tempo real
      ↓
[3] Botão "Gerar Mapa" habilitado
      ↓
[4] Clique no botão
      ↓
[5] QueryService.queryAlphanumericData()
      ↓
[6] AggregationService.aggregateByMonths()
      ↓
[7] QueryService.queryGeographicData()
      ↓
[8] QueryService.joinData()
      ↓
[9] [SE COM VARIAÇÃO] AnalysisWorkflow.calculateVariation()
      ↓
[10] SymbologyService.createRenderer()
      ↓
[11] LayerService.createFeatureLayer()
      ↓
[12] LayerService.addLayerToMap()
      ↓
[13] Exibir controles de simbolização
      ↓
[14] [OPCIONAL] Usuário ajusta simbolização
      ↓
[15] LayerService.updateLayerRenderer()
```

---

## REGRAS DE NEGÓCIO CRÍTICAS

### 1. Agregação de Meses
```javascript
// Se múltiplos meses selecionados
const valorTotal = mesesSelecionados.reduce((acc, mes) => {
  return acc + getValorDoMes(mes);
}, 0);
```

### 2. Filtros Encadeados
```javascript
// Eixos filtrados por serviços selecionados
const eixosDisponiveis = await queryUniqueValues(
  url,
  'EIXO',
  `TIPO_SERVICO IN ('${servicosSelecionados.join("','")}')`
);
```

### 3. Cálculo de Variação
```javascript
const calcularVariacao = (valorP1: number, valorP2: number): number => {
  if (valorP1 === 0 && valorP2 === 0) return 0;
  if (valorP1 === 0) return 100; // Crescimento de 0 para algo = 100%
  return ((valorP2 - valorP1) / valorP1) * 100;
};
```

### 4. Serviços por Variável
```javascript
const getServicosDisponiveis = (variavelId: string): string[] => {
  const variavel = config.variaveis.find(v => v.id === variavelId);
  return variavel?.servicosDisponiveis || [];
};
```

### 5. Habilitação do Botão
```javascript
const isBotaoHabilitado = () => {
  return !!(
    variavelSelecionada &&
    metodoSelecionado &&
    periodo1.ano &&
    periodo1.meses.length > 0 &&
    (metodoSelecionado === 'sem-variacao' || (
      periodo2.ano &&
      periodo2.meses.length > 0 &&
      !periodosIguais(periodo1, periodo2)
    )) &&
    filtros.servico.length > 0
  );
};
```

---

## PAINEL DE CONFIGURAÇÕES (SETTINGS)

### Seções Principais

#### 1. Gestão de Variáveis
- Lista de variáveis configuradas (array)
- Botão "Adicionar Variável"
- Formulário por variável:
  - Nome (text input)
  - Tipo (dropdown: Ponto/Linha/Polígono)
  - URL Geográfico (URL input com validação)
  - URL Alfanumérico (URL input com validação)
  - Campo de ligação (text input)
  - Campo de valor (text input)
  - Serviços disponíveis (checkbox group)
  - Botão "Testar Conexão"
  - Botão "Remover"

#### 2. Gestão de Filtros
- Lista de filtros configurados
- Botão "Adicionar Filtro"
- Formulário por filtro:
  - ID (auto-gerado)
  - Nome de exibição (text input)
  - Tipo (dropdown: Único/Múltiplo)
  - Campo na tabela (text input)
  - Depende de (dropdown opcional de outros filtros)
  - Opção "Todos" (checkbox)
  - Botão "Remover"
- Drag & Drop para reordenar

#### 3. Personalização de Textos
- Inputs para todos os textos do widget:
  - Título do widget
  - Labels de seções
  - Texto do botão
  - Mensagens de validação
  - Tooltips

#### 4. Simbolização Padrão
- **Sem Variação:**
  - Número de classes (slider 3-10)
  - Método (dropdown)
  - Rampa de cores (visual selector)
- **Com Variação:**
  - Definir 6 cores (color pickers)
  - Definir intervalos (number inputs)
  - Definir labels (text inputs)

#### 5. Configurações Avançadas
- Cache de queries (toggle + duration)
- Timeout de queries (number input)
- Máximo de features (number input)
- Zoom automático (toggle)
- Posição da legenda (dropdown)
- Debug mode (toggle)

#### 6. Exportar/Importar
- Botão "Exportar Configuração" (download JSON)
- Botão "Importar Configuração" (upload JSON)
- Botão "Resetar para Padrão"

---

## VALIDAÇÕES E TRATAMENTO DE ERROS

### Validações de Input

1. **Variável:**
   - Obrigatória
   - Deve existir na configuração

2. **Período Temporal:**
   - Ano obrigatório
   - Ao menos 1 mês selecionado
   - Ano deve existir nos dados

3. **Períodos em Modo Com Variação:**
   - Ambos os períodos obrigatórios
   - Períodos devem ser diferentes
   - Validação: `!(ano1 === ano2 && arrayEquals(meses1, meses2))`

4. **Filtros:**
   - Ao menos 1 serviço selecionado (obrigatório)
   - Eixo/linha opcional

5. **URLs REST (Settings):**
   - Formato válido de URL
   - Protocolo HTTPS
   - Teste de conectividade antes de salvar

### Códigos de Erro

```typescript
enum ErrorCodes {
  NO_DATA_FOUND = 'NO_DATA_FOUND',
  INVALID_PERIOD = 'INVALID_PERIOD',
  INVALID_CONFIG = 'INVALID_CONFIG',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  GEOMETRY_ERROR = 'GEOMETRY_ERROR',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTH_ERROR'
}
```

### Mensagens de Erro Amigáveis

```typescript
const ErrorMessages = {
  NO_DATA_FOUND: {
    titulo: 'Nenhum dado encontrado',
    mensagem: 'Não foram encontrados dados para os filtros selecionados.',
    sugestoes: [
      'Tente selecionar um período diferente',
      'Verifique se os filtros estão corretos',
      'Selecione "Todos" em Serviço para ampliar a busca'
    ]
  },
  SERVICE_UNAVAILABLE: {
    titulo: 'Serviço indisponível',
    mensagem: 'Não foi possível conectar ao serviço REST.',
    sugestoes: [
      'Verifique sua conexão com a internet',
      'Tente novamente em alguns instantes',
      'Contate o administrador se o problema persistir'
    ]
  }
  // ... outros
};
```

---

## PERFORMANCE E OTIMIZAÇÕES

### 1. Cache de Queries
- Implementar cache em memória para unique values
- TTL configurável (padrão: 5 minutos)
- Invalidar cache ao mudar configurações

### 2. Debounce
- Aplicar debounce de 300ms em inputs que disparam queries
- Exemplo: busca de eixos ao digitar

### 3. Lazy Loading
- Carregar unique values apenas quando necessário
- Não pré-carregar todos os filtros ao abrir widget

### 4. Pagination
- Se query retornar > 5000 features, implementar pagination
- Mostrar warning ao usuário

### 5. React Optimization
```typescript
// Memoização de componentes
const VariableSelector = React.memo(VariableSelectorComponent);

// Memoização de valores calculados
const eixosFiltrados = useMemo(() => {
  return filtrarEixosPorServico(eixos, servicosSelecionados);
}, [eixos, servicosSelecionados]);

// Memoização de callbacks
const handleServicoChange = useCallback((servicos: string[]) => {
  setServicosSelecionados(servicos);
}, []);
```

### 6. Bundle Optimization
- Code splitting por componentes pesados
- Lazy import de módulos Esri
- Tree shaking habilitado
- Minificação e compressão

---

## TESTES

### 1. Testes Unitários (Jest)
```typescript
// QueryService.test.ts
describe('QueryService', () => {
  test('deve retornar anos disponíveis ordenados', async () => {
    const anos = await QueryService.getAvailableYears(url);
    expect(anos).toEqual([2024, 2023, 2022]);
  });
  
  test('deve calcular variação corretamente', () => {
    const variacao = calcularVariacao(100, 150);
    expect(variacao).toBe(50);
  });
  
  test('deve tratar divisão por zero', () => {
    const variacao = calcularVariacao(0, 100);
    expect(variacao).toBe(100);
  });
});
```

### 2. Testes de Integração
```typescript
// widget-workflow.test.tsx
describe('Widget Workflow', () => {
  test('deve gerar camada sem variação completa', async () => {
    // 1. Selecionar variável
    // 2. Selecionar método
    // 3. Selecionar período
    // 4. Selecionar filtros
    // 5. Clicar "Gerar mapa"
    // 6. Verificar camada criada
  });
});
```

### 3. Checklist de Testes Manuais

**Funcionalidades Básicas:**
- [ ] Seleção de variável atualiza filtros disponíveis
- [ ] Toggle entre métodos mostra/esconde segundo período
- [ ] Dropdown de anos carrega dinamicamente
- [ ] Checkboxes de meses funcionam (incluindo "Todos")
- [ ] Filtro de eixo é filtrado por serviços selecionados
- [ ] Botão "Gerar mapa" habilita/desabilita corretamente
- [ ] Loading spinner aparece durante queries
- [ ] Camada é criada no mapa com simbolização
- [ ] Camada anterior é removida ao gerar nova
- [ ] Popup mostra informações corretas
- [ ] Controles de simbolização aparecem após geração
- [ ] Alteração de simbolização atualiza camada
- [ ] Legenda reflete simbolização atual

**Cenários de Análise:**
- [ ] Análise sem variação com 1 mês
- [ ] Análise sem variação com múltiplos meses (verifica soma)
- [ ] Análise com variação entre 2 períodos diferentes
- [ ] Análise com todos os serviços selecionados
- [ ] Análise com serviço único
- [ ] Análise com múltiplos eixos
- [ ] Análise com eixo único
- [ ] Variável Oferta (8 serviços)
- [ ] Variável Procura (4 serviços apenas)

**Validações:**
- [ ] Não permite gerar sem variável
- [ ] Não permite gerar sem período
- [ ] Não permite gerar sem serviço
- [ ] Alerta se períodos forem iguais em modo com variação
- [ ] Alerta se query retornar 0 features
- [ ] Mostra erro se serviço REST inacessível
- [ ] Valida URLs no painel de settings

**Responsividade:**
- [ ] Layout em 1920x1080
- [ ] Layout em 1366x768
- [ ] Layout em 1024x768
- [ ] Tablet landscape (1024x600)
- [ ] Tablet portrait (768x1024)
- [ ] Componentes não quebram em telas pequenas
- [ ] Scroll funciona corretamente

**Performance:**
- [ ] Query com 100 features < 2s
- [ ] Query com 1000 features < 5s
- [ ] Query com 5000 features < 10s
- [ ] Cache funciona (segunda query mesmos parâmetros é instantânea)
- [ ] Debounce evita queries excessivas
- [ ] Interface permanece responsiva durante queries

**Acessibilidade:**
- [ ] Navegação por teclado funciona
- [ ] Labels corretos em todos os inputs
- [ ] Contraste de cores adequado (WCAG AA)
- [ ] Screen reader identifica elementos
- [ ] Focus visível em elementos interativos
- [ ] Mensagens de erro anunciadas

---

## DEPLOYMENT

### Build de Produção

```bash
# 1. Validações pré-build
npm run lint
npm run type-check
npm test

# 2. Limpar builds anteriores
npm run clean

# 3. Build do widget
npm run build:widget -- --widgets=analise-variacoes

# 4. Verificar output
ls -lh dist/widgets/analise-variacoes/
```

### Estrutura do Pacote de Entrega

```
analise-variacoes-v1.0.0-release/
│
├── widget/
│   └── analise-variacoes/              # Widget buildado
│       ├── manifest.json
│       ├── config.json
│       ├── icon.svg
│       └── dist/
│           ├── runtime.js
│           ├── setting.js
│           └── [outros assets]
│
├── documentacao/
│   ├── 01-README.md                    # Visão geral
│   ├── 02-INSTALACAO.md               # Guia instalação
│   ├── 03-CONFIGURACAO.md             # Guia configuração
│   ├── 04-MANUAL-USUARIO.md           # Manual usuário
│   ├── 05-API-REFERENCE.md            # Referência técnica
│   ├── 06-TROUBLESHOOTING.md          # Solução de problemas
│   └── screenshots/
│       ├── widget-overview.png
│       ├── sem-variacao.png
│       ├── com-variacao.png
│       ├── simbolizacao.png
│       └── settings.png
│
├── exemplos/
│   ├── config-oferta-mensal.json      # Exemplo oferta
│   ├── config-procura-trimestral.json # Exemplo procura
│   ├── config-comparacao-anual.json   # Exemplo variação
│   └── config-completo.json           # Todos os recursos
│
├── scripts/
│   ├── install.sh                      # Instalação Linux/Mac
│   ├── install.ps1                     # Instalação Windows
│   ├── validate-config.js              # Validador configuração
│   └── test-rest-services.js           # Testa conectividade
│
├── CHANGELOG.md                        # Histórico de versões
├── LICENSE.md                          # Licença
└── LEIA-ME-PRIMEIRO.txt               # Instruções iniciais
```

### Checklist Pré-Deploy

**Código:**
- [ ] Todos os testes passando (unit + integration)
- [ ] Cobertura de testes > 80%
- [ ] Lint sem warnings
- [ ] TypeScript sem erros
- [ ] Comentários de debug removidos
- [ ] Console.logs removidos (exceto errors)
- [ ] Versão atualizada em manifest.json
- [ ] CHANGELOG.md atualizado

**Documentação:**
- [ ] README.md completo e atualizado
- [ ] Screenshots atualizados
- [ ] Exemplos de configuração validados
- [ ] FAQ com perguntas comuns
- [ ] Troubleshooting com soluções
- [ ] Diagramas e fluxos atualizados

**Configuração:**
- [ ] Config padrão funcional
- [ ] Exemplos de configuração testados
- [ ] Validador de configuração implementado
- [ ] Icon.svg otimizado (< 50KB)

**Build:**
- [ ] Build de produção gerado sem erros
- [ ] Bundle size aceitável (< 500KB)
- [ ] Assets comprimidos
- [ ] Source maps gerados (opcional)

**Testes:**
- [ ] Testado em ambiente local
- [ ] Testado em ambiente de homologação
- [ ] Validado por stakeholders
- [ ] Performance testada com dados reais
- [ ] Testado em diferentes navegadores

### Instalação no Experience Builder

#### Método 1: Desenvolvimento (Developer Edition)

```bash
# 1. Navegar até pasta de widgets
cd <caminho-exb>/client/your-extensions/widgets/

# 2. Copiar widget
cp -r /caminho/do/widget/analise-variacoes ./

# 3. Reiniciar servidor
cd ../../../
npm stop
npm start
```

#### Método 2: Produção (App Completo)

1. **Build da aplicação** no Experience Builder
2. **Download** do app (inclui widget customizado)
3. **Upload** para ArcGIS Enterprise:
   - Portal > Content > Add Item > Application
   - Upload arquivo .zip
   - Configurar título, tags, compartilhamento
4. **Publicar** e compartilhar

### Configuração Inicial

```json
{
  "variaveis": [
    {
      "id": "oferta",
      "nome": "Oferta",
      "tipo": "linha",
      "urlGeografico": "https://seu-servidor/arcgis/rest/services/Eixos/FeatureServer/0",
      "urlAlfanumerico": "https://seu-servidor/arcgis/rest/services/DadosOferta/MapServer/0",
      "codigoLigacao": "ID_EIXO",
      "campoValor": "VALOR_OFERTA",
      "servicosDisponiveis": [
        "AP", "IC", "Internacional", "Regional", 
        "InterRegional", "Urbanos Porto", 
        "Urbanos Coimbra", "Urbanos Lisboa"
      ]
    }
  ],
  "filtros": [
    {
      "id": "servico",
      "nome": "Serviço",
      "tipo": "multiplo",
      "campo": "TIPO_SERVICO",
      "opcaoTodos": true,
      "dependeDe": null
    },
    {
      "id": "eixo",
      "nome": "Eixo/Linha",
      "tipo": "multiplo",
      "campo": "EIXO",
      "opcaoTodos": true,
      "dependeDe": "servico"
    }
  ],
  "textos": {
    "titulo": "Análise de Variações",
    "subtitulo": "Análise temporal de dados de transporte",
    "labelVariavel": "Selecione a variável",
    "labelMetodo": "Método de análise",
    "labelPeriodo": "Período temporal",
    "labelPeriodo1": "1º Período",
    "labelPeriodo2": "2º Período",
    "botaoGerar": "Gerar mapa",
    "msgSucesso": "Camada gerada com sucesso",
    "msgErro": "Erro ao gerar camada",
    "msgSemDados": "Nenhum dado encontrado"
  },
  "simbologiaPadrao": {
    "semVariacao": {
      "numClasses": 5,
      "metodo": "natural-breaks",
      "rampa": "green-yellow-red"
    },
    "comVariacao": {
      "classes": [
        { "min": -Infinity, "max": -50, "cor": [139, 0, 0, 255], "label": "< -50%" },
        { "min": -50, "max": -25, "cor": [255, 99, 71, 255], "label": "-50% a -25%" },
        { "min": -25, "max": 0, "cor": [255, 255, 0, 255], "label": "-25% a 0%" },
        { "min": 0, "max": 25, "cor": [144, 238, 144, 255], "label": "0% a 25%" },
        { "min": 25, "max": 50, "cor": [0, 128, 0, 255], "label": "25% a 50%" },
        { "min": 50, "max": Infinity, "cor": [0, 100, 0, 255], "label": "> 50%" }
      ]
    }
  },
  "configuracaoAvancada": {
    "cache": true,
    "tempoCache": 300,
    "timeout": 30,
    "maxFeatures": 5000,
    "zoomAutomatico": true,
    "posicaoLegenda": "bottom-right",
    "debugMode": false
  }
}
```

---

## TROUBLESHOOTING COMUM

### Problema: Widget não aparece na lista

**Possíveis Causas:**
- Pasta não está no local correto
- manifest.json com erro de sintaxe
- Servidor não foi reiniciado

**Solução:**
1. Verificar caminho: `your-extensions/widgets/analise-variacoes/`
2. Validar JSON do manifest: `jsonlint manifest.json`
3. Reiniciar servidor: `npm stop && npm start`
4. Limpar cache: `npm run clean && npm start`
5. Verificar console do servidor por erros

### Problema: Erro ao gerar mapa

**Possíveis Causas:**
- URLs REST incorretos ou inacessíveis
- Campos configurados não existem
- CORS não habilitado
- Timeout muito baixo

**Solução:**
1. Testar URLs no navegador
2. Verificar estrutura dos serviços REST
3. Habilitar CORS no servidor ArcGIS
4. Aumentar timeout nas configurações avançadas
5. Verificar console do navegador (F12) para detalhes

### Problema: Query retorna 0 features

**Possíveis Causas:**
- Filtros muito restritivos
- Período sem dados
- Campos com nomes diferentes

**Solução:**
1. Tentar com "Todos" em Serviço
2. Verificar se ano/mês tem dados
3. Validar nomes de campos no REST service
4. Testar query diretamente no REST endpoint

### Problema: Performance lenta

**Possíveis Causas:**
- Volume de dados muito grande
- Índices faltando nas tabelas
- Servidor sobrecarregado
- Cache desabilitado

**Solução:**
1. Criar índices nos campos de filtro
2. Reduzir período de análise
3. Usar filtros mais específicos
4. Habilitar cache nas configurações
5. Aumentar timeout se necessário

### Problema: Simbolização não atualiza

**Possíveis Causas:**
- Camada não foi criada corretamente
- Renderer não foi aplicado
- Bug no LayerService

**Solução:**
1. Remover e recriar camada
2. Verificar console por erros
3. Validar estrutura do renderer
4. Atualizar página e tentar novamente

---

## BOAS PRÁTICAS DE IMPLEMENTAÇÃO

### 1. Código Limpo

```typescript
// ✅ BOM: Funções pequenas e focadas
const calcularVariacao = (p1: number, p2: number): number => {
  if (p1 === 0) return p2 > 0 ? 100 : 0;
  return ((p2 - p1) / p1) * 100;
};

// ❌ RUIM: Função muito grande e complexa
const processarAnalise = (config: any) => {
  // 200 linhas de código...
};
```

### 2. TypeScript Forte

```typescript
// ✅ BOM: Tipos específicos
interface IAnalysisConfig {
  variavel: IVariableConfig;
  metodo: 'sem-variacao' | 'com-variacao';
  periodo1: ITemporalSelection;
}

// ❌ RUIM: Tipos genéricos
const config: any = { ... };
```

### 3. Tratamento de Erros

```typescript
// ✅ BOM: Try/catch específico com mensagem útil
try {
  const features = await queryService.execute();
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    showError('Verifique sua conexão e tente novamente');
  } else {
    logError(error);
    showError('Erro inesperado. Contate o suporte.');
  }
}

// ❌ RUIM: Ignorar erros
const features = await queryService.execute().catch(() => []);
```

### 4. React Hooks

```typescript
// ✅ BOM: Dependências corretas
useEffect(() => {
  loadEixos();
}, [servicosSelecionados]); // Recarrega quando serviços mudam

// ❌ RUIM: Array de dependências vazio quando não deveria
useEffect(() => {
  loadEixos(); // Nunca recarrega
}, []);
```

### 5. Performance

```typescript
// ✅ BOM: Memoização apropriada
const eixosFiltrados = useMemo(() => 
  eixos.filter(e => servicosSelecionados.includes(e.servico)),
  [eixos, servicosSelecionados]
);

// ❌ RUIM: Cálculo em cada render
const eixosFiltrados = eixos.filter(e => 
  servicosSelecionados.includes(e.servico)
);
```

### 6. Componentes

```typescript
// ✅ BOM: Componente pequeno e reutilizável
const CheckboxGroup: React.FC<ICheckboxGroupProps> = ({ 
  options, 
  selected, 
  onChange 
}) => {
  return (
    <div>
      {options.map(opt => (
        <Checkbox key={opt.id} ... />
      ))}
    </div>
  );
};

// ❌ RUIM: Componente monolítico
const Widget = () => {
  // 1000 linhas de JSX...
};
```

---

## EXTENSIBILIDADE

### Adicionar Nova Variável

1. **No Settings Panel:**
   - Clicar "Adicionar Variável"
   - Preencher formulário
   - Testar conexão
   - Salvar

2. **Configuração JSON:**
```json
{
  "id": "nova-variavel",
  "nome": "Nova Variável",
  "tipo": "poligono",
  "urlGeografico": "...",
  "urlAlfanumerico": "...",
  "codigoLigacao": "ID",
  "campoValor": "VALOR",
  "servicosDisponiveis": ["Servico1", "Servico2"]
}
```

### Adicionar Novo Filtro

1. **No Settings Panel:**
   - Clicar "Adicionar Filtro"
   - Configurar propriedades
   - Definir dependências (opcional)
   - Salvar

2. **Configuração JSON:**
```json
{
  "id": "novo-filtro",
  "nome": "Novo Filtro",
  "tipo": "multiplo",
  "campo": "CAMPO_TABELA",
  "opcaoTodos": true,
  "dependeDe": "servico"
}
```

### Adicionar Nova Rampa de Cores

```typescript
// src/runtime/services/SymbologyService.ts
const COLOR_RAMPS = {
  // ... existentes
  'nova-rampa': [
    [0, 255, 0, 255],    // Verde
    [255, 255, 0, 255],  // Amarelo
    [255, 0, 0, 255]     // Vermelho
  ]
};
```

### Adicionar Novo Método de Classificação

```typescript
// src/runtime/services/SymbologyService.ts
export const calculateClassBreaks = (
  values: number[],
  numClasses: number,
  method: string
): number[] => {
  switch (method) {
    case 'natural-breaks':
      return jenksBreaks(values, numClasses);
    case 'equal-interval':
      return equalIntervalBreaks(values, numClasses);
    case 'quantile':
      return quantileBreaks(values, numClasses);
    case 'novo-metodo': // ← NOVO
      return novoMetodoBreaks(values, numClasses);
    default:
      return equalIntervalBreaks(values, numClasses);
  }
};
```

---

## ROADMAP E MELHORIAS FUTURAS

### Versão 1.1 (Curto Prazo - 1-2 meses)

**Funcionalidades:**
- [ ] Exportação de resultados (CSV, Excel, Shapefile)
- [ ] Salvar análises favoritas (persistência local)
- [ ] Histórico de análises (últimas 10)
- [ ] Botão "Limpar tudo" para reset rápido
- [ ] Atalho "Repetir última análise"
- [ ] Gráficos básicos (bar chart, line chart)
- [ ] Estatísticas resumidas (média, mediana, min, max)

**Melhorias:**
- [ ] Preview de dados antes de gerar mapa
- [ ] Contador de features em tempo real
- [ ] Sugestões inteligentes de filtros
- [ ] Validação avançada de inputs
- [ ] Melhor feedback visual (progress bar detalhado)

### Versão 1.2 (Médio Prazo - 3-4 meses)

**Funcionalidades:**
- [ ] Comparação de 3+ períodos simultaneamente
- [ ] Análise de tendências (linear, exponencial)
- [ ] Detecção automática de anomalias
- [ ] Dashboards integrados
- [ ] Relatórios automatizados (PDF)
- [ ] Anotações no mapa
- [ ] Compartilhamento de análises (link/embed)

**Integrações:**
- [ ] Power BI (export de dados)
- [ ] ArcGIS Dashboards (widgets conectados)
- [ ] ArcGIS Notebooks (análises Python)
- [ ] Email (envio de relatórios)
- [ ] Microsoft Teams (notificações)

### Versão 2.0 (Longo Prazo - 6+ meses)

**Funcionalidades Avançadas:**
- [ ] Machine Learning para previsões
- [ ] Análise em tempo real (streaming)
- [ ] Colaboração multi-usuário
- [ ] Mobile app companion
- [ ] API pública para integração
- [ ] Modo offline (PWA)
- [ ] Temas customizáveis (dark mode)
- [ ] Animações temporais (time slider)

**Arquitetura:**
- [ ] Migração para Web Workers
- [ ] Service Workers (offline-first)
- [ ] Cache distribuído (Redis)
- [ ] CDN para assets
- [ ] Microserviços backend (opcional)

---

## GLOSSÁRIO

**Termos Técnicos:**

- **Feature Layer**: Camada de dados geográficos do ArcGIS (pontos, linhas, polígonos)
- **REST Service**: Serviço web que expõe dados via API HTTP
- **ClassBreaksRenderer**: Tipo de simbolização que classifica dados em intervalos
- **Jimu Framework**: Framework do Experience Builder para desenvolvimento de widgets
- **Natural Breaks**: Método de classificação que minimiza variância dentro das classes
- **Equal Interval**: Método que divide valores em intervalos iguais
- **Quantile**: Método que divide dados em grupos com mesmo número de elementos
- **Join**: Operação que combina dados de duas tabelas por campo comum
- **Query**: Consulta a um serviço REST com filtros e parâmetros
- **Renderer**: Configuração de simbolização de uma camada
- **Extent**: Retângulo envolvente (bounding box) de features

**Termos de Negócio:**

- **Oferta**: Dados de oferta de transporte (capacidade disponível)
- **Procura**: Dados de demanda de transporte (passageiros)
- **Paragens**: Pontos de parada de transporte público
- **Eixo/Linha**: Rota de transporte
- **Serviço**: Tipo de serviço de transporte (AP, IC, Regional, etc.)
- **Variação**: Diferença percentual entre dois períodos
- **Agregação**: Soma de valores (por mês, geometria, etc.)

---

## CONTATOS E SUPORTE

**Durante Desenvolvimento:**
- Use o experience-builder-specialist agent no Claude Code
- Consulte documentação oficial: https://developers.arcgis.com/experience-builder/

**Pós-Deployment:**
- Documentação: Consulte arquivos em `/documentacao/`
- Issues: [Criar sistema de tracking conforme necessidade]
- Email: [Definir contato de suporte]
- Slack/Teams: [Definir canal de suporte]

---

## COMANDOS RÁPIDOS

```bash
# Desenvolvimento
npm start                              # Iniciar dev server
npm run watch                          # Watch mode

# Build
npm run build:widget -- --widgets=analise-variacoes  # Build widget
npm run build                          # Build app completo

# Qualidade
npm run lint                           # ESLint
npm run type-check                     # TypeScript check
npm test                               # Rodar testes
npm test -- --coverage                 # Testes com cobertura

# Limpeza
npm run clean                          # Limpar builds
rm -rf node_modules && npm install     # Reinstalar dependências

# Git
git status                             # Status
git add .                              # Stage all
git commit -m "feat: descrição"        # Commit
git push                               # Push