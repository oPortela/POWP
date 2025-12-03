# Importação de XML de Nota Fiscal Eletrônica (NF-e)

## 📋 Visão Geral

A funcionalidade de importação de XML permite que você registre entradas de mercadorias no estoque diretamente a partir do arquivo XML da Nota Fiscal Eletrônica (NF-e), agilizando o processo de lançamento e reduzindo erros de digitação.

## 🚀 Como Usar

### 1. Acessar a Funcionalidade

1. Navegue até **Estoque** > **Controle de Estoque**
2. Clique no botão **"Importar XML NF-e"** no canto superior direito

### 2. Selecionar o Arquivo XML

Você pode importar o arquivo de duas formas:

**Opção A: Arrastar e Soltar**
- Arraste o arquivo XML da NF-e para a área indicada
- O sistema detectará automaticamente o arquivo

**Opção B: Selecionar Arquivo**
- Clique no botão **"Selecionar Arquivo XML"**
- Navegue até o arquivo XML em seu computador
- Selecione o arquivo e clique em "Abrir"

### 3. Revisar os Dados Importados

Após o upload, o sistema exibirá:

**Informações da Nota Fiscal:**
- Número da NF-e
- Data de Emissão
- Fornecedor (Nome e CNPJ)
- Valor Total
- Total de Itens

**Tabela de Produtos:**
- Lista completa de todos os produtos da nota
- Código do produto
- Descrição
- NCM (Nomenclatura Comum do Mercosul)
- Unidade de medida
- Quantidade
- Valor unitário
- Valor total

### 4. Selecionar Itens para Importar

- Por padrão, todos os itens vêm selecionados
- Você pode desmarcar itens específicos que não deseja importar
- Use o checkbox no cabeçalho para selecionar/desselecionar todos

### 5. Gravar no Sistema

1. Revise cuidadosamente os dados
2. Clique no botão **"Gravar Entrada no Sistema"**
3. Confirme a operação
4. Aguarde a confirmação de sucesso

## 📝 Formato do XML Suportado

O sistema suporta o formato padrão de NF-e brasileiro (layout 4.0), que inclui:

- Tag `<nfeProc>` ou `<NFe>`
- Informações de identificação (`<ide>`)
- Dados do emitente (`<emit>`)
- Detalhes dos produtos (`<det>`)
- Totais da nota (`<total>`)

## ✅ Dados Extraídos Automaticamente

Para cada produto, o sistema extrai:

- **Código do Produto** (`cProd`)
- **Descrição** (`xProd`)
- **NCM** (Classificação fiscal)
- **Unidade** (`uCom`)
- **Quantidade** (`qCom`)
- **Valor Unitário** (`vUnCom`)
- **Valor Total** (`vProd`)
- **Código EAN** (quando disponível)

## 🔄 Integração com o Sistema

Após a importação:

1. **Produtos Novos**: Serão cadastrados automaticamente no sistema
2. **Produtos Existentes**: Terão o estoque atualizado
3. **Histórico**: A movimentação ficará registrada com referência à NF-e
4. **Fornecedor**: Será vinculado aos produtos (se já cadastrado)

## ⚠️ Validações e Alertas

O sistema realiza as seguintes validações:

- ✓ Formato do arquivo XML
- ✓ Estrutura da NF-e
- ✓ Dados obrigatórios dos produtos
- ✓ Valores numéricos válidos
- ✓ Pelo menos um item selecionado

## 🛠️ Integração com API

### Endpoint de Importação

```javascript
POST /api/estoque/importar-nfe

// Payload
{
  "nfe": {
    "numero": "123456",
    "serie": "1",
    "dataEmissao": "15/01/2024",
    "fornecedor": {
      "nome": "Fornecedor XYZ Ltda",
      "cnpj": "12.345.678/0001-90"
    }
  },
  "itens": [
    {
      "codigo": "PROD001",
      "descricao": "Produto Exemplo",
      "ncm": "12345678",
      "unidade": "UN",
      "quantidade": 10,
      "valorUnitario": 50.00,
      "valorTotal": 500.00,
      "ean": "7891234567890"
    }
  ]
}
```

### Resposta de Sucesso

```javascript
{
  "success": true,
  "message": "10 item(ns) importado(s) com sucesso",
  "data": {
    "nfeId": "uuid-da-nfe",
    "produtosNovos": 3,
    "produtosAtualizados": 7,
    "movimentacaoId": "uuid-da-movimentacao"
  }
}
```

## 💡 Dicas e Boas Práticas

1. **Verifique o Fornecedor**: Certifique-se de que o fornecedor está cadastrado no sistema antes da importação
2. **Revise os Dados**: Sempre revise os dados antes de gravar, especialmente quantidades e valores
3. **Produtos Duplicados**: Se um produto já existe, o sistema atualizará apenas o estoque
4. **Backup**: Mantenha uma cópia dos XMLs importados para auditoria
5. **Categorização**: Após a importação, revise e categorize os novos produtos

## 🔍 Troubleshooting

### Erro: "XML inválido"
- Verifique se o arquivo não está corrompido
- Certifique-se de que é um XML de NF-e válido
- Tente abrir o arquivo em um editor de texto

### Erro: "Formato de XML não reconhecido"
- O arquivo pode não ser uma NF-e
- Verifique se contém as tags obrigatórias (`<NFe>`, `<infNFe>`)

### Nenhum item aparece na tabela
- Verifique se a NF-e contém produtos (tag `<det>`)
- O XML pode estar incompleto ou mal formatado

## 📞 Suporte

Para dúvidas ou problemas com a importação de XML:
- Consulte a documentação técnica da NF-e
- Entre em contato com o suporte técnico
- Verifique os logs do sistema para mais detalhes

---

**Última atualização**: Novembro 2024
**Versão**: 1.0.0
