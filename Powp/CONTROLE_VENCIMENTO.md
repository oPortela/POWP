# 📅 Controle de Produtos Próximos ao Vencimento

## ✅ Funcionalidade Implementada

Sistema completo para monitoramento e alerta de produtos próximos à data de vencimento na tela de Controle de Estoque.

## 🎯 Recursos Implementados

### 1. Card de Alerta no Dashboard
- **Novo card "Próx. Vencimento"** com ícone de calendário 📅
- Exibe quantidade de produtos que vencem nos próximos 30 dias
- Cor vermelha (#ff6b6b) para chamar atenção
- Clicável - ao clicar, filtra a tabela para mostrar apenas produtos próximos ao vencimento
- Efeito hover com elevação

### 2. Banner de Alerta
- **Alerta visual** no topo da tabela (fundo amarelo)
- Exibe contagem de produtos próximos ao vencimento
- Link direto para filtrar e visualizar os produtos
- Botão para fechar o alerta
- Só aparece quando há produtos próximos ao vencimento

### 3. Coluna de Validade na Tabela
- **Nova coluna "Validade"** adicionada à tabela de produtos
- Exibe data de vencimento formatada (DD/MM/AAAA)
- Badge colorido indicando urgência:
  - 🔴 **Vencido**: Produto já passou da validade
  - 🔴 **Crítico**: 1-3 dias (badge vermelho pulsante)
  - 🟠 **Urgente**: 4-7 dias (badge laranja)
  - 🟡 **Atenção**: 8-30 dias (badge amarelo)
  - ⚪ **Normal**: Mais de 30 dias (badge cinza)

### 4. Filtro de Vencimento
- **Nova opção no filtro** "Status do Estoque"
- Opção "Próximo ao Vencimento" para filtrar produtos
- Ordena por data mais próxima primeiro

### 5. Campos no Cadastro
- **Campo "Data de Validade"** no formulário de produto
- **Campo "Lote"** para rastreabilidade
- Validação de datas

## 📊 Dados de Exemplo

O sistema vem com 5 produtos de exemplo:

| Produto | Categoria | Vencimento | Status |
|---------|-----------|------------|--------|
| Pão de Forma Integral | Alimentos | 3 dias | 🔴 Crítico |
| Leite Integral 1L | Alimentos | 5 dias | 🔴 Crítico |
| Iogurte Natural 500g | Alimentos | 10 dias | 🟠 Urgente |
| Vitamina C 1000mg | Suplementos | 15 dias | 🟡 Atenção |
| Paracetamol 500mg | Medicamentos | 25 dias | 🟡 Atenção |

## 🎨 Interface Visual

### Card de Alerta
```
┌─────────────────────────────┐
│ Próx. Vencimento      📅    │
│ 5                           │
└─────────────────────────────┘
```

### Banner de Alerta
```
⚠️ Atenção: Produtos Próximos ao Vencimento
Existem 5 produto(s) que vencem nos próximos 30 dias.
[Ver produtos]                                    [×]
```

### Coluna de Validade
```
Validade
─────────────────
26/11/2024
[3 dias] 🔴
```

## 🔧 Arquivos Criados/Modificados

### Modificados:
1. **controleEstoque.html**
   - ✅ Adicionado 5º card (Próx. Vencimento)
   - ✅ Banner de alerta
   - ✅ Coluna de validade na tabela
   - ✅ Campos de validade e lote no formulário
   - ✅ Opção de filtro

2. **css/components.css**
   - ✅ Estilos para badges de validade
   - ✅ Animação de pulso para críticos
   - ✅ Cores por nível de urgência
   - ✅ Responsividade dos cards

### Criados:
1. **js/estoque/expirationManager.js**
   - ✅ Classe ExpirationManager
   - ✅ Cálculo de dias até vencimento
   - ✅ Classificação por urgência
   - ✅ Renderização de produtos
   - ✅ Filtros e ordenação
   - ✅ Dados de exemplo

2. **CONTROLE_VENCIMENTO.md**
   - ✅ Documentação completa

## 💻 Lógica de Negócio

### Cálculo de Urgência
```javascript
getDaysUntilExpiration(expirationDate) {
    const today = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = expiration - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
```

### Classificação de Status
- **Vencido**: dias < 0
- **Crítico**: dias ≤ 3 (vermelho pulsante)
- **Urgente**: dias ≤ 7 (laranja)
- **Atenção**: dias ≤ 30 (amarelo)
- **Normal**: dias > 30 (cinza)

## 🔌 Integração com API

### Endpoint Sugerido
```javascript
GET /api/estoque/produtos-vencimento?dias=30

// Response
{
  "success": true,
  "data": {
    "total": 5,
    "produtos": [
      {
        "id": 1,
        "codigo": "PROD001",
        "nome": "Leite Integral 1L",
        "validade": "2024-12-01",
        "diasRestantes": 5,
        "lote": "L20241125",
        "quantidade": 50,
        "status": "critico"
      }
    ]
  }
}
```

### Cadastro de Produto com Validade
```javascript
POST /api/estoque/produtos

{
  "codigo": "PROD001",
  "nome": "Leite Integral 1L",
  "categoria": "Alimentos",
  "fornecedor_id": 1,
  "quantidade": 50,
  "quantidade_minima": 20,
  "validade": "2024-12-01",
  "lote": "L20241125",
  "preco_custo": 3.50,
  "preco_venda": 5.90
}
```

## 🎯 Fluxo de Uso

1. **Usuário acessa Controle de Estoque**
   → Sistema verifica produtos próximos ao vencimento
   → Atualiza card e exibe banner se necessário

2. **Usuário clica no card "Próx. Vencimento"**
   → Tabela é filtrada automaticamente
   → Produtos ordenados por data mais próxima
   → Scroll suave até a tabela

3. **Usuário visualiza produtos na tabela**
   → Vê data de vencimento
   → Badge colorido indica urgência
   → Pode tomar ações (editar, remover)

4. **Usuário cadastra novo produto**
   → Preenche data de validade
   → Informa lote para rastreabilidade
   → Sistema monitora automaticamente

## 📱 Responsividade

- **Desktop**: 5 cards em linha
- **Tablet (< 1400px)**: 3 cards por linha
- **Mobile (< 992px)**: 2 cards por linha
- **Mobile pequeno (< 576px)**: 1 card por linha

## ⚡ Funcionalidades Automáticas

1. **Verificação ao Carregar**
   - Sistema verifica vencimentos automaticamente
   - Atualiza contadores
   - Exibe alertas se necessário

2. **Ordenação Inteligente**
   - Produtos mais próximos ao vencimento aparecem primeiro
   - Facilita priorização de ações

3. **Alertas Visuais**
   - Cores chamativas para produtos críticos
   - Animação de pulso para urgência máxima
   - Banner destacado no topo

## 🎨 Cores e Significados

| Cor | Hex | Significado | Ação Sugerida |
|-----|-----|-------------|---------------|
| 🔴 Vermelho | #dc3545 | Vencido | Remover do estoque |
| 🔴 Vermelho Claro | #ff6b6b | Crítico (1-3 dias) | Promoção urgente |
| 🟠 Laranja | #ff9800 | Urgente (4-7 dias) | Oferta especial |
| 🟡 Amarelo | #ffc107 | Atenção (8-30 dias) | Monitorar vendas |
| ⚪ Cinza | #e9ecef | Normal (>30 dias) | Sem ação necessária |

## 🚀 Próximas Melhorias

1. **Notificações**
   - Email automático para produtos críticos
   - Push notifications no sistema
   - Relatório diário de vencimentos

2. **Ações Rápidas**
   - Botão para criar promoção
   - Transferência entre lojas
   - Devolução ao fornecedor

3. **Relatórios**
   - Histórico de produtos vencidos
   - Perdas por vencimento
   - Análise de giro por validade

4. **Integração**
   - Sugestão automática de descontos
   - Alerta para equipe de vendas
   - Dashboard gerencial

## ✨ Benefícios

- 📉 **Redução de Perdas**: Identificação precoce de produtos próximos ao vencimento
- 💰 **Economia**: Possibilidade de criar promoções antes do vencimento
- 📊 **Controle**: Visibilidade completa do estoque por validade
- ⚡ **Agilidade**: Filtros e alertas facilitam tomada de decisão
- 🎯 **Precisão**: Rastreabilidade por lote

---

**Status**: ✅ Implementação Completa
**Pronto para**: Integração com Backend
**Testado**: Interface e Lógica de Cálculo
