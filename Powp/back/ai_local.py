"""
Alternativa para IA local usando Ollama ou modelos open-source
Use este arquivo se não quiser usar OpenAI
"""

import requests
import json
from datetime import datetime

class LocalAI:
    def __init__(self, model_url="http://localhost:11434"):
        self.model_url = model_url
        self.model_name = "llama2"  # ou outro modelo disponível
    
    def generate_response(self, user_question, context_data=None, schema=None):
        """Gera resposta usando IA local (Ollama)"""
        try:
            system_prompt = f"""
            Você é um assistente especializado em análise de dados de um sistema ERP empresarial.
            
            Esquema do banco de dados disponível:
            {schema}
            
            Instruções:
            1. Responda perguntas sobre os dados do sistema em português
            2. Se precisar de dados específicos, sugira uma consulta SQL segura (apenas SELECT)
            3. Seja claro, objetivo e profissional
            4. Foque em insights úteis para o negócio
            5. Se não souber algo, seja honesto
            
            Dados de contexto: {context_data}
            
            Pergunta do usuário: {user_question}
            """
            
            # Requisição para Ollama
            response = requests.post(
                f"{self.model_url}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": system_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "max_tokens": 500
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('response', 'Erro ao gerar resposta')
            else:
                return "Erro: Serviço de IA local não disponível"
                
        except requests.exceptions.RequestException:
            # Fallback para respostas pré-definidas
            return self.fallback_response(user_question)
        except Exception as e:
            return f"Erro ao processar pergunta: {str(e)}"
    
    def fallback_response(self, user_question):
        """Respostas de fallback quando a IA não está disponível"""
        question_lower = user_question.lower()
        
        responses = {
            'faturamento': "📊 Para consultar o faturamento, acesse o módulo Financeiro → Relatórios → Faturamento Mensal",
            'fornecedor': "📋 Informações sobre fornecedores estão disponíveis em Cadastros → Fornecedores",
            'estoque': "📦 Para verificar o estoque, acesse Estoque → Consulta de Produtos",
            'vendas': "💰 Relatórios de vendas estão em Vendas → Relatórios → Vendas por Período",
            'cliente': "👥 Dados de clientes estão em Cadastros → Clientes",
            'produto': "🏷️ Informações de produtos em Cadastros → Produtos"
        }
        
        for keyword, response in responses.items():
            if keyword in question_lower:
                return response
        
        return """
        🤖 Desculpe, não consegui processar sua pergunta no momento. 
        
        Você pode tentar:
        • Perguntas sobre faturamento e vendas
        • Consultas sobre fornecedores e clientes
        • Informações sobre estoque e produtos
        • Relatórios financeiros
        
        Ou navegue pelos menus do sistema para encontrar as informações desejadas.
        """

# Função para usar no app.py
def generate_local_ai_response(user_question, context_data=None, schema=None):
    """Função wrapper para usar no app principal"""
    ai = LocalAI()
    return ai.generate_response(user_question, context_data, schema)