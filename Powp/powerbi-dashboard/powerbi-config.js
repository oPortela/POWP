// Configuração do Power BI Dashboard
// =====================================

// IMPORTANTE: Substitua pela URL do seu dashboard Power BI
// Para obter esta URL:
// 1. Acesse app.powerbi.com
// 2. Abra seu relatório
// 3. Clique em "Arquivo" → "Incorporar relatório" → "Site ou portal"
// 4. Copie a URL de incorporação

const POWERBI_CONFIG = {
    // URL de incorporação do Power BI (substitua pela sua)
    embedUrl: 'https://app.powerbi.com/groups/me/reports/460cbcc1-7443-47ca-b75c-b8f2cc206c72/6fe778e93e0be0ed8c6d?experience=power-bi', // Exemplo: 'https://app.powerbi.com/reportEmbed?reportId=SEU_REPORT_ID&autoAuth=true&ctid=SEU_TENANT_ID'
    
    // Configurações opcionais
    settings: {
        // Ocultar painéis do Power BI
        panes: {
            filters: {
                expanded: false,
                visible: true
            },
            pageNavigation: {
                visible: true
            }
        },
        
        // Configurações de layout
        layoutType: 0, // 0 = Padrão, 1 = Letra, 2 = Widescreen, 3 = Cortana
        
        // Configurações de interação
        settings: {
            filterPaneEnabled: true,
            navContentPaneEnabled: true
        }
    },
    
    // Configurações de autenticação (se necessário)
    auth: {
        // Para relatórios públicos, deixe vazio
        // Para relatórios privados, você precisará implementar autenticação
        accessToken: '', // Token de acesso (se necessário)
    }
};

// URLs de exemplo para diferentes tipos de incorporação
const POWERBI_EXAMPLES = {
    // Relatório público (exemplo)
    publicReport: 'https://app.powerbi.com/view?r=eyJrIjoiYjU5ZTBkYjQtZjBmYy00YjVhLWE3YzYtMWVkZGQzNjBkMmZkIiwidCI6IjcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0NyIsImMiOjV9',
    
    // Relatório com autenticação (exemplo)
    privateReport: 'https://app.powerbi.com/reportEmbed?reportId=REPORT_ID&autoAuth=true&ctid=TENANT_ID',
    
    // Dashboard (exemplo)
    dashboard: 'https://app.powerbi.com/dashboardEmbed?dashboardId=DASHBOARD_ID&autoAuth=true&ctid=TENANT_ID'
};

// Função para validar URL do Power BI
function isValidPowerBIUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    const powerBIDomains = [
        'app.powerbi.com',
        'msit.powerbi.com',
        'gov.powerbi.us',
        'powerbi.microsoft.com'
    ];
    
    try {
        const urlObj = new URL(url);
        return powerBIDomains.some(domain => urlObj.hostname.includes(domain));
    } catch (e) {
        return false;
    }
}

// Função para obter configuração do Power BI
function getPowerBIConfig() {
    return {
        ...POWERBI_CONFIG,
        isConfigured: isValidPowerBIUrl(POWERBI_CONFIG.embedUrl),
        embedUrl: POWERBI_CONFIG.embedUrl || ''
    };
}

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { POWERBI_CONFIG, POWERBI_EXAMPLES, getPowerBIConfig, isValidPowerBIUrl };
}