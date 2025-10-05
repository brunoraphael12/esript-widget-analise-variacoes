# Widget "Análise de Variações" - ArcGIS Experience Builder 11.3

## CONTEXTO DO PROJETO

**Ambiente:** ArcGIS Experience Builder Developer Edition
**Versão:** 11.3
**Tipo:** Widget Customizado para Análise Temporal de Dados de Transporte

### Objetivo Principal

Widget para análises temporais de dados geográficos de transporte público (oferta, procura, paragens), com capacidade de comparação entre períodos e visualização automática de variações através de camadas simbolizadas dinamicamente.

---

## ESPECIFICAÇÃO FUNCIONAL

### 1. Seleção de Variáveis

**Implementação:**
- Dropdown configurável via BackOffice
- Cada variável: nome, tipo de geometria, URLs REST (geográfico + alfanumérico), campos de ligação/valor, serviços disponíveis

**Variáveis Iniciais:**
1. **Oferta** (linhas) - 8 serviços: AP, IC, Internacional, Regional, InterRegional, Urbanos Porto/Coimbra/Lisboa
2. **Procura** (linhas) - 4 serviços: AP, IC, Regional, Internacional
3. **Paragens** (pontos) - A definir

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
  "servicosDisponiveis": ["AP", "IC", "Internacional", ...]
}
```

### 2. Métodos de Análise

#### 2.1 Análise SEM VARIAÇÃO (padrão)
- Um único período temporal
- Resultado: valores absolutos (soma)
- Simbolização: classificação por cor/grossura

#### 2.2 Análise COM VARIAÇÃO
- Dois períodos temporais
- Cálculo: `((P2 - P1) / P1) × 100`
- Resultado: percentuais de variação
- Simbolização: 6 classes predefinidas com cores específicas

**UI:** Toggle/Radio buttons, padrão "Sem variação"

### 3. Seleção Temporal

**Componentes:**
1. **Dropdown Ano:** Populado dinamicamente com anos disponíveis (`SELECT DISTINCT ANO ORDER BY ANO DESC`)
2. **Checkboxes Meses:** 12 checkboxes + opção "Todos os meses"

**Lógica:** Se múltiplos meses → **SOMA** dos valores

**Modo Com Variação:** Duplicar componente temporal (validar períodos diferentes)

### 4. Filtros Dinâmicos

#### 4.1 Filtro SERVIÇO (obrigatório)
- Seleção múltipla (checkboxes) + opção "Todos"
- Valores: unique values do campo TIPO_SERVICO
- **Regra:** Oferta → 8 serviços | Procura → 4 serviços

#### 4.2 Filtro EIXO/LINHA (obrigatório)
- Seleção múltipla + opção "Todos"
- **Dependente do Serviço:** `WHERE TIPO_SERVICO IN (servicos_selecionados)`

#### 4.3 Configuração de Filtros
```json
{
  "id": "servico",
  "nome": "Serviço",
  "tipo": "multiplo",
  "campo": "TIPO_SERVICO",
  "opcaoTodos": true,
  "dependeDe": null
}
```

### 5. Botão "Gerar Mapa"

**Estados:**
- Disabled: inputs mínimos não preenchidos
- Enabled: todos obrigatórios preenchidos

**Inputs Obrigatórios:**
1. Variável selecionada
2. Método de análise
3. Período(s) temporal(is)
4. Ao menos um serviço

**Ação ao Clicar:**
1. Validar inputs
2. Loading spinner
3. Executar queries REST
4. Processar dados (agregações, joins, cálculos)
5. Criar camada com simbolização
6. Remover camada anterior
7. Zoom to extent
8. Exibir controles de simbolização
9. Mensagem de sucesso

### 6. Geração de Camadas

#### Fluxo SEM VARIAÇÃO

**Query Alfanumérico:**
```sql
SELECT ID_EIXO, SUM(VALOR) as TOTAL
FROM dados_alfanumericos
WHERE ANO = {ano} AND MES IN ({meses})
  AND TIPO_SERVICO IN ({servicos})
  AND EIXO IN ({eixos})
GROUP BY ID_EIXO
```

**Join:**
```javascript
const featuresEnriquecidas = geographicFeatures.map(geoFeature => {
  const alphaData = alphanumericData.find(a => a.ID_EIXO === geoFeature.attributes.ID_EIXO);
  return {
    ...geoFeature,
    attributes: { ...geoFeature.attributes, VALOR_ANALISE: alphaData?.TOTAL || 0 }
  };
});
```

#### Fluxo COM VARIAÇÃO

**Calcular Variação:**
```javascript
const calcularVariacao = (valorP1: number, valorP2: number): number => {
  if (valorP1 === 0 && valorP2 === 0) return 0;
  if (valorP1 === 0) return 100;
  return ((valorP2 - valorP1) / valorP1) * 100;
};
```

### 7. Simbolização

#### SEM VARIAÇÃO
- **Linhas:** cor + grossura | **Pontos/Polígonos:** cor apenas
- Método: Natural Breaks, Equal Interval ou Quantile
- Classes: 3-10 (configurável)
- Controles: slider classes, dropdown método, seletor rampa cores

#### COM VARIAÇÃO (6 classes padrão)

| Classe | Intervalo | Cor | Hex | Label |
|--------|-----------|-----|-----|-------|
| 1 | < -50% | Vermelho escuro | #8B0000 | "Redução > 50%" |
| 2 | -50% a -25% | Vermelho claro | #FF6347 | "Redução 25-50%" |
| 3 | -25% a 0% | Amarelo | #FFFF00 | "Redução < 25%" |
| 4 | 0% a 25% | Verde claro | #90EE90 | "Crescimento < 25%" |
| 5 | 25% a 50% | Verde | #008000 | "Crescimento 25-50%" |
| 6 | > 50% | Verde escuro | #006400 | "Crescimento > 50%" |

**Customização:** alterar classes, intervalos, cores, labels

### 8. Popup Template

#### SEM VARIAÇÃO
```
Título: {NOME_EIXO}
━━━━━━━━━━━━━━━━━━━━
Serviço: {TIPO_SERVICO}
Eixo: {EIXO}
━━━━━━━━━━━━━━━━━━━━
Período: {ANO} - {MESES_FORMATADOS}
Valor: {VALOR_ANALISE:NumberFormat}
```

#### COM VARIAÇÃO
```
Título: {NOME_EIXO}
━━━━━━━━━━━━━━━━━━━━
1º Período: {ANO_P1} - {MESES_P1}
Valor: {VALOR_P1:NumberFormat}

2º Período: {ANO_P2} - {MESES_P2}
Valor: {VALOR_P2:NumberFormat}
━━━━━━━━━━━━━━━━━━━━
Variação: {VARIACAO:NumberFormat}%
[▲ verde / ▼ vermelho]
```

---

## ARQUITETURA TÉCNICA

### Stack Tecnológico

**Core:**
- React 18+ (Functional Components + Hooks)
- TypeScript 4.5+
- Jimu Framework (Experience Builder SDK)
- ArcGIS Maps SDK for JavaScript 4.x

### Estrutura de Arquivos

```
your-extensions/widgets/analise-variacoes/
├── manifest.json
├── config.json
├── icon.svg
├── src/
│   ├── runtime/
│   │   ├── widget.tsx
│   │   ├── components/
│   │   │   ├── VariableSelector.tsx
│   │   │   ├── AnalysisMethodToggle.tsx
│   │   │   ├── TemporalSelector.tsx
│   │   │   ├── DynamicFilters.tsx
│   │   │   ├── FilterCheckboxGroup.tsx
│   │   │   ├── SymbologyControls.tsx
│   │   │   ├── Legend.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── MessageAlert.tsx
│   │   ├── services/
│   │   │   ├── QueryService.ts
│   │   │   ├── AggregationService.ts
│   │   │   ├── AnalysisWorkflow.ts
│   │   │   ├── SymbologyService.ts
│   │   │   └── LayerService.ts
│   │   ├── utils/
│   │   │   ├── ErrorHandler.ts
│   │   │   ├── Validators.ts
│   │   │   ├── Formatters.ts
│   │   │   └── Constants.ts
│   │   └── hooks/
│   │       ├── useMapView.ts
│   │       ├── useAnalysisConfig.ts
│   │       └── useLayerManager.ts
│   ├── setting/
│   │   ├── setting.tsx
│   │   └── components/
│   │       ├── VariableConfiguration.tsx
│   │       ├── FilterConfiguration.tsx
│   │       ├── TextCustomization.tsx
│   │       └── SymbologyDefaults.tsx
│   ├── types.ts
│   └── config.ts
└── styles/
    └── style.scss
```

### Interfaces TypeScript Principais

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

// Simbolização
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

### Fluxo de Dados

```
[1] Usuário seleciona inputs
      ↓
[2] Validação em tempo real
      ↓
[3] Botão "Gerar Mapa" habilitado
      ↓
[4] QueryService.queryAlphanumericData()
      ↓
[5] AggregationService.aggregateByMonths()
      ↓
[6] QueryService.queryGeographicData()
      ↓
[7] QueryService.joinData()
      ↓
[8] [SE COM VARIAÇÃO] AnalysisWorkflow.calculateVariation()
      ↓
[9] SymbologyService.createRenderer()
      ↓
[10] LayerService.createFeatureLayer()
      ↓
[11] LayerService.addLayerToMap()
      ↓
[12] Exibir controles de simbolização
```

---

## REGRAS DE NEGÓCIO CRÍTICAS

### 1. Agregação de Meses
```javascript
const valorTotal = mesesSelecionados.reduce((acc, mes) => acc + getValorDoMes(mes), 0);
```

### 2. Filtros Encadeados
```javascript
const eixosDisponiveis = await queryUniqueValues(
  url, 'EIXO', `TIPO_SERVICO IN ('${servicosSelecionados.join("','")}')`
);
```

### 3. Cálculo de Variação
```javascript
const calcularVariacao = (valorP1: number, valorP2: number): number => {
  if (valorP1 === 0 && valorP2 === 0) return 0;
  if (valorP1 === 0) return 100;
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

## VALIDAÇÕES E TRATAMENTO DE ERROS

### Validações de Input

1. **Variável:** Obrigatória, deve existir na configuração
2. **Período Temporal:** Ano obrigatório, ao menos 1 mês selecionado
3. **Períodos Com Variação:** Ambos obrigatórios, devem ser diferentes
4. **Filtros:** Ao menos 1 serviço (obrigatório), eixo opcional
5. **URLs REST (Settings):** Formato válido HTTPS, teste de conectividade

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

### Mensagens de Erro

```typescript
const ErrorMessages = {
  NO_DATA_FOUND: {
    titulo: 'Nenhum dado encontrado',
    mensagem: 'Não foram encontrados dados para os filtros selecionados.',
    sugestoes: ['Tente período diferente', 'Verifique filtros', 'Selecione "Todos" em Serviço']
  },
  SERVICE_UNAVAILABLE: {
    titulo: 'Serviço indisponível',
    mensagem: 'Não foi possível conectar ao serviço REST.',
    sugestoes: ['Verifique conexão', 'Tente novamente', 'Contate administrador']
  }
};
```

---

## PERFORMANCE E OTIMIZAÇÕES

### 1. Cache de Queries
- Cache em memória para unique values
- TTL configurável (padrão: 5 minutos)
- Invalidar ao mudar configurações

### 2. Debounce
- 300ms em inputs que disparam queries

### 3. React Optimization
```typescript
// Memoização de componentes
const VariableSelector = React.memo(VariableSelectorComponent);

// Valores calculados
const eixosFiltrados = useMemo(() =>
  filtrarEixosPorServico(eixos, servicosSelecionados),
  [eixos, servicosSelecionados]
);

// Callbacks
const handleServicoChange = useCallback((servicos: string[]) => {
  setServicosSelecionados(servicos);
}, []);
```

### 4. Bundle Optimization
- Code splitting por componentes pesados
- Lazy import de módulos Esri
- Tree shaking habilitado

---

## PAINEL DE CONFIGURAÇÕES (SETTINGS)

### Seções Principais

1. **Gestão de Variáveis**
   - Lista de variáveis + botão "Adicionar"
   - Campos: nome, tipo, URLs, campos, serviços
   - Botões: "Carregar Campos", "Remover"

2. **Gestão de Filtros**
   - Lista de filtros + botão "Adicionar"
   - Campos: ID, nome, tipo, campo, dependência
   - Drag & Drop para reordenar

3. **Personalização de Textos**
   - Título widget, labels, mensagens, tooltips

4. **Simbolização Padrão**
   - Sem variação: classes, método, rampa cores
   - Com variação: 6 cores, intervalos, labels

5. **Configurações Avançadas**
   - Cache, timeout, max features, zoom auto, debug mode

6. **Exportar/Importar**
   - Exportar/Importar configuração JSON
   - Resetar para padrão

---

## TROUBLESHOOTING

### Widget não aparece
- Verificar caminho: `your-extensions/widgets/analise-variacoes/`
- Validar manifest.json
- Reiniciar servidor: `npm stop && npm start`

### Erro ao gerar mapa
- Testar URLs no navegador
- Verificar estrutura REST services
- Habilitar CORS no servidor ArcGIS
- Aumentar timeout

### Query retorna 0 features
- Usar "Todos" em Serviço
- Verificar se ano/mês tem dados
- Validar nomes de campos
- Testar query no REST endpoint

### Performance lenta
- Criar índices nos campos de filtro
- Reduzir período
- Usar filtros específicos
- Habilitar cache

---

## BOAS PRÁTICAS

### Código Limpo
```typescript
// ✅ BOM: Funções pequenas e focadas
const calcularVariacao = (p1: number, p2: number): number => {
  if (p1 === 0) return p2 > 0 ? 100 : 0;
  return ((p2 - p1) / p1) * 100;
};

// ❌ RUIM: Função muito grande
const processarAnalise = (config: any) => {
  // 200 linhas...
};
```

### TypeScript Forte
```typescript
// ✅ BOM: Tipos específicos
interface IAnalysisConfig {
  variavel: IVariableConfig;
  metodo: 'sem-variacao' | 'com-variacao';
  periodo1: ITemporalSelection;
}

// ❌ RUIM: any
const config: any = { ... };
```

### Tratamento de Erros
```typescript
// ✅ BOM: Try/catch específico
try {
  const features = await queryService.execute();
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    showError('Verifique conexão');
  } else {
    logError(error);
    showError('Erro inesperado');
  }
}

// ❌ RUIM: Ignorar erros
const features = await queryService.execute().catch(() => []);
```

### React Hooks
```typescript
// ✅ BOM: Dependências corretas
useEffect(() => {
  loadEixos();
}, [servicosSelecionados]);

// ❌ RUIM: [] quando deveria ter dependências
useEffect(() => {
  loadEixos();
}, []);
```

---

## CONFIGURAÇÃO INICIAL

```json
{
  "variaveis": [
    {
      "id": "oferta",
      "nome": "Oferta",
      "tipo": "linha",
      "urlGeografico": "https://servidor/arcgis/rest/services/Eixos/FeatureServer/0",
      "urlAlfanumerico": "https://servidor/arcgis/rest/services/DadosOferta/MapServer/0",
      "codigoLigacao": "ID_EIXO",
      "campoValor": "VALOR_OFERTA",
      "servicosDisponiveis": ["AP", "IC", "Internacional", "Regional", "InterRegional", "Urbanos Porto", "Urbanos Coimbra", "Urbanos Lisboa"]
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
    "botaoGerar": "Gerar mapa",
    "msgSucesso": "Camada gerada com sucesso",
    "msgErro": "Erro ao gerar camada"
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
    "debugMode": false
  }
}
```

---

## DECISÕES ARQUITETURAIS

### 1. React Hooks vs Class Components
**Decisão:** Functional Components + Hooks
**Razões:** Código limpo, melhor performance, padrão moderno, melhor TypeScript

### 2. Múltiplos Services
**Decisão:** Separar QueryService, AggregationService, AnalysisWorkflow, etc.
**Razões:** Separation of Concerns, testes unitários, reutilização, manutenção

### 3. Cache de Queries
**Decisão:** Cache em memória para unique values
**Razões:** Reduz chamadas ao servidor, melhor UX, unique values raramente mudam

### 4. Validação Frontend + Backend
**Decisão:** Validar inputs no widget antes de query
**Razões:** Feedback imediato, reduz queries inválidas, melhor UX, defesa em profundidade

### 5. Remover Camada Anterior
**Decisão:** Sempre remover camada anterior ao gerar nova
**Razões:** Evita confusão, performance, UX limpa, foco no resultado atual

### 6. Classes Fixas para Variação
**Decisão:** 6 classes padrão específicas
**Razões:** Padrão do cliente, interpretação consistente, cores semânticas

### 7. Filtros Encadeados
**Decisão:** Eixo/Linha depende de Serviço
**Razões:** Reduz opções irrelevantes, melhor UX, reflete relação real, performance

### 8. Soma Automática de Meses
**Decisão:** Somar valores quando múltiplos meses
**Razões:** Requisito de negócio, análise trimestral/semestral comum, expectativa do usuário

---

## COMANDOS ÚTEIS

```bash
# Desenvolvimento
npm start                              # Dev server
npm start -- --inspect                 # Debug mode

# Build
npm run build:widget -- --widgets=analise-variacoes

# Qualidade
npm run lint
npm run type-check
npm test

# Git (Conventional Commits)
git commit -m "feat: adiciona filtro X"
git commit -m "fix: corrige cálculo variação"
git commit -m "docs: atualiza README"
```

---

## CONFIGURAÇÃO DO AMBIENTE DE DESENVOLVIMENTO

### Estrutura do Projeto

```
esript-widget-analise-variacoes/          # Repositório Git
├── widget/                                # Código fonte do widget
│   ├── src/                              # TypeScript/React
│   ├── manifest.json                     # Manifesto
│   └── config.json                       # Configuração
└── setup-dev.sh                          # Script de setup automático

../ArcGIS Experience Builder 1.18/        # Experience Builder
└── client/your-extensions/widgets/
    └── analise-variacoes/                # Link simbólico → widget/
```

### Setup Inicial

#### Opção 1: Script Automático (Recomendado)

```bash
# Executar script de configuração
./setup-dev.sh
```

O script cria automaticamente o link simbólico entre o repositório e o Experience Builder.

#### Opção 2: Manual

```bash
# Criar link simbólico
ln -s "$(pwd)/widget" "../ArcGIS Experience Builder 1.18/client/your-extensions/widgets/analise-variacoes"

# Verificar
ls -la "../ArcGIS Experience Builder 1.18/client/your-extensions/widgets/analise-variacoes"
```

### Desenvolvimento

```bash
# 1. Navegar até Experience Builder
cd "../ArcGIS Experience Builder 1.18"

# 2. Iniciar servidor
npm start

# 3. Acessar: https://localhost:3001
```

**Vantagens do Link Simbólico:**
- ✅ Mudanças refletidas automaticamente
- ✅ Não precisa copiar arquivos
- ✅ Controle de versão no repositório Git
- ✅ Desenvolvimento ágil

### Workflow

1. **Editar** código em `esript-widget-analise-variacoes/widget/src/`
2. **Refresh** navegador para ver mudanças
3. **Commit** no repositório Git

### Troubleshooting

**Widget não aparece:**
```bash
# Verificar link
ls -la "../ArcGIS Experience Builder 1.18/client/your-extensions/widgets/analise-variacoes"

# Reiniciar servidor
cd "../ArcGIS Experience Builder 1.18"
npm start
```

**Mudanças não refletem:**
- Hard refresh: Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows)
- Verificar erros no console (F12)
- Reiniciar servidor

**Link quebrado:**
```bash
# Recriar link
./setup-dev.sh
```

---

## RECURSOS

**Documentação:**
- [ArcGIS Experience Builder](https://developers.arcgis.com/experience-builder/)
- [Jimu Framework API](https://developers.arcgis.com/experience-builder/api-reference/jimu-core/)
- [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/latest/)

**Exemplos:**
- [Experience Builder Samples](https://github.com/Esri/experience-builder-samples)
- [Jimu UI Components](https://developers.arcgis.com/experience-builder/storybook/)

**Arquivos do Projeto:**
- [DESENVOLVIMENTO.md](./DESENVOLVIMENTO.md) - Guia completo de desenvolvimento
- [README.md](./README.md) - Visão geral do projeto

---

**Versão:** 1.0.0
**Última atualização:** Dezembro 2024
