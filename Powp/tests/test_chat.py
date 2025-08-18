#!/usr/bin/env python3
"""
Script de teste para o Chat de IA
Execute este script para testar a funcionalidade básica
"""

import requests
import json
import sys
import os

def test_chat_api():
    """Testa a API do chat"""
    base_url = "http://localhost:5000"
    
    print("🧪 Testando Chat de IA...")
    print("=" * 50)
    
    # Teste 1: Verificar se o servidor está rodando
    try:
        response = requests.get(base_url, timeout=5)
        print("✅ Servidor Flask está rodando")
    except requests.exceptions.RequestException:
        print("❌ Erro: Servidor Flask não está rodando")
        print("   Execute: cd back && python app.py")
        return False
    
    # Teste 2: Testar endpoint do chat
    test_messages = [
        "Olá, como você pode me ajudar?",
        "Quantos fornecedores estão cadastrados?",
        "Qual foi o faturamento do mês passado?"
    ]
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n🔍 Teste {i}: {message}")
        
        try:
            response = requests.post(
                f"{base_url}/chat",
                json={"message": message},
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print("✅ Resposta recebida:")
                    print(f"   {data['response'][:100]}...")
                else:
                    print(f"❌ Erro na resposta: {data.get('error', 'Erro desconhecido')}")
            else:
                print(f"❌ Erro HTTP {response.status_code}")
                
        except requests.exceptions.Timeout:
            print("⏰ Timeout - A IA pode estar processando...")
        except requests.exceptions.RequestException as e:
            print(f"❌ Erro de conexão: {e}")
    
    print("\n" + "=" * 50)
    print("✅ Testes concluídos!")
    return True

def check_dependencies():
    """Verifica se as dependências estão instaladas"""
    print("📦 Verificando dependências...")
    
    required_packages = [
        'flask',
        'psycopg2',
        'openai',
        'python-dotenv',
        'requests'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - FALTANDO")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️  Instale os pacotes faltantes:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    return True

def check_config():
    """Verifica se a configuração está correta"""
    print("\n⚙️  Verificando configuração...")
    
    if os.path.exists('.env'):
        print("✅ Arquivo .env encontrado")
        
        # Verificar variáveis importantes
        from dotenv import load_dotenv
        load_dotenv()
        
        db_host = os.getenv('DB_HOST')
        db_name = os.getenv('DB_NAME')
        openai_key = os.getenv('OPENAI_API_KEY')
        
        if db_host and db_name:
            print("✅ Configurações do banco definidas")
        else:
            print("⚠️  Configurações do banco incompletas")
        
        if openai_key and openai_key != 'sua_chave_openai_aqui':
            print("✅ Chave OpenAI configurada")
        else:
            print("⚠️  Chave OpenAI não configurada (usará IA local)")
            
    else:
        print("⚠️  Arquivo .env não encontrado")
        print("   Copie .env.example para .env e configure")

if __name__ == "__main__":
    print("🚀 Teste do Sistema de Chat IA")
    print("=" * 50)
    
    # Verificar dependências
    if not check_dependencies():
        sys.exit(1)
    
    # Verificar configuração
    check_config()
    
    # Testar API
    print("\n" + "=" * 50)
    input("Pressione Enter para testar a API (certifique-se que o servidor está rodando)...")
    test_chat_api()