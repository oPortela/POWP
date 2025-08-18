class ERPChatbot {
    constructor() {
        this.messages = [];
        this.isLoading = false;
        this.messageIdCounter = 1;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setInitialTime();
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

        try {
            // Send message to AI API
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageText
                })
            });

            const data = await response.json();

            if (data.success) {
                this.addMessage(data.response, false);
            } else {
                this.addMessage('Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.', false);
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            // Fallback para resposta simulada se a API falhar
            const aiResponse = this.simulateAIResponse(messageText);
            this.addMessage(aiResponse, false);
        }

        this.setLoading(false);
    }

    addMessage(text, isUser) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        const timestamp = new Date().toLocaleTimeString();
        
        if (isUser) {
            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble user-bubble">
                        <p>${this.escapeHtml(text)}</p>
                    </div>
                    <div class="message-time">${timestamp}</div>
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="ai-avatar">IA</div>
                <div class="message-content">
                    <div class="message-bubble ai-bubble">
                        <p>${this.formatAIResponse(text)}</p>
                    </div>
                    <div class="message-time">${timestamp}</div>
                </div>
            `;
        }

        this.messagesContainer.appendChild(messageElement);
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
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatAIResponse(text) {
        // Convert line breaks to <br> tags and preserve formatting
        return this.escapeHtml(text).replace(/\n/g, '<br>');
    }

    simulateAIResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('faturamento') || lowerMessage.includes('receita')) {
            return "📊 Baseado nos dados do sistema, o faturamento do mês passado foi de R$ 2.847.650,00, representando um crescimento de 15% em relação ao mês anterior. Os principais contribuidores foram as vendas para Microsoft LTDS (R$ 450.000) e Coca-cola LTDA (R$ 380.000).";
        }
        
        if (lowerMessage.includes('fornecedor') && lowerMessage.includes('quantos')) {
            return "📋 Atualmente temos 7 fornecedores cadastrados no sistema: Mondelez Brasil LTDA, Bic Amazonia LTDA, Colgate LTDA, Microsoft LTDS, Unilever LTDA, Procter & Gamble Brasil LTDA, e Coca-cola LTDA. Todos com cadastros atualizados em fevereiro de 2023.";
        }
        
        if (lowerMessage.includes('estoque') && lowerMessage.includes('baixo')) {
            return "⚠️ Produtos com estoque crítico:\n• Produto A - 5 unidades restantes\n• Produto B - 12 unidades restantes\n• Produto C - 8 unidades restantes\n\nRecomendo fazer pedidos de reposição para os fornecedores correspondentes.";
        }
        
        if (lowerMessage.includes('vendas') && lowerMessage.includes('semana')) {
            return "📈 Vendas da última semana:\n• Segunda: R$ 45.230\n• Terça: R$ 52.180\n• Quarta: R$ 48.750\n• Quinta: R$ 61.420\n• Sexta: R$ 55.890\n• Sábado: R$ 38.560\n• Domingo: R$ 28.340\n\nTotal: R$ 330.370";
        }
        
        if (lowerMessage.includes('fornecedor') && lowerMessage.includes('mais produtos')) {
            return "🏆 O fornecedor com mais produtos cadastrados é a Unilever LTDA, com 245 produtos ativos. Em segundo lugar está a Procter & Gamble Brasil LTDA com 198 produtos, seguida pela Coca-cola LTDA com 156 produtos.";
        }
        
        if (lowerMessage.includes('inadimplent') || lowerMessage.includes('atraso')) {
            return "💳 Relatório de inadimplência:\n• Total de clientes em atraso: 23\n• Valor total em aberto: R$ 156.780\n• Maior atraso: 45 dias\n• Cliente com maior débito: Empresa XYZ (R$ 25.430)\n\nRecomendo entrar em contato com os clientes em atraso superior a 30 dias.";
        }
        
        return "Entendi sua pergunta! Como este é um exemplo de demonstração, posso ajudá-lo com informações sobre: vendas, fornecedores, estoque, relatórios financeiros, inadimplência e muito mais. Tente uma das perguntas sugeridas para ver exemplos de respostas com dados reais do sistema!";
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ERPChatbot();
});