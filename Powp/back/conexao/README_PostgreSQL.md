# Conexão PostgreSQL - Guia Completo

## 📋 Pré-requisitos

### 1. Instalar PostgreSQL
- **Windows**: Baixe do site oficial postgresql.org
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`
- **macOS**: `brew install postgresql`

### 2. Habilitar extensão PHP
Certifique-se que as seguintes extensões estão habilitadas no `php.ini`:
```ini
extension=pdo
extension=pdo_pgsql
extension=pgsql
```

## 🔧 Configuração

### 1. Configurar variáveis de ambiente
Adicione no seu arquivo `.env`:
```env
# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASS=sua_senha
PG_NAME=nome_do_banco
```

### 2. Criar banco de dados
```sql
-- Conecte como superusuário postgres
CREATE DATABASE meu_banco;
CREATE USER meu_usuario WITH PASSWORD 'minha_senha';
GRANT ALL PRIVILEGES ON DATABASE meu_banco TO meu_usuario;
```

## 📁 Arquivos Criados

### `connection_postgresql.php`
Conexão simples usando PDO

### `PostgreSQLConnection.php`
Classe completa para gerenciar conexões com métodos úteis:
- `connect()` - Estabelece conexão
- `select()` - Executa SELECT
- `execute()` - Executa INSERT/UPDATE/DELETE
- `beginTransaction()` - Inicia transação
- `commit()` - Confirma transação
- `rollback()` - Desfaz transação

### `exemplo_uso_postgresql.php`
Exemplo prático mostrando:
- Teste de conexão
- Criação de tabela
- Inserção de dados
- Consultas
- Transações

## 🚀 Como usar

### Uso básico:
```php
<?php
require_once 'PostgreSQLConnection.php';

$db = new PostgreSQLConnection('localhost', '5432', 'meu_banco', 'usuario', 'senha');

// Consultar dados
$users = $db->select("SELECT * FROM usuarios WHERE ativo = ?", [true]);

// Inserir dados
$db->execute("INSERT INTO usuarios (nome, email) VALUES (?, ?)", ['João', 'joao@email.com']);
?>
```

### Com transações:
```php
<?php
try {
    $db->beginTransaction();
    
    $db->execute("INSERT INTO pedidos (cliente_id, total) VALUES (?, ?)", [1, 100.50]);
    $db->execute("UPDATE estoque SET quantidade = quantidade - 1 WHERE produto_id = ?", [5]);
    
    $db->commit();
} catch (Exception $e) {
    $db->rollback();
    echo "Erro: " . $e->getMessage();
}
?>
```

## 🔍 Diferenças MySQL vs PostgreSQL

| Aspecto | MySQL | PostgreSQL |
|---------|-------|------------|
| Conexão | `mysqli` ou `PDO` | `PDO` (recomendado) |
| Porta padrão | 3306 | 5432 |
| Auto increment | `AUTO_INCREMENT` | `SERIAL` |
| Strings | Aspas simples/duplas | Apenas aspas simples |
| Booleans | `TINYINT(1)` | `BOOLEAN` |
| Limit | `LIMIT 10` | `LIMIT 10` |
| Case sensitive | Não | Sim (por padrão) |

## 🛠️ Comandos úteis PostgreSQL

```sql
-- Listar bancos
\l

-- Conectar a um banco
\c nome_do_banco

-- Listar tabelas
\dt

-- Descrever tabela
\d nome_da_tabela

-- Sair
\q
```

## ⚠️ Dicas importantes

1. **Sempre use prepared statements** para evitar SQL injection
2. **Use transações** para operações que envolvem múltiplas tabelas
3. **Configure conexões persistentes** para melhor performance
4. **Trate exceções** adequadamente
5. **Use índices** em colunas frequentemente consultadas

## 🧪 Testando a conexão

Execute o arquivo `exemplo_uso_postgresql.php` no navegador para testar todas as funcionalidades.