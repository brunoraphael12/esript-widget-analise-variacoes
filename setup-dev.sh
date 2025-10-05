#!/bin/bash

# Script de Configuração do Ambiente de Desenvolvimento
# Widget: Análise de Variações - ArcGIS Experience Builder 1.18

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Configuração do Ambiente de Desenvolvimento ===${NC}\n"

# Definir caminhos
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WIDGET_DIR="$REPO_DIR/widget"
EXB_DIR="$REPO_DIR/../ArcGIS Experience Builder 1.18"
EXB_WIDGETS_DIR="$EXB_DIR/client/your-extensions/widgets"
WIDGET_NAME="analise-variacoes"
SYMLINK_PATH="$EXB_WIDGETS_DIR/$WIDGET_NAME"

echo "Repositório: $REPO_DIR"
echo "Widget: $WIDGET_DIR"
echo "Experience Builder: $EXB_DIR"
echo ""

# Verificar se Experience Builder existe
if [ ! -d "$EXB_DIR" ]; then
    echo -e "${RED}❌ Erro: Experience Builder não encontrado em:${NC}"
    echo "   $EXB_DIR"
    echo ""
    echo "Por favor, ajuste o caminho no script ou mova o Experience Builder."
    exit 1
fi

echo -e "${GREEN}✓${NC} Experience Builder encontrado"

# Verificar se pasta de widgets existe
if [ ! -d "$EXB_WIDGETS_DIR" ]; then
    echo -e "${RED}❌ Erro: Pasta de widgets não encontrada:${NC}"
    echo "   $EXB_WIDGETS_DIR"
    exit 1
fi

echo -e "${GREEN}✓${NC} Pasta de widgets encontrada"

# Verificar se link simbólico já existe
if [ -L "$SYMLINK_PATH" ]; then
    echo -e "${YELLOW}⚠${NC}  Link simbólico já existe"

    # Verificar se aponta para o lugar correto
    CURRENT_TARGET=$(readlink "$SYMLINK_PATH")
    if [ "$CURRENT_TARGET" = "$WIDGET_DIR" ]; then
        echo -e "${GREEN}✓${NC} Link aponta para o diretório correto"
    else
        echo -e "${YELLOW}⚠${NC}  Link aponta para: $CURRENT_TARGET"
        echo -e "${YELLOW}⚠${NC}  Removendo link antigo..."
        rm "$SYMLINK_PATH"
        echo -e "${GREEN}✓${NC} Link removido. Criando novo..."
        ln -s "$WIDGET_DIR" "$SYMLINK_PATH"
        echo -e "${GREEN}✓${NC} Novo link criado com sucesso"
    fi
elif [ -e "$SYMLINK_PATH" ]; then
    echo -e "${RED}❌ Erro: Já existe um arquivo/pasta com o nome do widget:${NC}"
    echo "   $SYMLINK_PATH"
    echo ""
    echo "Por favor, remova ou renomeie antes de continuar."
    exit 1
else
    echo "Criando link simbólico..."
    ln -s "$WIDGET_DIR" "$SYMLINK_PATH"
    echo -e "${GREEN}✓${NC} Link simbólico criado com sucesso"
fi

# Verificar se link está funcionando
if [ -f "$SYMLINK_PATH/manifest.json" ]; then
    echo -e "${GREEN}✓${NC} Link simbólico funcionando corretamente"
else
    echo -e "${RED}❌ Erro: Link simbólico não está funcionando${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=== Configuração Concluída com Sucesso! ===${NC}"
echo ""
echo "Próximos passos:"
echo ""
echo "1. Navegar até o Experience Builder:"
echo "   cd \"$EXB_DIR\""
echo ""
echo "2. Instalar dependências (se necessário):"
echo "   npm install"
echo ""
echo "3. Iniciar servidor de desenvolvimento:"
echo "   npm start"
echo ""
echo "4. Acessar no navegador:"
echo "   https://localhost:3001"
echo ""
echo "5. O widget '${WIDGET_NAME}' estará disponível na lista de widgets"
echo ""
echo -e "${YELLOW}Nota:${NC} Como o widget está vinculado via link simbólico,"
echo "qualquer alteração no repositório será refletida imediatamente"
echo "no Experience Builder (pode ser necessário refresh do navegador)."
echo ""
