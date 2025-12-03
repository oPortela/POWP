# 🤖 Integração do Chatbot IA com API Laravel

## 📋 Visão Geral

O chatbot está preparado para funcionar de duas formas:
1. **Modo Local** (atual): Respostas inteligentes baseadas em regras e dados fictícios
2. **Modo API** (futuro): Integração com IA real (OpenAI, Gemini, etc.)

## 🔌 Endpoint da API

### POST `/api/chat/ai`

**URL Completa:** `http://127.0.0.1:8000/api/chat/ai`

### Request Body

```json
{
  "message": "Qual foi o faturamento do mês?",
  "context": {
    "empresa": "Powp ERP",
    "modulos": ["Vendas", "Financeiro", "Estoque", "Clientes", "Fornecedores", "Produtos"],
    "dadosDisponiveis": {
      "clientes": {
        "total": 1847,
        "ativos": 1523,
        "inativos": 324,
        "ticketMedio": 1245.00
      },
      "fornecedores": {
        "total": 7,
        "principais": ["Mondelez Brasil LTDA", "Microsoft LTDS", "Unilever LTDA"]
      },
      "produtos": {
        "total": 1247,
        "estoqueCritico": 23,
        "zerados": 8,
        "valorTotal": 487320.00
      },
      "vendas": {
        "mesAtual": 2847650.00,
        "mesAnterior": 2476217.39,
        "crescimento": 15,
        "ticketMedio": 820.00
      },
      "financeiro": {
        "caixaTesouraria": 9543.87,
        "contasBancarias": 9356.23,
        "contasReceber": 2120.09,
        "contasPagar": 932.25
      }
    }
  },
  "history": [
    {
      "role": "user",
      "content": "Olá"
    },
    {
      "role": "assistant",
      "content": "Olá! Como posso ajudar?"
    }
  ]
}
```

### Response

```json
{
  "success": true,
  "response": "📊 Baseado nos dados do sistema, o faturamento do mês atual é de R$ 2.847.650,00...",
  "timestamp": "2025-11-21T10:30:00Z"
}
```

## 🚀 Implementação no Laravel

### 1. Criar Controller

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatAIController extends Controller
{
    public function chat(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string',
            'context' => 'nullable|array',
            'history' => 'nullable|array'
        ]);

        try {
            // Opção 1: Usar OpenAI
            $response = $this->getOpenAIResponse(
                $validated['message'],
                $validated['context'] ?? [],
                $validated['history'] ?? []
            );

            // Opção 2: Usar Google Gemini
            // $response = $this->getGeminiResponse(...);

            return response()->json([
                'success' => true,
                'response' => $response,
                'timestamp' => now()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erro ao processar mensagem',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function getOpenAIResponse($message, $context, $history)
    {
        $apiKey = env('OPENAI_API_KEY');
        
        // Construir prompt com contexto
        $systemPrompt = $this->buildSystemPrompt($context);
        
        // Preparar mensagens
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt]
        ];
        
        // Adicionar histórico
        foreach ($history as $msg) {
            $messages[] = $msg;
        }
        
        // Adicionar mensagem atual
        $messages[] = ['role' => 'user', 'content' => $message];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4',
            'messages' => $messages,
            'temperature' => 0.7,
            'max_tokens' => 500
        ]);

        if ($response->successful()) {
            return $response->json()['choices'][0]['message']['content'];
        }

        throw new \Exception('Falha na API OpenAI');
    }

    private function buildSystemPrompt($context)
    {
        $dados = $context['dadosDisponiveis'] ?? [];
        
        return "Você é um assistente IA especializado no ERP Powp. " .
               "Você tem acesso aos seguintes dados em tempo real:\n\n" .
               "CLIENTES:\n" .
               "- Total: " . ($dados['clientes']['total'] ?? 0) . "\n" .
               "- Ativos: " . ($dados['clientes']['ativos'] ?? 0) . "\n" .
               "- Ticket Médio: R$ " . number_format($dados['clientes']['ticketMedio'] ?? 0, 2, ',', '.') . "\n\n" .
               "VENDAS:\n" .
               "- Mês Atual: R$ " . number_format($dados['vendas']['mesAtual'] ?? 0, 2, ',', '.') . "\n" .
               "- Crescimento: " . ($dados['vendas']['crescimento'] ?? 0) . "%\n\n" .
               "Responda de forma clara, objetiva e profissional. " .
               "Use emojis quando apropriado para tornar a resposta mais amigável.";
    }

    private function getGeminiResponse($message, $context, $history)
    {
        $apiKey = env('GEMINI_API_KEY');
        
        // Implementação similar usando Google Gemini API
        // https://ai.google.dev/docs
        
        // ... código aqui
    }
}
```

### 2. Adicionar Rota

```php
// routes/api.php

use App\Http\Controllers\Api\ChatAIController;

Route::post('/chat/ai', [ChatAIController::class, 'chat']);
```

### 3. Configurar .env

```env
# OpenAI
OPENAI_API_KEY=sk-your-api-key-here

# Ou Google Gemini
GEMINI_API_KEY=your-gemini-api-key-here
```

### 4. Instalar Dependências (se necessário)

```bash
composer require guzzlehttp/guzzle
```

## 🔐 Segurança

### Adicionar Autenticação

```php
// No Controller
use Illuminate\Support\Facades\Auth;

public function chat(Request $request)
{
    // Verificar autenticação
    if (!Auth::check()) {
        return response()->json([
            'success' => false,
            'error' => 'Não autenticado'
        ], 401);
    }

    // Verificar permissões
    if (!Auth::user()->can('use-chatbot')) {
        return response()->json([
            'success' => false,
            'error' => 'Sem permissão'
        ], 403);
    }

    // ... resto do código
}
```

### Rate Limiting

```php
// routes/api.php

Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::post('/chat/ai', [ChatAIController::class, 'chat']);
});
```

## 📊 Buscar Dados Reais do Banco

```php
private function getSystemContext()
{
    return [
        'empresa' => 'Powp ERP',
        'dadosDisponiveis' => [
            'clientes' => [
                'total' => \App\Models\Cliente::count(),
                'ativos' => \App\Models\Cliente::where('ativo', true)->count(),
                'ticketMedio' => \App\Models\Venda::avg('valor_total')
            ],
            'fornecedores' => [
                'total' => \App\Models\Fornecedor::count(),
                'principais' => \App\Models\Fornecedor::orderBy('total_produtos', 'desc')
                    ->limit(5)
                    ->pluck('nome')
                    ->toArray()
            ],
            'produtos' => [
                'total' => \App\Models\Produto::count(),
                'estoqueCritico' => \App\Models\Produto::where('estoque', '<', 'estoque_minimo')->count(),
                'zerados' => \App\Models\Produto::where('estoque', 0)->count(),
                'valorTotal' => \App\Models\Produto::sum(\DB::raw('estoque * preco_custo'))
            ],
            'vendas' => [
                'mesAtual' => \App\Models\Venda::whereMonth('created_at', now()->month)->sum('valor_total'),
                'mesAnterior' => \App\Models\Venda::whereMonth('created_at', now()->subMonth()->month)->sum('valor_total'),
                'crescimento' => $this->calcularCrescimento(),
                'ticketMedio' => \App\Models\Venda::whereMonth('created_at', now()->month)->avg('valor_total')
            ],
            'financeiro' => [
                'caixaTesouraria' => \App\Models\Caixa::sum('saldo'),
                'contasBancarias' => \App\Models\ContaBancaria::sum('saldo'),
                'contasReceber' => \App\Models\ContaReceber::where('status', 'pendente')->sum('valor'),
                'contasPagar' => \App\Models\ContaPagar::where('status', 'pendente')->sum('valor')
            ]
        ]
    ];
}
```

## 🧪 Testar a API

### Usando cURL

```bash
curl -X POST http://127.0.0.1:8000/api/chat/ai \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "message": "Qual foi o faturamento do mês?",
    "context": {...}
  }'
```

### Usando Postman

1. Método: POST
2. URL: `http://127.0.0.1:8000/api/chat/ai`
3. Headers: `Content-Type: application/json`
4. Body: JSON com message e context

## 📝 Notas Importantes

1. **Custos**: APIs de IA (OpenAI, Gemini) têm custos por uso. Monitore!
2. **Rate Limiting**: Implemente limites para evitar abuso
3. **Cache**: Considere cachear respostas comuns
4. **Logs**: Registre todas as interações para análise
5. **Fallback**: Sempre tenha um fallback local se a API falhar

## 🎯 Próximos Passos

1. ✅ Chatbot funcionando localmente
2. ⏳ Criar endpoint Laravel
3. ⏳ Integrar com OpenAI/Gemini
4. ⏳ Buscar dados reais do banco
5. ⏳ Adicionar autenticação
6. ⏳ Implementar cache
7. ⏳ Adicionar analytics

## 💡 Dicas

- Comece com dados fictícios e vá migrando gradualmente
- Teste bem antes de usar IA real (custos!)
- Mantenha o fallback local sempre funcional
- Monitore o uso e custos da API
- Colete feedback dos usuários

---

**Status Atual:** ✅ Chatbot funcionando com respostas inteligentes locais
**Próximo:** Integração com API Laravel e IA real
