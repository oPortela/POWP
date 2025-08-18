# Chat de IA para ERP - Guia de Configuração

## 📋 Pré-requisitos

1. **Python 3.8+** instalado
2. **PostgreSQL** configurado com seu banco de dados
3. **Conta OpenAI** com chave de API

## 🚀 Configuração Rápida

### 1. Instalar Dependências
```bash
pip install -r requirements.txt
```

### 2. Testar Instalação
```bash
python test_chat.py
```

### 3. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` e configure suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas informações:
```
# Configurações do Banco de Dados
DB_HOST=localhost
DB_NAME=nome_do_seu_banco
DB_USER=seu_usuario_postgres
DB_PASS=sua_senha_postgres

# Configuração da OpenAI
OPENAI_API_KEY=sk-sua_chave_openai_aqui

# Configurações do Flask
FLASK_ENV=development
FLASK_DEBUG=True
```

### 3. Obter Chave da OpenAI
1. Acesse [platform.openai.com](https://platform.openai.com)
2. Faça login ou crie uma conta
3. Vá em "API Keys" no menu
4. Clique em "Create new secret key"
5. Copie a chave e cole no arquivo `.env`

### 4. Executar o Sistema
```bash
cd back
python app.py
```

O servidor estará rodando em `http://localhost:5000`

## 💬 Como Usar o Chat de IA

### Funcionalidades Principais:
- **Análise de Dados**: Pergunta sobre vendas, fornecedores, estoque
- **Relatórios**: Solicita relatórios financeiros e operacionais
- **Consultas SQL**: A IA pode sugerir e executar consultas seguras
- **Insights**: Recebe análises inteligentes dos seus dados

### Exemplos de Perguntas:
- "Qual foi o faturamento do mês passado?"
- "Quantos fornecedores estão cadastrados?"
- "Quais produtos estão com estoque baixo?"
- "Mostrar vendas da última semana"
- "Relatório de clientes inadimplentes"

### Segurança:
- ✅ Apenas consultas SELECT são permitidas
- ✅ Palavras perigosas (DROP, DELETE, etc.) são bloqueadas
- ✅ Conexões seguras com o banco de dados
- ✅ Validação de entrada de dados

## 🔧 Estrutura do Sistema

### Backend (Flask):
- `back/app.py` - Servidor principal com APIs
- `/chat` - Endpoint para conversa com IA
- `/chat/query` - Endpoint para executar consultas SQL

### Frontend:
- `chatBot.html` - Interface do chat
- `js/chatBot.js` - Lógica do chat
- `css/chatBot.css` - Estilos do chat

## 🛠️ Personalização

### Adicionar Novos Tipos de Consulta:
1. Edite a função `generate_ai_response()` em `back/app.py`
2. Adicione novos prompts específicos para seu negócio
3. Configure tabelas e campos específicos do seu banco

### Melhorar Respostas da IA:
1. Ajuste o `system_prompt` para incluir mais contexto
2. Adicione exemplos específicos do seu domínio
3. Configure temperatura e max_tokens conforme necessário

## 🚨 Troubleshooting

### Erro de Conexão com Banco:
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Teste a conexão manualmente

### Erro da API OpenAI:
- Verifique se a chave está correta
- Confirme se há créditos na conta OpenAI
- Teste a chave em outro cliente

### Chat não responde:
- Abra o console do navegador (F12)
- Verifique se há erros JavaScript
- Confirme se o servidor Flask está rodando

## 💡 Próximos Passos

1. **Adicionar Autenticação**: Integrar com sistema de login
2. **Histórico de Chat**: Salvar conversas no banco
3. **Análises Avançadas**: Gráficos e dashboards automáticos
4. **Notificações**: Alertas inteligentes baseados em dados
5. **Integração com WhatsApp/Telegram**: Chat externo

## 📞 Suporte

Se precisar de ajuda, verifique:
1. Logs do servidor Flask no terminal
2. Console do navegador (F12 → Console)
3. Arquivo de log do PostgreSQL