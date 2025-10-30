# 📊 Integração Power BI Dashboard

Esta pasta contém os arquivos necessários para integrar seu dashboard do Power BI ao sistema Powp.

## 📁 Arquivos Incluídos

- `dashboard-powerbi.html` - Página principal com o dashboard
- `powerbi-styles.css` - Estilos específicos para o Power BI
- `powerbi-config.js` - Configurações do Power BI
- `powerbi-integration.js` - Lógica de integração
- `README.md` - Este arquivo de instruções

## 🚀 Como Configurar

### Passo 1: Obter URL de Incorporação do Power BI

1. Acesse [app.powerbi.com](https://app.powerbi.com)
2. Abra seu relatório/dashboard
3. Clique em **"Arquivo"** → **"Incorporar relatório"** → **"Site ou portal"**
4. Copie a **URL de incorporação**

### Passo 2: Configurar a URL no Sistema

Abra o arquivo `powerbi-config.js` e substitua a linha:

```javascript
embedUrl: '', // Substitua pela sua URL
```

Por:

```javascript
embedUrl: 'SUA_URL_DO_POWERBI_AQUI',
```

**Exemplo:**
```javascript
embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=12345678-1234-1234-1234-123456789012&autoAuth=true&ctid=87654321-4321-4321-4321-210987654321',
```

### Passo 3: Configurar Permissões

Certifique-se de que:

- ✅ O relatório está **publicado** em um workspace
- ✅ As **permissões de compartilhamento** estão configuradas
- ✅ O relatório é **público** ou você tem as credenciais necessárias

### Passo 4: Testar

1. Abra `dashboard-powerbi.html` no navegador
2. O dashboard deve carregar automaticamente
3. Use os botões **"Atualizar"** e **"Tela Cheia"** conforme necessário

## 🔧 Tipos de URL Suportadas

### Relatório Público
```
https://app.powerbi.com/view?r=REPORT_TOKEN
```

### Relatório com Autenticação
```
https://app.powerbi.com/reportEmbed?reportId=REPORT_ID&autoAuth=true&ctid=TENANT_ID
```

### Dashboard
```
https://app.powerbi.com/dashboardEmbed?dashboardId=DASHBOARD_ID&autoAuth=true&ctid=TENANT_ID
```

## ⚙️ Configurações Avançadas

No arquivo `powerbi-config.js`, você pode personalizar:

```javascript
settings: {
    panes: {
        filters: {
            expanded: false,  // Filtros expandidos por padrão
            visible: true     // Mostrar painel de filtros
        },
        pageNavigation: {
            visible: true     // Mostrar navegação entre páginas
        }
    },
    layoutType: 0,           // 0=Padrão, 1=Carta, 2=Widescreen
}
```

## 🎯 Funcionalidades Incluídas

- ✅ **Carregamento automático** do dashboard
- ✅ **Botão de atualização** para recarregar dados
- ✅ **Modo tela cheia** para melhor visualização
- ✅ **Loading spinner** durante carregamento
- ✅ **Tratamento de erros** com mensagens informativas
- ✅ **Design responsivo** para mobile e desktop
- ✅ **Sidebar integrada** com o sistema Powp

## 🔍 Solução de Problemas

### Dashboard não carrega
1. Verifique se a URL está correta
2. Confirme as permissões no Power BI
3. Teste a URL diretamente no navegador

### Erro de autenticação
1. Certifique-se de estar logado no Power BI
2. Verifique se o relatório é público ou se você tem acesso
3. Considere usar `autoAuth=true` na URL

### Layout quebrado
1. Verifique se todos os arquivos CSS estão carregando
2. Teste em diferentes navegadores
3. Verifique o console do navegador para erros

## 📱 Responsividade

O dashboard é totalmente responsivo e funciona em:
- 💻 **Desktop** (1200px+)
- 📱 **Tablet** (768px - 1199px)
- 📱 **Mobile** (até 767px)

## 🔒 Segurança

- Use sempre URLs HTTPS
- Configure permissões adequadas no Power BI
- Evite expor tokens de acesso no código cliente
- Para ambientes de produção, considere autenticação server-side

## 🆘 Suporte

Se precisar de ajuda:
1. Verifique a documentação oficial do Power BI
2. Teste a URL de incorporação diretamente
3. Consulte os logs do navegador (F12 → Console)

---

**💡 Dica:** Para testar rapidamente, você pode usar a função `configurePowerBIUrl()` no console do navegador para inserir uma URL temporariamente.