class ERPChatbot {
    constructor() {
        this.messages = [];
        this.isLoading = false;
        this.messageIdCounter = 1;
        this.conversationHistory = [];
        
        // Contexto do sistema ERP para a IA
        this.systemContext = this.buildSystemContext();
        
        this.initializeElements();
        this.setupEventListeners();
        this.setInitialTime();
    }
    
    buildSystemContext() {
        return {
            empresa: "Powp ERP",
            modulos: ["Vendas", "Financeiro", "Estoque", "Clientes", "Fornecedores", "Produtos"],
            dadosDisponiveis: {
                clientes: {
                    total: 15,
                    ativos: 4,
                    inativos: 11,
                    ticketMedio: 625.70
                },
                fornecedores: {
                    total: 7,
                    principais: ["Mondelez Brasil LTDA", "Microsoft LTDS", "Unilever LTDA", "Coca-cola LTDA"]
                },
                produtos: {
                    total: 55,
                    estoqueCritico: 23,
                    zerados: 8,
                    valorTotal: 14356.00
                },
                vendas: {
                    mesAtual: 14985.00,
                    mesAnterior: 12471.39,
                    crescimento: 25.2,
                    ticketMedio: 820.00
                },
                financeiro: {
                    caixaTesouraria: 9543.87,
                    contasBancarias: 9356.23,
                    contasReceber: 2120.09,
                    contasPagar: 932.25
                }
            }
        };
    }

    initializeElements() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.suggestionButtons = document.querySelectorAll('.suggestion-btn');
        this.sidebarItems = document.querySelectorAll('.sidebar-item');
    }

    setupEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        
        // Enter key press
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSendMessage();
            }
        });

        // Suggestion buttons
        this.suggestionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.getAttribute('data-question');
                this.handleSuggestedQuestion(question);
            });
        });

        // Sidebar navigation
        this.sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSidebarClick(item);
            });
        });
    }

    setInitialTime() {
        const initialTimeElement = document.getElementById('initialTime');
        if (initialTimeElement) {
            initialTimeElement.textContent = new Date().toLocaleTimeString();
        }
    }

    handleSidebarClick(clickedItem) {
        // Remove active class from all items
        this.sidebarItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to clicked item
        clickedItem.classList.add('active');
        
        const page = clickedItem.getAttribute('data-page');
        console.log(`Navigating to: ${page}`);
        
        // Here you could implement actual page navigation
        // For demo purposes, we'll just log it
    }

    handleSuggestedQuestion(question) {
        this.messageInput.value = question;
        this.handleSendMessage();
    }

    async handleSendMessage() {
        const messageText = this.messageInput.value.trim();
        if (!messageText || this.isLoading) return;

        // Add user message
        this.addMessage(messageText, true);
        this.messageInput.value = '';
        this.setLoading(true);

        // Adicionar à história da conversa
        this.conversationHistory.push({
            role: 'user',
            content: messageText
        });

        try {
            // Tentar API do backend primeiro
            const aiResponse = await this.getAIResponse(messageText);
            this.addMessage(aiResponse, false);
            
            // Adicionar resposta à história
            this.conversationHistory.push({
                role: 'assistant',
                content: aiResponse
            });
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            // Fallback para resposta inteligente local
            const aiResponse = this.getIntelligentResponse(messageText);
            this.addMessage(aiResponse, false);
            
            this.conversationHistory.push({
                role: 'assistant',
                content: aiResponse
            });
        }

        this.setLoading(false);
    }
    
    async getAIResponse(userMessage) {
        // Preparar contexto completo para a IA
        const contextPrompt = this.buildContextPrompt();
        
        try {
            // Tentar API do Laravel primeiro
            const response = await fetch('http://127.0.0.1:8000/api/chat/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage,
                    context: this.systemContext,
                    history: this.conversationHistory.slice(-10) // Últimas 10 mensagens
                })
            });

            if (!response.ok) {
                throw new Error('API não disponível');
            }

            const data = await response.json();
            return data.response || data.message;
            
        } catch (error) {
            console.log('API Laravel não disponível, usando resposta inteligente local');
            throw error; // Vai para o fallback
        }
    }
    
    buildContextPrompt() {
        return `Você é um assistente IA especializado no ERP Powp. Você tem acesso aos seguintes dados:
        
CLIENTES:
- Total: ${this.systemContext.dadosDisponiveis.clientes.total}
- Ativos: ${this.systemContext.dadosDisponiveis.clientes.ativos}
- Ticket Médio: R$ ${this.systemContext.dadosDisponiveis.clientes.ticketMedio.toFixed(2)}

FORNECEDORES:
- Total: ${this.systemContext.dadosDisponiveis.fornecedores.total}
- Principais: ${this.systemContext.dadosDisponiveis.fornecedores.principais.join(', ')}

PRODUTOS:
- Total: ${this.systemContext.dadosDisponiveis.produtos.total}
- Em Alerta: ${this.systemContext.dadosDisponiveis.produtos.estoqueCritico}
- Zerados: ${this.systemContext.dadosDisponiveis.produtos.zerados}
- Valor em Estoque: R$ ${this.systemContext.dadosDisponiveis.produtos.valorTotal.toFixed(2)}

VENDAS:
- Mês Atual: R$ ${this.systemContext.dadosDisponiveis.vendas.mesAtual.toFixed(2)}
- Crescimento: ${this.systemContext.dadosDisponiveis.vendas.crescimento}%
- Ticket Médio: R$ ${this.systemContext.dadosDisponiveis.vendas.ticketMedio.toFixed(2)}

FINANCEIRO:
- Caixa: R$ ${this.systemContext.dadosDisponiveis.financeiro.caixaTesouraria.toFixed(2)}
- Contas Bancárias: R$ ${this.systemContext.dadosDisponiveis.financeiro.contasBancarias.toFixed(2)}
- A Receber: R$ ${this.systemContext.dadosDisponiveis.financeiro.contasReceber.toFixed(2)}
- A Pagar: R$ ${this.systemContext.dadosDisponiveis.financeiro.contasPagar.toFixed(2)}

Responda de forma clara, objetiva e profissional. Use emojis quando apropriado para tornar a resposta mais amigável.`;
    }
    
    getIntelligentResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Análise de intenção mais sofisticada
        const intents = this.analyzeIntent(lowerMessage);
        
        if (intents.includes('faturamento') || intents.includes('receita') || intents.includes('vendas_valor')) {
            return this.getVendasResponse(lowerMessage);
        }
        
        if (intents.includes('clientes')) {
            return this.getClientesResponse(lowerMessage);
        }
        
        if (intents.includes('fornecedores')) {
            return this.getFornecedoresResponse(lowerMessage);
        }
        
        if (intents.includes('estoque')) {
            return this.getEstoqueResponse(lowerMessage);
        }
        
        if (intents.includes('financeiro')) {
            return this.getFinanceiroResponse(lowerMessage);
        }
        
        if (intents.includes('produtos')) {
            return this.getProdutosResponse(lowerMessage);
        }
        
        if (intents.includes('relatorio') || intents.includes('dashboard')) {
            return this.getRelatorioResponse(lowerMessage);
        }
        
        if (intents.includes('ajuda') || intents.includes('help')) {
            return this.getHelpResponse();
        }
        
        // Resposta padrão mais inteligente
        return this.getDefaultResponse(lowerMessage);
    }
    
    analyzeIntent(message) {
        const intents = [];
        
        // Palavras-chave para cada intenção
        const keywords = {
            faturamento: ['faturamento', 'receita', 'quanto vend', 'valor das vendas', 'ganho'],
            clientes: ['cliente', 'consumidor', 'comprador', 'inadimplent', 'ativo', 'inativo'],
            fornecedores: ['fornecedor', 'supplier', 'parceiro'],
            estoque: ['estoque', 'produto', 'item', 'mercadoria', 'baixo', 'crítico', 'zerado'],
            financeiro: ['financeiro', 'caixa', 'banco', 'pagar', 'receber', 'conta'],
            produtos: ['produto', 'item', 'sku', 'mercadoria'],
            relatorio: ['relatório', 'dashboard', 'gráfico', 'análise', 'mostrar'],
            ajuda: ['ajuda', 'help', 'como', 'o que você', 'pode fazer']
        };
        
        for (const [intent, words] of Object.entries(keywords)) {
            if (words.some(word => message.includes(word))) {
                intents.push(intent);
            }
        }
        
        return intents;
    }
    
    getVendasResponse(message) {
        const dados = this.systemContext.dadosDisponiveis.vendas;
        
        if (message.includes('mês') || message.includes('mes') || message.includes('atual')) {
            return `📊 **Vendas do Mês Atual**

💰 Faturamento: R$ ${dados.mesAtual.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
📈 Crescimento: +${dados.crescimento}% vs mês anterior
🎯 Ticket Médio: R$ ${dados.ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}

O desempenho está excelente! Continuamos em crescimento consistente.`;
        }
        
        if (message.includes('semana')) {
            return `📈 **Vendas da Última Semana**

• Segunda: R$ 45.230,00
• Terça: R$ 52.180,00
• Quarta: R$ 48.750,00
• Quinta: R$ 61.420,00
• Sexta: R$ 55.890,00
• Sábado: R$ 38.560,00
• Domingo: R$ 28.340,00

**Total:** R$ 330.370,00
**Média Diária:** R$ 47.195,71

Quinta-feira foi o melhor dia! 🎉`;
        }
        
        return `📊 Nosso faturamento atual é de R$ ${dados.mesAtual.toLocaleString('pt-BR', {minimumFractionDigits: 2})}, com crescimento de ${dados.crescimento}% em relação ao mês anterior.`;
    }
    
    getClientesResponse(message) {
        const dados = this.systemContext.dadosDisponiveis.clientes;
        
        if (message.includes('quantos') || message.includes('total')) {
            return `👥 **Base de Clientes**

📊 Total de Clientes: ${dados.total.toLocaleString('pt-BR')}
✅ Clientes Ativos: ${dados.ativos.toLocaleString('pt-BR')} (${((dados.ativos/dados.total)*100).toFixed(1)}%)
❌ Clientes Inativos: ${dados.inativos.toLocaleString('pt-BR')}
💰 Ticket Médio: R$ ${dados.ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}

Sua base de clientes está saudável e em crescimento!`;
        }
        
        if (message.includes('inadimplent') || message.includes('atraso') || message.includes('devendo')) {
            return `💳 **Relatório de Inadimplência**

⚠️ Clientes em atraso: 23
💰 Valor total em aberto: R$ 1.780,00
📅 Maior atraso: 45 dias
🏢 Cliente com maior débito: Empresa XYZ (R$ 430,00)

**Recomendação:** Entre em contato com os clientes em atraso superior a 30 dias para negociação.`;
        }
        
        return `👥 Temos ${dados.total.toLocaleString('pt-BR')} clientes cadastrados, sendo ${dados.ativos.toLocaleString('pt-BR')} ativos com ticket médio de R$ ${dados.ticketMedio.toFixed(2)}.`;
    }
    
    getFornecedoresResponse(message) {
        const dados = this.systemContext.dadosDisponiveis.fornecedores;
        
        if (message.includes('quantos') || message.includes('total') || message.includes('lista')) {
            return `🏢 **Fornecedores Cadastrados**

📊 Total: ${dados.total} fornecedores ativos

**Principais Parceiros:**
${dados.principais.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Todos com cadastros atualizados e em dia! ✅`;
        }
        
        if (message.includes('mais produtos') || message.includes('maior')) {
            return `🏆 **Ranking de Fornecedores por Produtos**

1. 🥇 Unilever LTDA - 10 produtos
2. 🥈 Procter & Gamble Brasil LTDA - 32 produtos
3. 🥉 Coca-cola LTDA - 5 produtos
4. Microsoft LTDS - 2 produtos
5. Mondelez Brasil LTDA - 14 produtos

A Unilever lidera com folga!`;
        }
        
        return `🏢 Temos ${dados.total} fornecedores cadastrados. Os principais são: ${dados.principais.join(', ')}.`;
    }
    
    getEstoqueResponse(message) {
        const dados = this.systemContext.dadosDisponiveis.produtos;
        
        if (message.includes('baixo') || message.includes('crítico') || message.includes('alerta')) {
            return `⚠️ **Produtos com Estoque Crítico**

🔴 **Críticos (${dados.zerados} produtos):**
• Mouse Gamer RGB - 0 unidades
• Teclado Mecânico - 3 unidades
• Monitor 24" - 5 unidades

🟡 **Em Alerta (${dados.estoqueCritico} produtos):**
• Webcam HD - 10 unidades (mín: 25)
• Headset Bluetooth - 18 unidades (mín: 30)
• SSD 480GB - 15 unidades (mín: 40)

**Ação Recomendada:** Fazer pedidos de reposição urgente para os produtos críticos! 🚨`;
        }
        
        if (message.includes('valor') || message.includes('total')) {
            return `💰 **Valor do Estoque**

📦 Total de Produtos: ${dados.total.toLocaleString('pt-BR')}
💵 Valor Total: R$ ${dados.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
📊 Valor Médio por Produto: R$ ${(dados.valorTotal / dados.total).toFixed(2)}

Seu estoque está bem diversificado!`;
        }
        
        return `📦 Temos ${dados.total.toLocaleString('pt-BR')} produtos em estoque, com ${dados.estoqueCritico} em alerta e ${dados.zerados} zerados. Valor total: R$ ${dados.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}.`;
    }
    
    getFinanceiroResponse(message) {
        const dados = this.systemContext.dadosDisponiveis.financeiro;
        const total = dados.caixaTesouraria + dados.contasBancarias;
        
        return `💰 **Situação Financeira**

**Disponível:**
🏦 Caixa Tesouraria: R$ ${dados.caixaTesouraria.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
💳 Contas Bancárias: R$ ${dados.contasBancarias.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
**Total Disponível: R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}**

**A Receber:**
📥 Contas a Receber: R$ ${dados.contasReceber.toLocaleString('pt-BR', {minimumFractionDigits: 2})}

**A Pagar:**
📤 Contas a Pagar: R$ ${dados.contasPagar.toLocaleString('pt-BR', {minimumFractionDigits: 2})}

**Saldo Projetado:** R$ ${(total + dados.contasReceber - dados.contasPagar).toLocaleString('pt-BR', {minimumFractionDigits: 2})}

Sua situação financeira está saudável! ✅`;
    }
    
    getProdutosResponse(message) {
        const dados = this.systemContext.dadosDisponiveis.produtos;
        
        return `📦 **Gestão de Produtos**

📊 Total Cadastrado: ${dados.total.toLocaleString('pt-BR')} produtos
⚠️ Em Alerta: ${dados.estoqueCritico} produtos
🔴 Zerados: ${dados.zerados} produtos
💰 Valor em Estoque: R$ ${dados.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}

**Status Geral:** ${dados.estoqueCritico > 20 ? '⚠️ Atenção necessária' : '✅ Situação controlada'}`;
    }
    
    getRelatorioResponse(message) {
        return `📊 **Dashboards Disponíveis**

Você pode acessar os seguintes painéis:

1. 📈 **Dashboard de Vendas** - Análise completa de vendas
2. 💰 **Dashboard Financeiro** - Fluxo de caixa e contas
3. 📦 **Dashboard de Estoque** - Gestão de produtos
4. 👥 **Dashboard de Clientes** - Análise de clientes
5. 🤖 **Dashboard IA** - Insights e previsões

Qual dashboard você gostaria de visualizar?`;
    }
    
    getHelpResponse() {
        return `🤖 **Como posso ajudar?**

Posso responder perguntas sobre:

📊 **Vendas:** Faturamento, crescimento, ticket médio
👥 **Clientes:** Total, ativos, inadimplentes
🏢 **Fornecedores:** Lista, produtos por fornecedor
📦 **Estoque:** Produtos, alertas, valor total
💰 **Financeiro:** Caixa, contas a pagar/receber
📈 **Relatórios:** Dashboards e análises

**Exemplos de perguntas:**
• "Qual foi o faturamento do mês?"
• "Quantos clientes estão ativos?"
• "Quais produtos estão com estoque baixo?"
• "Mostre a situação financeira"

Faça sua pergunta! 😊`;
    }
    
    getDefaultResponse(message) {
        return `Entendi sua pergunta sobre "${message}". 

Posso ajudá-lo com informações sobre:
• 📊 Vendas e faturamento
• 👥 Clientes
• 🏢 Fornecedores
• 📦 Estoque e produtos
• 💰 Situação financeira

Tente reformular sua pergunta ou escolha uma das sugestões ao lado! 😊`;
    }

    addMessage(text, isUser) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        const timestamp = new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        if (isUser) {
            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble user-bubble">
                        ${this.escapeHtml(text)}
                    </div>
                    <div class="message-time">${timestamp}</div>
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="ai-avatar">🤖</div>
                <div class="message-content">
                    <div class="message-bubble ai-bubble">
                        ${this.formatAIResponse(text)}
                    </div>
                    <div class="message-time">${timestamp}</div>
                </div>
            `;
        }

        this.messagesContainer.appendChild(messageElement);
        
        // Scroll suave para o final
        this.scrollToBottom();
        
        this.messages.push({
            id: this.messageIdCounter++,
            text,
            isUser,
            timestamp
        });
    }

    setLoading(loading) {
        this.isLoading = loading;
        this.messageInput.disabled = loading;
        this.sendButton.disabled = loading || !this.messageInput.value.trim();
        
        if (loading) {
            this.loadingIndicator.style.display = 'flex';
        } else {
            this.loadingIndicator.style.display = 'none';
        }
        
        this.scrollToBottom();
    }

    scrollToBottom() {
        requestAnimationFrame(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            // Garantir que chegou ao final
            setTimeout(() => {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }, 50);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatAIResponse(text) {
        // Escapar HTML mas preservar formatação
        let formatted = this.escapeHtml(text);
        
        // Converter markdown-like para HTML
        formatted = formatted
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **negrito**
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // *itálico*
            .replace(/\n\n/g, '</p><p>') // Parágrafos
            .replace(/\n/g, '<br>'); // Quebras de linha
        
        return `<p>${formatted}</p>`;
    }

}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ERPChatbot();
});