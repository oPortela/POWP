# 🛒 API de Vendas - Guia de Integração Laravel

## 📋 Endpoints Necessários

### 1. Clientes

```php
// GET /api/clientes/{id}
// GET /api/clientes?search={termo}&limit={limit}
// GET /api/clientes?documento={cpf_cnpj}
```

### 2. Produtos

```php
// GET /api/produtos/{id}
// GET /api/produtos?search={termo}&limit={limit}
// GET /api/produtos/{id}/estoque
```

### 3. Vendedores

```php
// GET /api/funcionarios?cargo=vendedor&ativo=true
```

### 4. Transportadoras

```php
// GET /api/transportadoras?ativo=true
// POST /api/transportadoras/calcular-frete
```

### 5. Formas de Pagamento

```php
// GET /api/formas-pagamento?ativo=true
// GET /api/condicoes-pagamento?ativo=true
```

### 6. Vendas

```php
// GET /api/vendas/proximo-numero
// POST /api/vendas
// PUT /api/vendas/{id}
// GET /api/vendas/{id}
// POST /api/vendas/{id}/cancelar
```

---

## 🚀 Implementação no Laravel

### Controller de Vendas

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venda;
use App\Models\VendaItem;
use App\Models\VendaParcela;
use App\Models\Produto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VendaController extends Controller
{
    /**
     * Gera próximo número de pedido
     */
    public function proximoNumero()
    {
        $ultimoNumero = Venda::max('numero_pedido') ?? 100000;
        
        return response()->json([
            'success' => true,
            'numero' => $ultimoNumero + 1
        ]);
    }
    
    /**
     * Salva novo pedido de venda
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero_pedido' => 'required|unique:vendas',
            'data_venda' => 'required|date',
            'cliente_id' => 'required|exists:clientes,id',
            'vendedor_id' => 'required|exists:funcionarios,id',
            'forma_pagamento_id' => 'required',
            'condicao_pagamento_id' => 'required',
            'itens' => 'required|array|min:1',
            'itens.*.produto_id' => 'required|exists:produtos,id',
            'itens.*.quantidade' => 'required|numeric|min:0.01',
            'itens.*.valor_unitario' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        
        try {
            // Criar venda
            $venda = Venda::create([
                'numero_pedido' => $validated['numero_pedido'],
                'data_venda' => $validated['data_venda'],
                'cliente_id' => $validated['cliente_id'],
                'vendedor_id' => $validated['vendedor_id'],
                'transportadora_id' => $request->transportadora_id,
                'tipo_frete' => $request->tipo_frete ?? 'por_conta',
                'valor_frete' => $request->valor_frete ?? 0,
                'valor_seguro' => $request->valor_seguro ?? 0,
                'observacoes' => $request->observacoes,
                'forma_pagamento_id' => $validated['forma_pagamento_id'],
                'condicao_pagamento_id' => $validated['condicao_pagamento_id'],
                'subtotal' => $request->totais['subtotal'],
                'desconto' => $request->totais['desconto'],
                'valor_total' => $request->totais['total'],
                'status' => 'pendente'
            ]);
            
            // Criar itens
            foreach ($validated['itens'] as $item) {
                VendaItem::create([
                    'venda_id' => $venda->id,
                    'produto_id' => $item['produto_id'],
                    'quantidade' => $item['quantidade'],
                    'valor_unitario' => $item['valor_unitario'],
                    'percentual_desconto' => $item['percentual_desconto'] ?? 0,
                    'valor_desconto' => $item['valor_desconto'] ?? 0,
                    'valor_total' => $item['valor_total']
                ]);
                
                // Atualizar estoque
                $produto = Produto::find($item['produto_id']);
                $produto->decrement('estoque', $item['quantidade']);
            }
            
            // Criar parcelas
            if (isset($request->parcelas)) {
                foreach ($request->parcelas as $parcela) {
                    VendaParcela::create([
                        'venda_id' => $venda->id,
                        'numero' => $parcela['numero'],
                        'data_vencimento' => $parcela['data_vencimento'],
                        'valor' => $parcela['valor'],
                        'status' => 'pendente'
                    ]);
                }
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Venda criada com sucesso',
                'data' => $venda->load(['itens.produto', 'parcelas', 'cliente'])
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar venda',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Busca venda por ID
     */
    public function show($id)
    {
        $venda = Venda::with([
            'cliente',
            'vendedor',
            'transportadora',
            'itens.produto',
            'parcelas'
        ])->find($id);
        
        if (!$venda) {
            return response()->json([
                'success' => false,
                'message' => 'Venda não encontrada'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $venda
        ]);
    }
    
    /**
     * Atualiza venda
     */
    public function update(Request $request, $id)
    {
        $venda = Venda::find($id);
        
        if (!$venda) {
            return response()->json([
                'success' => false,
                'message' => 'Venda não encontrada'
            ], 404);
        }
        
        if ($venda->status !== 'pendente') {
            return response()->json([
                'success' => false,
                'message' => 'Apenas vendas pendentes podem ser editadas'
            ], 400);
        }
        
        DB::beginTransaction();
        
        try {
            // Reverter estoque dos itens antigos
            foreach ($venda->itens as $item) {
                $produto = Produto::find($item->produto_id);
                $produto->increment('estoque', $item->quantidade);
            }
            
            // Deletar itens e parcelas antigas
            $venda->itens()->delete();
            $venda->parcelas()->delete();
            
            // Atualizar venda
            $venda->update($request->only([
                'data_venda',
                'cliente_id',
                'vendedor_id',
                'transportadora_id',
                'tipo_frete',
                'valor_frete',
                'valor_seguro',
                'observacoes',
                'forma_pagamento_id',
                'condicao_pagamento_id'
            ]));
            
            // Criar novos itens
            foreach ($request->itens as $item) {
                VendaItem::create([
                    'venda_id' => $venda->id,
                    'produto_id' => $item['produto_id'],
                    'quantidade' => $item['quantidade'],
                    'valor_unitario' => $item['valor_unitario'],
                    'percentual_desconto' => $item['percentual_desconto'] ?? 0,
                    'valor_desconto' => $item['valor_desconto'] ?? 0,
                    'valor_total' => $item['valor_total']
                ]);
                
                // Atualizar estoque
                $produto = Produto::find($item['produto_id']);
                $produto->decrement('estoque', $item['quantidade']);
            }
            
            // Criar novas parcelas
            foreach ($request->parcelas as $parcela) {
                VendaParcela::create([
                    'venda_id' => $venda->id,
                    'numero' => $parcela['numero'],
                    'data_vencimento' => $parcela['data_vencimento'],
                    'valor' => $parcela['valor'],
                    'status' => 'pendente'
                ]);
            }
            
            // Atualizar totais
            $venda->update([
                'subtotal' => $request->totais['subtotal'],
                'desconto' => $request->totais['desconto'],
                'valor_total' => $request->totais['total']
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Venda atualizada com sucesso',
                'data' => $venda->load(['itens.produto', 'parcelas'])
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar venda',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Cancela venda
     */
    public function cancelar(Request $request, $id)
    {
        $venda = Venda::find($id);
        
        if (!$venda) {
            return response()->json([
                'success' => false,
                'message' => 'Venda não encontrada'
            ], 404);
        }
        
        DB::beginTransaction();
        
        try {
            // Reverter estoque
            foreach ($venda->itens as $item) {
                $produto = Produto::find($item->produto_id);
                $produto->increment('estoque', $item->quantidade);
            }
            
            // Atualizar status
            $venda->update([
                'status' => 'cancelado',
                'motivo_cancelamento' => $request->motivo,
                'data_cancelamento' => now()
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Venda cancelada com sucesso'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao cancelar venda',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
```

---

## 📊 Estrutura do Banco de Dados

```sql
-- Tabela de Vendas
CREATE TABLE vendas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    numero_pedido INT UNIQUE NOT NULL,
    data_venda DATE NOT NULL,
    cliente_id BIGINT NOT NULL,
    vendedor_id BIGINT NOT NULL,
    transportadora_id BIGINT NULL,
    tipo_frete VARCHAR(20) DEFAULT 'por_conta',
    valor_frete DECIMAL(10,2) DEFAULT 0,
    valor_seguro DECIMAL(10,2) DEFAULT 0,
    observacoes TEXT NULL,
    forma_pagamento_id BIGINT NOT NULL,
    condicao_pagamento_id BIGINT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente',
    motivo_cancelamento TEXT NULL,
    data_cancelamento DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (vendedor_id) REFERENCES funcionarios(id),
    FOREIGN KEY (transportadora_id) REFERENCES transportadoras(id)
);

-- Tabela de Itens da Venda
CREATE TABLE venda_itens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    venda_id BIGINT NOT NULL,
    produto_id BIGINT NOT NULL,
    quantidade DECIMAL(10,3) NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    percentual_desconto DECIMAL(5,2) DEFAULT 0,
    valor_desconto DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- Tabela de Parcelas
CREATE TABLE venda_parcelas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    venda_id BIGINT NOT NULL,
    numero INT NOT NULL,
    data_vencimento DATE NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente',
    data_pagamento DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE
);
```

---

## 🔗 Rotas da API

```php
// routes/api.php

use App\Http\Controllers\Api\VendaController;

Route::prefix('vendas')->group(function () {
    Route::get('/proximo-numero', [VendaController::class, 'proximoNumero']);
    Route::post('/', [VendaController::class, 'store']);
    Route::get('/{id}', [VendaController::class, 'show']);
    Route::put('/{id}', [VendaController::class, 'update']);
    Route::post('/{id}/cancelar', [VendaController::class, 'cancelar']);
});
```

---

## ✅ Checklist de Implementação

- [ ] Criar tabelas no banco de dados
- [ ] Criar Models (Venda, VendaItem, VendaParcela)
- [ ] Criar Controller
- [ ] Adicionar rotas
- [ ] Testar endpoints com Postman
- [ ] Conectar frontend
- [ ] Testar fluxo completo

---

## 🧪 Testar com Postman

### POST /api/vendas

```json
{
  "numero_pedido": 100001,
  "data_venda": "2025-11-21",
  "cliente_id": 1,
  "vendedor_id": 1,
  "transportadora_id": 1,
  "tipo_frete": "cif",
  "valor_frete": 50.00,
  "valor_seguro": 10.00,
  "observacoes": "Entregar no período da manhã",
  "forma_pagamento_id": 58,
  "condicao_pagamento_id": 102,
  "itens": [
    {
      "produto_id": 1,
      "quantidade": 2,
      "valor_unitario": 499.27,
      "percentual_desconto": 2.3,
      "valor_desconto": 22.96,
      "valor_total": 975.58
    }
  ],
  "parcelas": [
    {
      "numero": 1,
      "data_vencimento": "2025-11-28",
      "valor": 243.90
    },
    {
      "numero": 2,
      "data_vencimento": "2025-12-05",
      "valor": 243.90
    }
  ],
  "totais": {
    "subtotal": 998.54,
    "desconto": 22.96,
    "frete_seguro": 60.00,
    "total": 1035.58
  }
}
```

---

**Pronto para implementar!** 🚀
