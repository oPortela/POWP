// Layout Base Vue.js - Funcionalidades Reutilizáveis
// ===================================================

// Mixin base para funcionalidades comuns
const BaseLayoutMixin = {
  data() {
    return {
      // Navegação
      currentPage: 'dashboard',
      currentSection: 'cadastro',
      
      // Busca
      searchTerm: '',
      searchPlaceholder: 'Pesquisar...',
      
      // Paginação
      currentPageNum: 1,
      itemsPerPage: 10,
      totalRecords: 0,
      jumpToPage: 1,
      
      // Estados
      loading: false,
      
      // Demo Mode
      demoMode: false,
      
      // Mensagens
      toastMessage: '',
      toastType: 'success',
      showToast: false,
      
      // Textos configuráveis
      newButtonText: 'Novo Item',
      pageTitle: 'Sistema'
    }
  },
  
  computed: {
    // Cálculos de paginação
    totalPages() {
      return Math.ceil(this.totalRecords / this.itemsPerPage);
    },
    
    startRecord() {
      if (this.totalRecords === 0) return 0;
      return (this.currentPageNum - 1) * this.itemsPerPage + 1;
    },
    
    endRecord() {
      const end = this.currentPageNum * this.itemsPerPage;
      return Math.min(end, this.totalRecords);
    },
    
    // Páginas visíveis na paginação
    visiblePages() {
      const pages = [];
      const total = this.totalPages;
      const current = this.currentPageNum;
      
      if (total <= 7) {
        // Mostrar todas as páginas se forem 7 ou menos
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // Lógica para páginas com reticências
        if (current <= 4) {
          // Início: 1 2 3 4 5 ... 10
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        } else if (current >= total - 3) {
          // Final: 1 ... 6 7 8 9 10
          pages.push(1);
          pages.push('...');
          for (let i = total - 4; i <= total; i++) {
            pages.push(i);
          }
        } else {
          // Meio: 1 ... 4 5 6 ... 10
          pages.push(1);
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        }
      }
      
      return pages;
    }
  },
  
  methods: {
    // === Paginação ===
    
    nextPage() {
      if (this.currentPageNum < this.totalPages) {
        this.currentPageNum++;
        this.onPageChange();
      }
    },
    
    previousPage() {
      if (this.currentPageNum > 1) {
        this.currentPageNum--;
        this.onPageChange();
      }
    },
    
    goToFirstPage() {
      if (this.currentPageNum !== 1) {
        this.currentPageNum = 1;
        this.onPageChange();
      }
    },
    
    goToLastPage() {
      if (this.currentPageNum !== this.totalPages) {
        this.currentPageNum = this.totalPages;
        this.onPageChange();
      }
    },
    
    goToPage(page) {
      if (page === '...' || page < 1 || page > this.totalPages) return;
      
      if (this.currentPageNum !== page) {
        this.currentPageNum = page;
        this.jumpToPage = page;
        this.onPageChange();
      }
    },
    
    changeItemsPerPage() {
      this.currentPageNum = 1;
      this.jumpToPage = 1;
      this.onPageChange();
    },
    
    // Método a ser sobrescrito pelas páginas filhas
    onPageChange() {
      console.log('Page changed to:', this.currentPageNum);
      // Override this method in child components
    },
    
    // === Busca ===
    
    searchItems() {
      this.currentPageNum = 1;
      this.jumpToPage = 1;
      // Override this method in child components
      console.log('Search term:', this.searchTerm);
    },
    
    // === Modais ===
    
    openNewItemModal() {
      // Override this method in child components
      console.log('Open new item modal');
    },
    
    // === Export ===
    
    exportData() {
      // Override this method in child components
      console.log('Export data');
      this.showToastMessage('Funcionalidade de export deve ser implementada', 'warning');
    },
    
    // === Demo Mode ===
    
    toggleDemoMode() {
      this.demoMode = !this.demoMode;
      
      if (this.demoMode) {
        if (typeof enableDemoMode === 'function') {
          enableDemoMode();
        }
        this.showToastMessage('Modo Demo ativado - Usando dados simulados', 'info');
      } else {
        if (typeof disableDemoMode === 'function') {
          disableDemoMode();
        }
        this.showToastMessage('Modo Demo desativado - Usando API real', 'info');
      }
      
      // Recarregar dados
      this.onDemoModeChange();
    },
    
    // Método a ser sobrescrito pelas páginas filhas
    onDemoModeChange() {
      // Override this method in child components
      console.log('Demo mode changed:', this.demoMode);
    },
    
    // === Mensagens ===
    
    showToastMessage(message, type = 'success') {
      this.toastMessage = message;
      this.toastType = type;
      this.showToast = true;
      
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    },
    
    // === Utilitários ===
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('pt-BR');
    },
    
    formatCurrency(value) {
      if (!value) return 'R$ 0,00';
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    },
    
    formatCPF(cpf) {
      if (!cpf) return '';
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },
    
    formatCNPJ(cnpj) {
      if (!cnpj) return '';
      return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    },
    
    formatPhone(phone) {
      if (!phone) return '';
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return phone;
    },
    
    // === CSV Export ===
    
    generateCSV(data, headers, filename = 'export.csv') {
      const csvContent = [headers, ...data]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
        
      this.downloadCSV(csvContent, filename);
    },
    
    downloadCSV(content, filename) {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },
  
  // === Lifecycle ===
  
  mounted() {
    // Configurar eventos de teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Override this in child components for modal handling
        this.onEscapeKey();
      }
    });
    
    // Inicializar página
    this.initializePage();
  },
  
  // Métodos a serem sobrescritos
  onEscapeKey() {
    // Override this method in child components
  },
  
  initializePage() {
    // Override this method in child components
    console.log('Page initialized');
  }
};

// Função para criar uma aplicação Vue com o layout base
function createBaseApp(config = {}) {
  const app = createApp({
    mixins: [BaseLayoutMixin],
    
    data() {
      return {
        ...config.data || {}
      };
    },
    
    computed: {
      ...config.computed || {}
    },
    
    methods: {
      ...config.methods || {}
    },
    
    mounted() {
      // Chamar mounted do mixin primeiro
      BaseLayoutMixin.mounted.call(this);
      
      // Depois chamar mounted específico se existir
      if (config.mounted) {
        config.mounted.call(this);
      }
    }
  });
  
  return app;
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.BaseLayoutMixin = BaseLayoutMixin;
  window.createBaseApp = createBaseApp;
}

// Para Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BaseLayoutMixin,
    createBaseApp
  };
}