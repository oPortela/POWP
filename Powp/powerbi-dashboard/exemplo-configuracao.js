// EXEMPLO DE CONFIGURAÇÃO - Power BI Dashboard
// =============================================
// 
// Este arquivo contém exemplos de como configurar diferentes tipos de dashboards do Power BI
// Copie e cole no arquivo powerbi-config.js conforme necessário

// EXEMPLO 1: Relatório Público (Demonstração)
// Este é um relatório público da Microsoft para demonstração
const EXEMPLO_RELATORIO_PUBLICO = {
    embedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiYjU5ZTBkYjQtZjBmYy00YjVhLWE3YzYtMWVkZGQzNjBkMmZkIiwidCI6IjcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0NyIsImMiOjV9',
    settings: {
        panes: {
            filters: { expanded: false, visible: true },
            pageNavigation: { visible: true }
        }
    }
};

// EXEMPLO 2: Relatório com Autenticação
const EXEMPLO_RELATORIO_PRIVADO = {
    embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=SEU_REPORT_ID&autoAuth=true&ctid=SEU_TENANT_ID',
    settings: {
        panes: {
            filters: { expanded: false, visible: true },
            pageNavigation: { visible: true }
        }
    }
};

// EXEMPLO 3: Dashboard (não relatório)
const EXEMPLO_DASHBOARD = {
    embedUrl: 'https://app.powerbi.com/dashboardEmbed?dashboardId=SEU_DASHBOARD_ID&autoAuth=true&ctid=SEU_TENANT_ID',
    settings: {
        panes: {
            filters: { expanded: false, visible: false }, // Dashboards geralmente não têm filtros
            pageNavigation: { visible: false }
        }
    }
};

// EXEMPLO 4: Configuração Completa com Todas as Opções
const EXEMPLO_CONFIGURACAO_COMPLETA = {
    embedUrl: 'SUA_URL_AQUI',
    
    // Configurações de layout e interação
    settings: {
        panes: {
            filters: {
                expanded: false,    // Painel de filtros expandido por padrão
                visible: true       // Mostrar painel de filtros
            },
            pageNavigation: {
                visible: true       // Mostrar navegação entre páginas
            }
        },
        
        // Tipo de layout
        layoutType: 0,              // 0=Padrão, 1=Carta, 2=Widescreen, 3=Cortana
        
        // Configurações gerais
        settings: {
            filterPaneEnabled: true,        // Habilitar painel de filtros
            navContentPaneEnabled: true,    // Habilitar painel de navegação
            useCustomSaveAsDialog: false    // Usar diálogo personalizado de "Salvar como"
        },
        
        // Configurações de barra de ação (se aplicável)
        actionBar: {
            visible: true
        }
    },
    
    // Configurações de autenticação (se necessário)
    auth: {
        accessToken: '',    // Token de acesso (para relatórios privados)
        tokenType: 'Aad'    // Tipo do token: 'Aad' ou 'Embed'
    }
};

// COMO USAR ESTES EXEMPLOS:
// 
// 1. Escolha o exemplo que melhor se adequa ao seu caso
// 2. Substitua 'SUA_URL_AQUI' pela URL real do seu Power BI
// 3. Copie a configuração para o arquivo powerbi-config.js
// 4. Ajuste as configurações conforme necessário
//
// EXEMPLO DE USO NO powerbi-config.js:
/*
const POWERBI_CONFIG = {
    embedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiYjU5ZTBkYjQtZjBmYy00YjVhLWE3YzYtMWVkZGQzNjBkMmZkIiwidCI6IjcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0NyIsImMiOjV9',
    settings: {
        panes: {
            filters: { expanded: false, visible: true },
            pageNavigation: { visible: true }
        }
    }
};
*/

// DICAS IMPORTANTES:
// 
// 1. URLs Públicas: Funcionam imediatamente, sem necessidade de autenticação
// 2. URLs Privadas: Requerem que o usuário esteja logado no Power BI
// 3. autoAuth=true: Tenta autenticar automaticamente
// 4. Teste sempre a URL diretamente no navegador primeiro
// 5. Para produção, considere implementar autenticação server-side

// TROUBLESHOOTING:
// 
// Se o dashboard não carregar:
// - Verifique se a URL está correta
// - Confirme as permissões no Power BI Service
// - Teste a URL diretamente no navegador
// - Verifique o console do navegador para erros
// - Certifique-se de que o relatório está publicado