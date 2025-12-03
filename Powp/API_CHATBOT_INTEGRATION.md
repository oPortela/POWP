# 🔌 Integração do Chatbot com Banco de Dados

## 📋 Visão Geral

O chatbot precisa de endpoints específicos na API Laravel para buscar dados reais do banco.

## 🎯 Estratégia de Implementação

### Opção 1: Endpoints Específicos (Recomendado)
Criar endpoints dedicados que retornam dados formatados para o chatbot.

### Opção 2: Endpoint Único Inteligente
Um único endpoint que processa a pergunta e retorna a resposta.

---

## 🚀 PARTE 1: Endpoints Específicos (Laravel)

### 1. Controller do Chatbot

```php
<?php
// app/Http/Controllers/Api/ChatbotController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cliente;
use App\Models\Fornecedor;
use App\Models\Produto;
use App\Models\Venda;
use App\Models\ContaReceber;
use App\Models\ContaPagar;
use Illuminate\Support\Facades\DB;

class ChatbotController extends Controller
{
    /**
     * Retorna contexto completo do sistema
     */
    public function getContext()
    {
        try {
            $context = [
                'clientes' => $this->getClientesData(),
                'fornecedores' => $this->getFornecedoresData(),
                'produtos' => $this->getProdutosData(),
                'vendas' => $this->getVendasData(),
                'financeiro' => $this->getFinanceiroData()
            ];

            return response()->json([
                'success' => true,
                'data' => $context,
                'timestamp' => now()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getClientesData()
    {
        return [
            'total' => Cliente::count(),
            'ativos' => Cliente::where('ativo', true)->count(),
            'inativos' => Cliente::where('ativo', false)->count(),
            'ticketMedio' => Venda::avg('valor_total') ?? 0,
            'inadimplentes' => ContaReceber::where('status', 'vencido')->count()
        ];
    }

    private function getFornecedoresData()
    {
        return [
            'total' => Fornecedor::count(),
            'principais' => Fornecedor::orderBy('total_compras', 'desc')
                ->limit(5)
                ->pluck('nome')
                ->toArray()
        ];
    }

    private function getProdutosData()
    {
        return [
            'total' => Produto::count(),
            'estoqueCritico' => Produto::whereRaw('estoque < estoque_minimo')->count(),
            'zerados' => Produto::where('estoque', 0)->count(),
            'valorTotal' => Produto::sum(DB::raw('estoque * preco_custo'))
        ];
    }

    private function getVendasData()
    {
        $mesAtual = Venda::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('valor_total');
            
        $mesAnterior = Venda::whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->sum('valor_total');

        return [
            'mesAtual' => $mesAtual,
            'mesAnterior' => $mesAnterior,
            'crescimento' => $mesAnterior > 0 
                ? (($mesAtual - $mesAnterior) / $mesAnterior) * 100 
                : 0,
            'ticketMedio' => Venda::whereMonth('created_at', now()->month)
                ->avg('valor_total') ?? 0
        ];
    }

    private function getFinanceiroData()
    {
        return [
            'caixaTesouraria' => DB::table('caixa')->sum('saldo') ?? 0,
            'contasBancarias' => DB::table('contas_bancarias')->sum('saldo') ?? 0,
            'contasReceber' => ContaReceber::where('status', 'pendente')->sum('valor'),
            'contasPagar' => ContaPagar::where('status', 'pendente')->sum('valor')
        ];
    }
}
```


### 2. Endpoints Específicos por Categoria

```php
/**
 * Dados de clientes
 */
public function getClientes(Request $request)
{
    $tipo = $request->get('tipo', 'resumo');
    
    switch ($tipo) {
        case 'inadimplentes':
            return $this->getClientesInadimplentes();
        case 'ativos':
            return $this->getClientesAtivos();
        case 'resumo':
        default:
            return response()->json([
                'success' => true,
                'data' => $this->getClientesData()
            ]);
    }
}

private function getClientesInadimplentes()
{
    $inadimplentes = Cliente::whereHas('contasReceber', function($query) {
        $query->where('status', 'vencido');
    })
    ->with(['contasReceber' => function($query) {
        $query->where('status', 'vencido');
    }])
    ->get()
    ->map(function($cliente) {
        return [
            'nome' => $cliente->nome,
            'valor_devido' => $cliente->contasReceber->sum('valor'),
            'dias_atraso' => $cliente->contasReceber->max('dias_atraso')
        ];
    });

    return response()->json([
        'success' => true,
        'data' => [
            'total' => $inadimplentes->count(),
            'valor_total' => $inadimplentes->sum('valor_devido'),
            'clientes' => $inadimplentes
        ]
    ]);
}

/**
 * Dados de estoque
 */
public function getEstoque(Request $request)
{
    $tipo = $request->get('tipo', 'resumo');
    
    switch ($tipo) {
        case 'critico':
            return $this->getEstoqueCritico();
        case 'zerados':
            return $this->getEstoqueZerado();
        case 'resumo':
        default:
            return response()->json([
                'success' => true,
                'data' => $this->getProdutosData()
            ]);
    }
}

private function getEstoqueCritico()
{
    $produtos = Produto::whereRaw('estoque < estoque_minimo')
        ->select('codigo', 'nome', 'estoque', 'estoque_minimo')
        ->orderBy('estoque', 'asc')
        ->limit(10)
        ->get();

    return response()->json([
        'success' => true,
        'data' => [
            'total' => $produtos->count(),
            'produtos' => $produtos
        ]
    ]);
}

/**
 * Dados de vendas
 */
public function getVendas(Request $request)
{
    $periodo = $request->get('periodo', 'mes');
    
    switch ($periodo) {
        case 'semana':
            return $this->getVendasSemana();
        case 'mes':
            return $this->getVendasMes();
        case 'ano':
            return $this->getVendasAno();
        default:
            return response()->json([
                'success' => true,
                'data' => $this->getVendasData()
            ]);
    }
}

private function getVendasSemana()
{
    $vendas = Venda::whereBetween('created_at', [
        now()->startOfWeek(),
        now()->endOfWeek()
    ])
    ->selectRaw('DATE(created_at) as data, SUM(valor_total) as total')
    ->groupBy('data')
    ->get();

    return response()->json([
        'success' => true,
        'data' => [
            'total' => $vendas->sum('total'),
            'por_dia' => $vendas
        ]
    ]);
}

/**
 * Situação financeira
 */
public function getFinanceiro()
{
    $dados = $this->getFinanceiroData();
    
    $dados['saldo_projetado'] = 
        $dados['caixaTesouraria'] + 
        $dados['contasBancarias'] + 
        $dados['contasReceber'] - 
        $dados['contasPagar'];

    return response()->json([
        'success' => true,
        'data' => $dados
    ]);
}
```

### 3. Rotas da API

```php
// routes/api.php

use App\Http\Controllers\Api\ChatbotController;

Route::prefix('chatbot')->group(function () {
    // Contexto completo
    Route::get('/context', [ChatbotController::class, 'getContext']);
    
    // Endpoints específicos
    Route::get('/clientes', [ChatbotController::class, 'getClientes']);
    Route::get('/fornecedores', [ChatbotController::class, 'getFornecedores']);
    Route::get('/estoque', [ChatbotController::class, 'getEstoque']);
    Route::get('/vendas', [ChatbotController::class, 'getVendas']);
    Route::get('/financeiro', [ChatbotController::class, 'getFinanceiro']);
});
```

---

## 🎨 PARTE 2: Atualizar JavaScript do Chatbot

### 1. Adicionar Função para Buscar Contexto

```javascript
// No início da classe ERPChatbot, adicionar:

async loadSystemContext() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/chatbot/context', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar contexto');
        }

        const result = await response.json();
        
        if (result.success) {
            // Atualizar contexto com dados reais
            this.systemContext.dadosDisponiveis = result.data;
            console.log('✅ Contexto carregado do banco de dados');
        }
    } catch (error) {
        console.log('⚠️ Usando dados fictícios (API não disponível)');
        // Mantém os dados fictícios como fallback
    }
}

// No constructor, adicionar:
constructor() {
    // ... código existente ...
    
    // Carregar contexto real do banco
    this.loadSystemContext();
    
    // Atualizar contexto a cada 5 minutos
    setInterval(() => this.loadSystemContext(), 300000);
}
```

### 2. Funções para Consultas Específicas

```javascript
async buscarClientesInadimplentes() {
    try {
        const response = await fetch(
            'http://127.0.0.1:8000/api/chatbot/clientes?tipo=inadimplentes',
            {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            }
        );

        if (!response.ok) throw new Error('Falha na API');

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Erro ao buscar inadimplentes:', error);
        return null;
    }
}

async buscarEstoqueCritico() {
    try {
        const response = await fetch(
            'http://127.0.0.1:8000/api/chatbot/estoque?tipo=critico',
            {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            }
        );

        if (!response.ok) throw new Error('Falha na API');

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Erro ao buscar estoque crítico:', error);
        return null;
    }
}

async buscarVendasSemana() {
    try {
        const response = await fetch(
            'http://127.0.0.1:8000/api/chatbot/vendas?periodo=semana',
            {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            }
        );

        if (!response.ok) throw new Error('Falha na API');

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Erro ao buscar vendas:', error);
        return null;
    }
}
```

### 3. Atualizar Respostas com Dados Reais

```javascript
async getClientesResponse(message) {
    if (message.includes('inadimplent') || message.includes('atraso')) {
        // Buscar dados reais
        const dados = await this.buscarClientesInadimplentes();
        
        if (dados) {
            return `💳 **Relatório de Inadimplência (Dados Reais)**

⚠️ Clientes em atraso: ${dados.total}
💰 Valor total em aberto: R$ ${dados.valor_total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}

**Top 5 Maiores Devedores:**
${dados.clientes.slice(0, 5).map((c, i) => 
    `${i + 1}. ${c.nome} - R$ ${c.valor_devido.toLocaleString('pt-BR', {minimumFractionDigits: 2})} (${c.dias_atraso} dias)`
).join('\n')}

**Recomendação:** Entre em contato urgente com os clientes acima de 30 dias.`;
        }
    }
    
    // Fallback para dados do contexto
    const dados = this.systemContext.dadosDisponiveis.clientes;
    // ... resto do código
}

async getEstoqueResponse(message) {
    if (message.includes('baixo') || message.includes('crítico')) {
        // Buscar dados reais
        const dados = await this.buscarEstoqueCritico();
        
        if (dados && dados.produtos) {
            return `⚠️ **Produtos com Estoque Crítico (Dados Reais)**

🔴 **Total de produtos em alerta:** ${dados.total}

**Produtos que precisam de reposição urgente:**
${dados.produtos.map((p, i) => 
    `${i + 1}. ${p.nome} (${p.codigo})
   📦 Estoque: ${p.estoque} unidades
   ⚠️ Mínimo: ${p.estoque_minimo} unidades`
).join('\n\n')}

**Ação Recomendada:** Fazer pedidos de reposição imediatamente! 🚨`;
        }
    }
    
    // Fallback
    const dados = this.systemContext.dadosDisponiveis.produtos;
    // ... resto do código
}
```



---

## 🔐 PARTE 3: Segurança e Autenticação

### 1. Middleware de Autenticação

```php
// app/Http/Middleware/ChatbotAuth.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ChatbotAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Verificar se usuário está autenticado
        if (!auth()->check()) {
            return response()->json([
                'success' => false,
                'error' => 'Não autenticado'
            ], 401);
        }

        // Verificar permissão para usar chatbot
        if (!auth()->user()->can('use-chatbot')) {
            return response()->json([
                'success' => false,
                'error' => 'Sem permissão para usar o chatbot'
            ], 403);
        }

        return $next($request);
    }
}
```

### 2. Aplicar Middleware nas Rotas

```php
// routes/api.php

Route::middleware(['auth:sanctum', 'chatbot.auth'])->prefix('chatbot')->group(function () {
    Route::get('/context', [ChatbotController::class, 'getContext']);
    Route::get('/clientes', [ChatbotController::class, 'getClientes']);
    // ... outras rotas
});
```

### 3. Adicionar Token no JavaScript

```javascript
// Adicionar no início do arquivo chatBot.js

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const AUTH_TOKEN = localStorage.getItem('auth_token'); // ou sessionStorage

// Função helper para fazer requests autenticados
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);
    
    if (response.status === 401) {
        // Token expirado, redirecionar para login
        window.location.href = '/login.html';
        throw new Error('Sessão expirada');
    }

    return response;
}

// Usar em vez de fetch direto:
async loadSystemContext() {
    try {
        const response = await apiRequest('/chatbot/context');
        const result = await response.json();
        
        if (result.success) {
            this.systemContext.dadosDisponiveis = result.data;
        }
    } catch (error) {
        console.error('Erro ao carregar contexto:', error);
    }
}
```

---

## 📊 PARTE 4: Estrutura do Banco de Dados

### Tabelas Necessárias

```sql
-- Clientes
CREATE TABLE clientes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Fornecedores
CREATE TABLE fornecedores (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    total_compras DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Produtos
CREATE TABLE produtos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(50) UNIQUE,
    nome VARCHAR(255) NOT NULL,
    estoque INT DEFAULT 0,
    estoque_minimo INT DEFAULT 10,
    preco_custo DECIMAL(10,2),
    preco_venda DECIMAL(10,2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Vendas
CREATE TABLE vendas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cliente_id BIGINT,
    valor_total DECIMAL(10,2),
    status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Contas a Receber
CREATE TABLE contas_receber (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cliente_id BIGINT,
    valor DECIMAL(10,2),
    data_vencimento DATE,
    status VARCHAR(50), -- pendente, pago, vencido
    dias_atraso INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Contas a Pagar
CREATE TABLE contas_pagar (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    fornecedor_id BIGINT,
    valor DECIMAL(10,2),
    data_vencimento DATE,
    status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id)
);

-- Caixa
CREATE TABLE caixa (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    descricao VARCHAR(255),
    saldo DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Contas Bancárias
CREATE TABLE contas_bancarias (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    banco VARCHAR(100),
    agencia VARCHAR(20),
    conta VARCHAR(20),
    saldo DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 🧪 PARTE 5: Testes

### 1. Testar Endpoints com cURL

```bash
# Testar contexto completo
curl -X GET http://127.0.0.1:8000/api/chatbot/context \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Testar clientes inadimplentes
curl -X GET "http://127.0.0.1:8000/api/chatbot/clientes?tipo=inadimplentes" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Testar estoque crítico
curl -X GET "http://127.0.0.1:8000/api/chatbot/estoque?tipo=critico" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Testar vendas da semana
curl -X GET "http://127.0.0.1:8000/api/chatbot/vendas?periodo=semana" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Testar no Postman

1. **GET** `http://127.0.0.1:8000/api/chatbot/context`
2. Headers:
   - `Accept: application/json`
   - `Authorization: Bearer {token}`
3. Verificar resposta JSON

---

## 🚀 PARTE 6: Implementação Passo a Passo

### Passo 1: Criar Controller
```bash
php artisan make:controller Api/ChatbotController
```

### Passo 2: Adicionar Rotas
Copiar rotas para `routes/api.php`

### Passo 3: Testar Endpoints
Usar Postman ou cURL

### Passo 4: Atualizar JavaScript
Adicionar funções de busca no `chatBot.js`

### Passo 5: Testar Integração
Fazer perguntas no chatbot e verificar dados reais

---

## 📝 Checklist de Implementação

- [ ] Criar ChatbotController
- [ ] Adicionar rotas da API
- [ ] Testar endpoints com Postman
- [ ] Atualizar chatBot.js com funções de API
- [ ] Adicionar autenticação
- [ ] Testar com dados reais
- [ ] Adicionar cache (opcional)
- [ ] Adicionar logs (opcional)
- [ ] Testar performance
- [ ] Deploy em produção

---

## 💡 Dicas Importantes

1. **Cache**: Use cache para dados que não mudam frequentemente
2. **Rate Limiting**: Limite requests para evitar sobrecarga
3. **Logs**: Registre todas as consultas para análise
4. **Fallback**: Sempre tenha dados fictícios como backup
5. **Performance**: Use índices no banco de dados
6. **Segurança**: Sempre valide e sanitize inputs

---

## 🎯 Próximos Passos

1. Implementar endpoints básicos
2. Testar com dados reais
3. Adicionar mais endpoints conforme necessário
4. Otimizar queries do banco
5. Adicionar cache Redis (opcional)
6. Implementar IA real (OpenAI/Gemini)

---

**Status:** 📋 Guia completo criado
**Pronto para:** Implementação imediata
