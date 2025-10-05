# Guia de Desenvolvimento - Widget Análise de Variações

## Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js 16+ e npm
- ArcGIS Experience Builder 1.18 Developer Edition
- Git

### Estrutura do Projeto

```
esript-widget-analise-variacoes/          # Repositório Git
├── widget/                                # Código fonte do widget
│   ├── src/                              # Código TypeScript/React
│   ├── manifest.json                     # Manifesto do widget
│   ├── config.json                       # Schema de configuração
│   └── icon.svg                          # Ícone do widget
├── setup-dev.sh                          # Script de configuração automática
├── DESENVOLVIMENTO.md                    # Este arquivo
└── CLAUDE.md                             # Documentação técnica completa

ArcGIS Experience Builder 1.18/           # Experience Builder
└── client/
    └── your-extensions/
        └── widgets/
            └── analise-variacoes/        # Link simbólico → /widget
```

## Configuração Inicial

### Método 1: Script Automático (Recomendado)

Execute o script de configuração:

```bash
./setup-dev.sh
```

O script irá:
1. Verificar se o Experience Builder está instalado
2. Criar link simbólico do widget para o Experience Builder
3. Validar a configuração
4. Exibir próximos passos

### Método 2: Configuração Manual

Se preferir configurar manualmente:

```bash
# 1. Criar link simbólico
ln -s "$(pwd)/widget" "../ArcGIS Experience Builder 1.18/client/your-extensions/widgets/analise-variacoes"

# 2. Verificar link
ls -la "../ArcGIS Experience Builder 1.18/client/your-extensions/widgets/analise-variacoes"
```

## Desenvolvimento

### Iniciar Experience Builder

```bash
# Navegar até o Experience Builder
cd "../ArcGIS Experience Builder 1.18"

# Instalar dependências (primeira vez apenas)
npm install

# Iniciar servidor de desenvolvimento
npm start
```

O servidor estará disponível em: `https://localhost:3001`

### Workflow de Desenvolvimento

1. **Editar código** no repositório (`esript-widget-analise-variacoes/widget/src/`)
2. **Mudanças são refletidas automaticamente** no Experience Builder (via link simbólico)
3. **Refresh do navegador** para ver as alterações
4. **Commit das mudanças** no repositório Git

### Estrutura de Desenvolvimento

```typescript
widget/src/
├── runtime/                  # Código principal do widget
│   ├── widget.tsx           # Componente principal
│   ├── components/          # Componentes React
│   ├── services/            # Lógica de negócio
│   ├── utils/               # Utilitários
│   └── hooks/               # Custom React Hooks
├── setting/                 # Painel de configurações
│   ├── setting.tsx          # Componente principal
│   └── components/          # Componentes de configuração
├── types.ts                 # Interfaces TypeScript
└── config.ts                # Configuração do widget
```

## Comandos Úteis

### Development

```bash
# Iniciar dev server (no Experience Builder)
cd "../ArcGIS Experience Builder 1.18"
npm start

# Iniciar dev server com debug
npm start -- --inspect

# Iniciar com logs detalhados
npm start -- --verbose
```

### Build

```bash
# Build do widget (no Experience Builder)
cd "../ArcGIS Experience Builder 1.18"
npm run build:widget -- --widgets=analise-variacoes

# Build completo da aplicação
npm run build
```

### Qualidade de Código

```bash
# Lint (no repositório do widget)
cd esript-widget-analise-variacoes
npm run lint

# Type check
npm run type-check

# Testes (quando implementados)
npm test
```

## Vantagens do Link Simbólico

✅ **Desenvolvimento Ágil:**
- Alterações no código são refletidas imediatamente
- Não precisa copiar arquivos manualmente
- Não precisa rebuild constante

✅ **Controle de Versão:**
- Todo código fica no repositório Git
- Histórico completo de mudanças
- Fácil colaboração em equipe

✅ **Organização:**
- Separação clara entre repositório e Experience Builder
- Experience Builder pode ser atualizado sem perder o widget
- Widget pode ser versionado independentemente

## Troubleshooting

### Widget não aparece na lista

**Problema:** Widget não aparece no Experience Builder

**Solução:**
1. Verificar se link simbólico está correto:
   ```bash
   ls -la "../ArcGIS Experience Builder 1.18/client/your-extensions/widgets/analise-variacoes"
   ```

2. Verificar manifest.json:
   ```bash
   cat widget/manifest.json
   ```

3. Reiniciar servidor:
   ```bash
   cd "../ArcGIS Experience Builder 1.18"
   # Ctrl+C para parar
   npm start
   ```

4. Limpar cache e reiniciar:
   ```bash
   cd "../ArcGIS Experience Builder 1.18"
   npm run clean
   npm start
   ```

### Link simbólico quebrado

**Problema:** Link aponta para caminho errado

**Solução:**
1. Remover link antigo:
   ```bash
   rm "../ArcGIS Experience Builder 1.18/client/your-extensions/widgets/analise-variacoes"
   ```

2. Recriar link:
   ```bash
   ./setup-dev.sh
   ```

### Mudanças não refletem no navegador

**Problema:** Alterações no código não aparecem

**Solução:**
1. Hard refresh no navegador (Cmd+Shift+R no Mac, Ctrl+Shift+R no Windows)
2. Limpar cache do navegador
3. Reiniciar servidor do Experience Builder
4. Verificar se há erros no console do navegador (F12)

### Erro de permissão ao criar link

**Problema:** Sem permissão para criar link simbólico

**Solução (Windows):**
- Executar terminal como Administrador
- Ou habilitar modo de desenvolvedor no Windows

**Solução (Mac/Linux):**
- Verificar permissões da pasta:
  ```bash
  ls -la "../ArcGIS Experience Builder 1.18/client/your-extensions/widgets"
  ```

## Deployment

### Build para Produção

```bash
# 1. No Experience Builder
cd "../ArcGIS Experience Builder 1.18"

# 2. Build do widget
npm run build:widget -- --widgets=analise-variacoes

# 3. Build da aplicação completa
npm run build

# 4. Arquivos estarão em:
# ../ArcGIS Experience Builder 1.18/server/public
```

### Publicar Widget

1. **Download da aplicação** buildada do Experience Builder
2. **Upload para ArcGIS Enterprise:**
   - Portal > Content > Add Item > Application
   - Upload arquivo .zip
   - Configurar título, tags, compartilhamento
3. **Publicar** e compartilhar

## Recursos Adicionais

- [CLAUDE.md](./CLAUDE.md) - Documentação técnica completa
- [README.md](./README.md) - Visão geral do projeto
- [Documentação Experience Builder](https://developers.arcgis.com/experience-builder/)
- [Jimu Framework API](https://developers.arcgis.com/experience-builder/api-reference/jimu-core/)

## Contato

Para dúvidas ou suporte:
- Issues: GitHub Issues (criar sistema de tracking)
- Email: [Definir contato de suporte]

---

**Última atualização:** Dezembro 2024
