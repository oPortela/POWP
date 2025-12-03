# 🚀 Guia Rápido: Integrar Chatbot com Banco de Dados

## ⚡ Implementação em 5 Passos

### PASSO 1: Criar Controller no Laravel (5 min)

```bash
cd seu-projeto-laravel
php artisan make:controller Api/ChatbotController
```

Copie o código do `API_CHATBOT_INTEGRATION.md` para o controller.

### PASSO 2: Adicionar Rotas (2 min)

Abra `routes/api.php` e adicione:

```php
use App\Http\Controllers\Api\ChatbotController;

Route::prefix('chatbot')->group(function () {
    Route::get('/context', [ChatbotController::class, 'getContext']);
    Route::get('/clientes', [ChatbotController::class, 'getClientes']);
    Route::get('/estoque', [ChatbotController::class, 'getEstoque']);
    Route::get('/vendas', [ChatbotController::class, 'getVendas']);
    Route::get('/financeiro', [ChatbotController::class, 'getFinanceiro']);
});
```

### PASSO 3: Testar Endpoints (3 min)

Abra o navegador ou Postman:

```
GET http://127.0.0.1:8000/api/chatbot/context
```

Deve retornar JSON com dados do banco.

### PASSO 4: Atualizar chatBot.js (5 min)

No arquivo `js/chatBot.js`, adicione no constructor:

```javascript
constructor() {
    // ... código existente ...
    
    // Carregar dados reais do banco
    this.loadSystemContext();
    
    // Atualizar a cada 5 minutos
    setInterval(() => this.loadSystemContext(), 300000);
}

async loadSystemContext() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/chatbot/context');
        const result = await response.json();
        
        if (result.success) {
            this.systemContext.dadosDisponiveis = result.data;
            console.log('✅ Dados carregados do banco!');
        }
    } catch (error) {
        console.log('⚠️ Usando dados fictícios');
    }
}
```

### PASSO 5: Testar no Chatbot (2 min)

1. Abra `chatBot.html`
2. Abra o Console (F12)
3. Faça uma pergunta
4. Veja no console: "✅ Dados carregados do banco!"

---

## 🎯 Exemplo Completo de Integração

### No chatBot.js, atualize as funções de resposta:

```javascript
async getClientesResponse(message) {
    if (message.includes('inadimplent')) {
        // Buscar dados reais
        try {
            const response = await fetch(
                'http://127.0.0.1:8000/api/chatbot/clientes?tipo=inadimplentes'
            );
            const result = await response.json();
            
            if (result.success && result.data) {
                const dados = result.data;
                return `💳 **Inadimplentes (Dados Reais)**
                
Total: ${dados.total} clientes
Valor: R$ ${dados.valor_total.toLocaleString('pt-BR')}

Top 5:
${dados.clientes.slice(0,5).map((c, i) => 
    `${i+1}. ${c.nome} - R$ ${c.valor_devido.toLocaleString('pt-BR')}`
).join('\n')}`;
            }
        } catch (error) {
            console.error('Erro ao buscar inadimplentes:', error);
        }
    }
    
    // Fallback para dados do contexto
    const dados = this.systemContext.dadosDisponiveis.clientes;
    return `👥 Temos ${dados.total} clientes, sendo ${dados.ativos} ativos.`;
}
```

---

## 🔧 Troubleshooting

### Erro: CORS

Adicione no Laravel (`config/cors.php`):

```php
'paths' => ['api/*'],
'allowed_origins' => ['*'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

### Erro: 404 Not Found

Verifique:
1. Laravel está rodando? `php artisan serve`
2. Rota está correta? `php artisan route:list`
3. URL está correta no JavaScript?

### Erro: 500 Internal Server Error

Verifique:
1. Tabelas existem no banco?
2. Models estão corretos?
3. Logs do Laravel: `storage/logs/laravel.log`

---

## 📊 Estrutura de Resposta da API

Todas as respostas seguem este padrão:

```json
{
  "success": true,
  "data": {
    // dados aqui
  },
  "timestamp": "2025-11-21T10:30:00Z"
}
```

### Exemplo: Contexto Completo

```json
{
  "success": true,
  "data": {
    "clientes": {
      "total": 1847,
      "ativos": 1523,
      "inativos": 324,
      "ticketMedio": 1245.50
    },
    "vendas": {
      "mesAtual": 2847650.00,
      "mesAnterior": 2476217.39,
      "crescimento": 15.0
    }
  }
}
```

---

## ✅ Checklist Rápido

- [ ] Controller criado
- [ ] Rotas adicionadas
- [ ] Testado no Postman/navegador
- [ ] JavaScript atualizado
- [ ] Testado no chatbot
- [ ] Console mostra "✅ Dados carregados"
- [ ] Respostas vêm do banco

---

## 🎉 Pronto!

Agora seu chatbot está conectado ao banco de dados e mostra informações reais!

**Tempo total:** ~20 minutos
**Dificuldade:** Fácil
**Resultado:** Chatbot com dados reais do banco
