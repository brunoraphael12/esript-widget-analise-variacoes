# Instalação do Widget "Análise de Variações"

## Requisitos

- ArcGIS Experience Builder Developer Edition 1.13 ou superior
- Node.js 16.x ou superior
- npm 8.x ou superior

## Instrução de Instalação

### 1. Copiar para o Experience Builder

Copie a pasta `widget` para a pasta correspondente no seu Experience Builder:

```bash
cp -r widget <CAMINHO_EXB>/client/your-extensions/widgets/analise-variacoes
```

**Onde `<CAMINHO_EXB>` é o caminho da sua instalação do Experience Builder.**

### 2. Reiniciar o Experience Builder

Se o servidor de desenvolvimento estiver rodando, pare-o (Ctrl+C) e reinicie:

```bash
cd <CAMINHO_EXB>/client
npm start
```

### 3. Configurar o Widget

Após reiniciar o Experience Builder:

1. Abra ou crie uma aplicação no Experience Builder
2. Clique em "Add Widget" (Adicionar Widget)
3. Procure por "Análise de Variações" na lista de widgets
4. Arraste o widget para a página

### 4. Configuração Inicial

Antes de usar o widget, você precisa configurá-lo:

1. Clique no ícone de configurações do widget (⚙️)
2. Configure as variáveis:
   - Adicione pelo menos uma variável
   - Configure os URLs dos serviços REST (geográfico e alfanumérico)
   - Defina os campos de ligação e filtros
   - Configure os campos de data

3. Exemplo de configuração mínima em `dist/widgets/analise-variacoes/config.json`:

```json
{
  "variaveis": [
    {
      "id": "minha-variavel",
      "nome": "Minha Variável",
      "tipo": "linha",
      "urlGeografico": "https://seu-servidor/arcgis/rest/services/Eixos/FeatureServer/0",
      "urlAlfanumerico": "https://seu-servidor/arcgis/rest/services/Dados/FeatureServer/0",
      "codigoLigacao": "ID_CAMPO",
      "campoEixo": "NOME_EIXO",
      "campoValor": "VALOR",
      "camposFiltro": ["FILTRO1", "FILTRO2"],
      "camposFiltroAlias": {
        "FILTRO1": "Nome do Filtro 1",
        "FILTRO2": "Nome do Filtro 2"
      },
      "tipoData": "separados",
      "campoAno": "ANO",
      "campoMes": "MES"
    }
  ]
}
```

## Configuração de Autenticação (Opcional)

Se seus serviços REST requerem autenticação, configure em `config.json`:

```json
{
  "autenticacao": {
    "enabled": true,
    "portalUrl": "https://www.arcgis.com/sharing/rest",
    "username": "seu-usuario",
    "password": "sua-senha",
    "tokenExpiration": 60
  }
}
```

**⚠️ AVISO DE SEGURANÇA:** Não armazene credenciais em produção. 

## Estrutura de Dados Esperada

### Camada Geográfica
Deve conter:
- Geometrias (pontos, linhas ou polígonos)
- Campo de código de ligação (ex: OBJECTID, ID_EIXO)
- Campo de nome/identificação (ex: NOME, EIXO)

### Tabela Alfanumérica
Deve conter:
- Campo de código de ligação (mesmo valor que na camada geográfica)
- Campo de ano (numérico)
- Campo de mês (texto formato 'YYYY-MM' ou numérico 1-12)
- Campo(s) de valor (numérico)
- Campos de filtro (texto ou numérico)

## Funcionalidades

### Análise SEM Variação
- Selecione uma variável
- Escolha ano e mês(es)
- Aplique filtros
- Clique em "Gerar Mapa"
- Visualize a camada com valores absolutos

### Análise COM Variação
- Selecione "Com variação"
- Configure 1º período (ano + meses)
- Configure 2º período (ano + meses diferentes)
- Aplique filtros
- Clique em "Gerar Mapa"
- Visualize a camada com percentuais de variação

### Filtros Cascateados
- Os filtros se atualizam automaticamente
- Cada filtro mostra apenas valores disponíveis considerando os outros filtros
- Período temporal também influencia os filtros

## Resolução de Problemas

### Widget não aparece na lista
- Verifique se a pasta está em `your-extensions/widgets/`
- Verifique se o `manifest.json` está correto
- Reinicie o servidor de desenvolvimento

### Erro ao gerar mapa
- Verifique se os URLs dos serviços REST estão corretos
- Verifique se os campos configurados existem nos serviços
- Verifique se CORS está habilitado nos serviços
- Abra o console do navegador (F12) para ver erros detalhados

### Query retorna 0 features
- Verifique se há dados para o período selecionado
- Tente com filtros menos restritivos
- Verifique se os nomes dos campos estão corretos