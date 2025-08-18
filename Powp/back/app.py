from flask import Flask, request, jsonify, send_from_directory
import psycopg2
import psycopg2.extras
import openai
import os
from datetime import datetime
from dotenv import load_dotenv
from ai_local import generate_local_ai_response

# Carregar variáveis de ambiente
load_dotenv()

# --- CONFIGURAÇÃO ---
# Crie o aplicativo Flask.
# A configuração static_folder='.' permite que o Flask sirva os arquivos (html, css, js) do diretório atual.
app = Flask(__name__, static_folder='.', static_url_path='')

# Detalhes de conexão com o banco de dados
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_NAME = os.getenv('DB_NAME', 'seu_banco_de_dados')
DB_USER = os.getenv('DB_USER', 'seu_usuario')
DB_PASS = os.getenv('DB_PASS', 'sua_senha')

# Configuração da OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# Configuração do tipo de IA (openai ou local)
AI_TYPE = os.getenv('AI_TYPE', 'auto')  # auto, openai, local

def get_db_connection():
    """Estabelece uma conexão com o banco de dados."""
    conn = psycopg2.connect(host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASS)
    return conn

def get_database_schema():
    """Obtém o esquema do banco de dados para contexto da IA."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Consulta para obter informações das tabelas
    cursor.execute("""
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
    """)
    
    schema_info = cursor.fetchall()
    cursor.close()
    conn.close()
    
    # Organizar por tabela
    schema_dict = {}
    for table, column, data_type in schema_info:
        if table not in schema_dict:
            schema_dict[table] = []
        schema_dict[table].append(f"{column} ({data_type})")
    
    return schema_dict

def execute_safe_query(query):
    """Executa consultas seguras no banco de dados."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # Lista de palavras proibidas para segurança
        forbidden_words = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'TRUNCATE']
        query_upper = query.upper()
        
        for word in forbidden_words:
            if word in query_upper:
                return {"error": "Operação não permitida por segurança"}
        
        cursor.execute(query)
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Converter para lista de dicionários
        return [dict(row) for row in results]
    
    except Exception as e:
        return {"error": str(e)}

def generate_ai_response(user_question, context_data=None):
    """Gera resposta usando IA baseada na pergunta do usuário."""
    try:
        # Obter esquema do banco
        schema = get_database_schema()
        
        # Decidir qual IA usar
        if AI_TYPE == 'local':
            return generate_local_ai_response(user_question, context_data, schema)
        elif AI_TYPE == 'openai':
            return generate_openai_response(user_question, context_data, schema)
        else:  # auto
            # Tentar OpenAI primeiro, depois local
            if openai.api_key:
                try:
                    return generate_openai_response(user_question, context_data, schema)
                except:
                    return generate_local_ai_response(user_question, context_data, schema)
            else:
                return generate_local_ai_response(user_question, context_data, schema)
    
    except Exception as e:
        return f"Erro ao processar pergunta: {str(e)}"

def generate_openai_response(user_question, context_data=None, schema=None):
    """Gera resposta usando OpenAI."""
    system_prompt = f"""
    Você é um assistente especializado em análise de dados de um sistema empresarial.
    
    Esquema do banco de dados disponível:
    {schema}
    
    Instruções:
    1. Responda perguntas sobre os dados do sistema em português
    2. Se precisar de dados específicos, sugira uma consulta SQL segura (apenas SELECT)
    3. Seja claro e objetivo nas respostas
    4. Se não souber algo, seja honesto
    5. Foque em insights úteis para o negócio
    
    Dados de contexto (se disponível): {context_data}
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_question}
        ],
        max_tokens=500,
        temperature=0.7
    )
    
    return response.choices[0].message.content

# --- ROTAS DA API ---

@app.route('/login', methods=['POST'])
def login():
    """Processa a tentativa de login."""
    data = request.get_json()
    if not data or not data.get('usuario') or not data.get('senha'):
        return jsonify({"success": False, "message": "Dados de login ausentes."}), 400

    username = data.get('usuario')
    password = data.get('senha')

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    # Consulta segura para evitar SQL Injection
    cursor.execute("SELECT * FROM usuarios WHERE usuario = %s OR email = %s", (username, username))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    # IMPORTANTE: Esta é uma verificação de senha em texto plano.
    # NUNCA FAÇA ISSO EM PRODUÇÃO. Use hashes de senha.
    if user and user['senha'] == password:
        # Login bem-sucedido
        return jsonify({"success": True})
    else:
        # Login falhou
        return jsonify({"success": False, "message": "Usuário ou senha inválidos."}), 401

@app.route('/chat', methods=['POST'])
def chat_ai():
    """Endpoint para o chat com IA."""
    data = request.get_json()
    if not data or not data.get('message'):
        return jsonify({"error": "Mensagem não fornecida"}), 400
    
    user_message = data.get('message')
    
    try:
        # Gerar resposta da IA
        ai_response = generate_ai_response(user_message)
        
        return jsonify({
            "success": True,
            "response": ai_response,
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({"error": f"Erro no chat: {str(e)}"}), 500

@app.route('/chat/query', methods=['POST'])
def execute_query():
    """Endpoint para executar consultas SQL sugeridas pela IA."""
    data = request.get_json()
    if not data or not data.get('query'):
        return jsonify({"error": "Query não fornecida"}), 400
    
    query = data.get('query')
    
    try:
        results = execute_safe_query(query)
        
        if "error" in results:
            return jsonify({"error": results["error"]}), 400
        
        return jsonify({
            "success": True,
            "data": results,
            "count": len(results)
        })
    
    except Exception as e:
        return jsonify({"error": f"Erro na consulta: {str(e)}"}), 500

# --- ROTA PARA SERVIR A PÁGINA DE LOGIN ---

@app.route('/')
def serve_login_page():
    """Serve o arquivo login.html como página principal."""
    return send_from_directory('.', 'login.html')

# --- INICIAR O SERVIDOR ---

if __name__ == '__main__':
    # O modo debug reinicia o servidor automaticamente após alterações no código.
    # Não use em produção.
    app.run(debug=True, port=5000)