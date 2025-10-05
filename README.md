# Widget "Análise de Variações" - ArcGIS Experience Builder

## Descrição

Widget customizado para ArcGIS Experience Builder que permite análises temporais de dados geográficos de transporte público (oferta, procura, paragens), com capacidade de comparação entre períodos e visualização automática de variações através de camadas simbolizadas dinamicamente.

## 🚀 Quick Start

### Pré-requisitos

- Node.js 16+ e npm
- ArcGIS Experience Builder 1.18 Developer Edition
- Git

### Setup Rápido (2 minutos)

```bash
# 1. Clone o repositório
git clone [URL_DO_REPOSITORIO]
cd esript-widget-analise-variacoes

# 2. Execute o script de configuração
./setup-dev.sh

# 3. Inicie o Experience Builder
cd "../ArcGIS Experience Builder 1.18"
npm start

# 4. Acesse https://localhost:3001
```

✅ O widget estará disponível na lista de widgets!

### Como Funciona?

O script `setup-dev.sh` cria automaticamente um **link simbólico** entre:
- Este repositório → `esript-widget-analise-variacoes/widget/`
- Experience Builder → `ArcGIS Experience Builder 1.18/client/your-extensions/widgets/analise-variacoes/`

**Vantagens:**
- ✅ Mudanças no código refletidas automaticamente
- ✅ Não precisa copiar arquivos manualmente
- ✅ Controle de versão total no Git
- ✅ Experience Builder pode ser atualizado sem perder o widget

## 📁 Estrutura do Projeto

```
esript-widget-analise-variacoes/          # Repositório Git
├── widget/                                # Código fonte do widget
│   ├── src/
│   │   ├── runtime/                      # Código principal
│   │   │   ├── widget.tsx               # Componente principal
│   │   │   ├── components/              # Componentes React
│   │   │   ├── services/                # Lógica de negócio
│   │   │   ├── utils/                   # Utilitários
│   │   │   └── hooks/                   # Custom Hooks
│   │   ├── setting/                     # Painel de configurações
│   │   │   ├── setting.tsx
│   │   │   └── components/
│   │   ├── types.ts                     # TypeScript interfaces
│   │   └── config.ts
│   ├── manifest.json                     # Manifesto do widget
│   ├── config.json                       # Schema de configuração
│   └── icon.svg
├── setup-dev.sh                          # Script de configuração
├── DESENVOLVIMENTO.md                    # Guia completo de desenvolvimento
├── CLAUDE.md                             # Documentação técnica completa
└── README.md                             # Este arquivo

../ArcGIS Experience Builder 1.18/        # Experience Builder
└── client/your-extensions/widgets/
    └── analise-variacoes/                # Link simbólico → widget/
```

## ⭐ Características Principais

### Funcionalidades

- **Seleção de Variáveis**: Escolha entre diferentes tipos de dados (Oferta, Procura, Paragens)
- **Métodos de Análise**:
  - **Sem Variação**: Análise de um único período temporal
  - **Com Variação**: Comparação entre dois períodos com cálculo de variação percentual
- **Seleção Temporal**: Escolha ano e mês(es) para análise
- **Filtros Dinâmicos**: Filtros encadeados por Serviço e Eixo/Linha
- **Simbolização Automática**:
  - Classificação por cor e grossura (linhas)
  - Cores semânticas para variação (vermelho=redução, verde=crescimento)
- **Popups Informativos**: Exibição detalhada dos dados analisados

### Especificações Técnicas

- **Plataforma**: ArcGIS Experience Builder 1.18
- **Framework**: React 18+ com TypeScript 4.5+
- **SDK**: Jimu Framework + ArcGIS Maps SDK for JavaScript 4.x
- **Arquitetura**: Componentes funcionais com Hooks

## 🛠 Desenvolvimento

### Workflow Diário

```bash
# 1. Editar código
# Edite arquivos em: esript-widget-analise-variacoes/widget/src/

# 2. Visualizar mudanças
# Refresh do navegador (Cmd+Shift+R ou Ctrl+Shift+R)

# 3. Commit
git add .
git commit -m "feat: sua mensagem"
git push
```

### Comandos Úteis

```bash
# Desenvolvimento (no Experience Builder)
cd "../ArcGIS Experience Builder 1.18"
npm start                    # Dev server
npm start -- --inspect       # Debug mode
npm start -- --verbose       # Logs detalhados

# Build
npm run build:widget -- --widgets=analise-variacoes

# Qualidade (no repositório)
npm run lint
npm run type-check
npm test
```

### Troubleshooting

#### Widget não aparece
```bash
# Verificar link simbólico
ls -la "../ArcGIS Experience Builder 1.18/client/your-extensions/widgets/analise-variacoes"

# Recriar link se necessário
./setup-dev.sh

# Reiniciar servidor
cd "../ArcGIS Experience Builder 1.18"
npm start
```

#### Mudanças não refletem
- Hard refresh: **Cmd+Shift+R** (Mac) ou **Ctrl+Shift+R** (Windows)
- Verificar erros no console do navegador (F12)
- Reiniciar servidor do Experience Builder

## 📖 Documentação

- **[DESENVOLVIMENTO.md](./DESENVOLVIMENTO.md)** - Guia completo de desenvolvimento
- **[CLAUDE.md](./CLAUDE.md)** - Documentação técnica detalhada
  - Especificação funcional completa
  - Arquitetura técnica
  - Interfaces TypeScript
  - Regras de negócio
  - Boas práticas

## 🎯 Configuração (BackOffice)

### Painel de Settings

1. **Gestão de Variáveis**
   - Adicionar/remover variáveis de análise
   - Configurar URLs REST (geográfico e alfanumérico)
   - Definir campos de ligação e valores

2. **Gestão de Filtros**
   - Configurar filtros customizados
   - Definir dependências entre filtros
   - Reordenar filtros (drag & drop)

3. **Personalização de Textos**
   - Customizar todos os textos da interface

4. **Simbolização Padrão**
   - Definir padrões de classificação
   - Configurar cores e intervalos

5. **Configurações Avançadas**
   - Cache, timeout, debug mode

### Exemplo de Configuração

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
      "servicosDisponiveis": ["AP", "IC", "Internacional", "Regional"]
    }
  ]
}
```

## 📝 Uso (FrontOffice)

1. **Selecionar Variável**: Escolha o tipo de análise
2. **Escolher Método**: Sem variação ou Com variação
3. **Definir Período**: Ano e mês(es)
4. **Aplicar Filtros**: Serviços e eixos
5. **Gerar Mapa**: Clique para executar análise
6. **Ajustar Simbolização**: Modifique cores e classes

## 🏗 Arquitetura

### Stack Tecnológico

- **React 18+**: Functional Components + Hooks
- **TypeScript 4.5+**: Tipagem forte
- **Jimu Framework**: SDK do Experience Builder
- **ArcGIS Maps SDK**: Manipulação de mapas e dados geográficos

### Decisões Arquiteturais

1. ✅ **React Hooks** (vs Class Components) - Código mais limpo, melhor performance
2. ✅ **Múltiplos Services** - Separação de responsabilidades
3. ✅ **Cache de Queries** - Melhor performance
4. ✅ **Link Simbólico** - Desenvolvimento ágil

## 🚢 Deploy

```bash
# 1. Build do widget
cd "../ArcGIS Experience Builder 1.18"
npm run build:widget -- --widgets=analise-variacoes

# 2. Build da aplicação
npm run build

# 3. Publicar no ArcGIS Enterprise
# Portal > Content > Add Item > Application
# Upload do arquivo .zip gerado
```

## 📚 Recursos Adicionais

**Documentação:**
- [ArcGIS Experience Builder](https://developers.arcgis.com/experience-builder/)
- [Jimu Framework API](https://developers.arcgis.com/experience-builder/api-reference/jimu-core/)
- [ArcGIS Maps SDK](https://developers.arcgis.com/javascript/latest/)

**Exemplos:**
- [Experience Builder Samples](https://github.com/Esri/experience-builder-samples)
- [Jimu UI Components](https://developers.arcgis.com/experience-builder/storybook/)

## 📄 Licença

MIT

## 👥 Autor

Esript

## 💬 Contato

Para suporte ou dúvidas:
- Issues: GitHub Issues
- Email: [Definir contato]

---

**Versão**: 1.0.0
**Última atualização**: Dezembro 2024
