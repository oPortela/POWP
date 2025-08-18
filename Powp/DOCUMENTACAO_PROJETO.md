# 📋 ERP Modal - Guia de Instalação

## 🎯 O que é o projeto

Sistema ERP completo para pequenas e médias empresas com:
- **Frontend**: HTML/CSS/JavaScript responsivo
- **Backend**: PHP + MySQL/PostgreSQL 
- **Chat IA**: OpenAI + alternativa local
- **Funcionalidades**: Login, Dashboard, Cadastros, Relatórios, Chat IA

## 📁 Estrutura do projeto

```
projeto/
├── api/                    # Backend PHP
│   ├── login/             # Sistema de login
│   ├── cadastro/          # Cadastros (clientes, fornecedores)
│   └── conexao/           # Conexão com banco
├── database/              # Scripts SQL
├── css/                   # Estilos
├── js/                    # Scripts JavaScript
├── *.html                 # Páginas do sistema
├── requirements.txt       # Dependências Python (chat IA)
└── .env.example          # Configurações
```

## 🛠️ Pré-requisitos

1. **XAMPP** (Apache + MySQL + PHP)
2. **Python 3.8+** (para chat IA)
3. **Conta OpenAI** (opcional)

## 🚀 Instalação Rápida

### 1. Configurar XAMPP
```bash
# Instalar XAMPP
# Iniciar Apache e MySQL no painel do XAMPP
```

### 2. Configurar Banco de Dados
```sql
-- No phpMyAdmin (http://localhost/phpmyadmin)
CREATE DATABASE powp;

-- Executar scripts da pasta database/:
-- users_table.sql
-- employees_table.sql  
-- contact_table.sql
-- adress_table.sql
```

### 3. Configurar Projeto
```bash
# Copiar projeto para htdocs do XAMPP
# Exemplo: C:\xampp\htdocs\Powp\

# Configurar .env
cp .env.example .env
# Editar .env com suas configurações
```

### 4. Configurar Chat IA (Opcional)
```bash
# Instalar Python dependencies
pip install -r requirements.txt

# No .env, configurar:
OPENAI_API_KEY=sk-sua_chave_aqui
AI_TYPE=auto
```

## ⚙️ Arquivo .env - Configurações

```env
# Banco de Dados
DB_HOST=localhost
DB_NAME=powp
DB_USER=root
DB_PASS=

# Chat IA (opcional)
AI_TYPE=auto
OPENAI_API_KEY=sk-sua_chave_openai_aqui

# Flask (se usar chat IA)
FLASK_ENV=development
FLASK_DEBUG=True
```

## ▶️ Como usar

### 1. Acessar o sistema
- Abrir: `http://localhost/Powp/`
- Login padrão: `admin` / `admin123`

### 2. Funcionalidades disponíveis
- ✅ **Login** - Sistema de autenticação
- ✅ **Dashboard** - Visão geral do sistema
- ✅ **Cadastros** - Clientes e fornecedores
- ✅ **Chat IA** - Assistente inteligente
- ✅ **Relatórios** - Análises e dados

### 3. Chat IA (se configurado)
```bash
# Executar servidor Flask para chat IA
cd back
python app.py

# Chat estará disponível em chatBot.html
```

## 🗄️ Banco de Dados

### Tabelas principais:
- **usuarios** - Login e permissões
- **pwclientes** - Cadastro de clientes
- **pwclientes_fisico** - Pessoas físicas
- **pwclientes_juridico** - Pessoas jurídicas
- **pwcontatos** - Emails e telefones
- **pwendereco** - Endereços

## 🧪 Testar instalação

### 1. Testar sistema básico
- Acessar `http://localhost/Powp/`
- Fazer login
- Navegar pelas páginas

### 2. Testar chat IA (se configurado)
```bash
python test_chat.py
```

## 🚨 Problemas comuns

### Sistema não carrega
- Verificar se XAMPP está rodando
- Verificar se projeto está em `htdocs`
- Verificar permissões de arquivo

### Erro de banco
- Verificar se MySQL está rodando
- Verificar credenciais no `.env`
- Verificar se banco `powp` existe

### Chat IA não funciona
- Verificar se Python está instalado
- Verificar se dependências estão instaladas
- Verificar chave OpenAI no `.env`

## 📝 Checklist de instalação

- [ ] XAMPP instalado e rodando
- [ ] Banco `powp` criado
- [ ] Tabelas criadas (scripts SQL)
- [ ] Projeto copiado para `htdocs`
- [ ] Arquivo `.env` configurado
- [ ] Sistema acessível em `http://localhost/Powp/`
- [ ] Login funcionando
- [ ] Python instalado (para chat IA)
- [ ] Dependências Python instaladas
- [ ] Chat IA funcionando (opcional)

**🎉 Sistema pronto!**