// Power BI Integration JavaScript
// ===============================

document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const powerbiIframe = document.getElementById('powerbi-iframe');
    const loadingPlaceholder = document.getElementById('loading-placeholder');
    const powerbiPlaceholder = document.getElementById('powerbi-placeholder');
    const refreshBtn = document.getElementById('refresh-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const powerbiWrapper = document.querySelector('.powerbi-wrapper');
    const instructionsModal = document.getElementById('instructions-modal');

    // Estado da aplicação
    let isFullscreen = false;
    let isLoaded = false;

    // Inicializar Power BI
    function initializePowerBI() {
        const config = getPowerBIConfig();
        
        if (config.isConfigured && config.embedUrl) {
            loadPowerBIDashboard(config.embedUrl);
        } else {
            showPlaceholder();
        }
    }

    // Carregar dashboard do Power BI
    function loadPowerBIDashboard(embedUrl) {
        showLoading();
        
        // Configurar iframe
        powerbiIframe.src = embedUrl;
        
        // Event listeners para o iframe
        powerbiIframe.onload = function() {
            hideLoading();
            showPowerBI();
            isLoaded = true;
            showToast('Dashboard carregado com sucesso!', 'success');
        };
        
        powerbiIframe.onerror = function() {
            hideLoading();
            showPlaceholder();
            showToast('Erro ao carregar o dashboard. Verifique a URL de incorporação.', 'error');
        };
        
        // Timeout para casos onde o onload não dispara
        setTimeout(() => {
            if (!isLoaded) {
                hideLoading();
                showPowerBI();
                isLoaded = true;
            }
        }, 10000); // 10 segundos
    }

    // Mostrar loading
    function showLoading() {
        loadingPlaceholder.style.display = 'flex';
        powerbiPlaceholder.style.display = 'none';
        powerbiIframe.style.display = 'none';
    }

    // Esconder loading
    function hideLoading() {
        loadingPlaceholder.style.display = 'none';
    }

    // Mostrar Power BI
    function showPowerBI() {
        powerbiIframe.style.display = 'block';
        powerbiPlaceholder.style.display = 'none';
        powerbiWrapper.classList.add('powerbi-loaded');
    }

    // Mostrar placeholder
    function showPlaceholder() {
        powerbiPlaceholder.style.display = 'flex';
        powerbiIframe.style.display = 'none';
        loadingPlaceholder.style.display = 'none';
    }

    // Atualizar dashboard
    function refreshDashboard() {
        if (isLoaded && powerbiIframe.src) {
            showLoading();
            
            // Recarregar iframe
            const currentSrc = powerbiIframe.src;
            powerbiIframe.src = '';
            
            setTimeout(() => {
                powerbiIframe.src = currentSrc;
            }, 100);
            
            showToast('Atualizando dashboard...', 'info');
        } else {
            showToast('Nenhum dashboard carregado para atualizar.', 'warning');
        }
    }

    // Toggle fullscreen
    function toggleFullscreen() {
        if (!isFullscreen) {
            enterFullscreen();
        } else {
            exitFullscreen();
        }
    }

    // Entrar em tela cheia
    function enterFullscreen() {
        powerbiWrapper.classList.add('fullscreen-mode');
        fullscreenBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
            </svg>
            Sair Tela Cheia
        `;
        isFullscreen = true;
        
        // Tentar usar API de fullscreen do navegador
        if (powerbiWrapper.requestFullscreen) {
            powerbiWrapper.requestFullscreen();
        } else if (powerbiWrapper.webkitRequestFullscreen) {
            powerbiWrapper.webkitRequestFullscreen();
        } else if (powerbiWrapper.msRequestFullscreen) {
            powerbiWrapper.msRequestFullscreen();
        }
    }

    // Sair da tela cheia
    function exitFullscreen() {
        powerbiWrapper.classList.remove('fullscreen-mode');
        fullscreenBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2 2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
            Tela Cheia
        `;
        isFullscreen = false;
        
        // Sair do fullscreen do navegador
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    // Mostrar toast notification
    function showToast(message, type = 'info') {
        // Criar elemento toast se não existir
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast hidden';
            toast.innerHTML = '<span id="toast-message"></span>';
            document.body.appendChild(toast);
        }
        
        const toastMessage = document.getElementById('toast-message');
        toast.className = `toast ${type}`;
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // Event Listeners
    refreshBtn.addEventListener('click', refreshDashboard);
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Listener para mudanças de fullscreen
    document.addEventListener('fullscreenchange', function() {
        if (!document.fullscreenElement && isFullscreen) {
            exitFullscreen();
        }
    });

    // Listener para tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isFullscreen) {
            exitFullscreen();
        }
    });

    // Inicializar
    initializePowerBI();
});

// Funções globais para o modal de instruções
function showInstructions() {
    const modal = document.getElementById('instructions-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeInstructions() {
    const modal = document.getElementById('instructions-modal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

// Configuração rápida para teste (função de desenvolvimento)
function setTestPowerBIUrl() {
    // Esta é uma URL de exemplo - substitua pela sua
    const testUrl = 'https://app.powerbi.com/view?r=eyJrIjoiYjU5ZTBkYjQtZjBmYy00YjVhLWE3YzYtMWVkZGQzNjBkMmZkIiwidCI6IjcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0NyIsImMiOjV9';
    
    // Atualizar configuração
    POWERBI_CONFIG.embedUrl = testUrl;
    
    // Recarregar
    location.reload();
}

// Função para configurar URL via prompt (para testes)
function configurePowerBIUrl() {
    const url = prompt('Cole a URL de incorporação do seu Power BI:');
    if (url && isValidPowerBIUrl(url)) {
        POWERBI_CONFIG.embedUrl = url;
        location.reload();
    } else if (url) {
        alert('URL inválida. Certifique-se de usar uma URL válida do Power BI.');
    }
}