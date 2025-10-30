// Cadastro de Fornecedores - Vue.js 3 com Layout Base
// ===================================================

const { createApp } = Vue;

createApp({
  // Usar o mixin do layout base
  mixins: [BaseLayoutMixin],
  
  data() {
    return {
      // Configurações específicas do fornecedor
      currentPage: 'fornecedores',
      currentSection: 'cadastro',
      searchPlaceholder: 'Pesquisar fornecedores...',
      newButtonText: 'Novo Fornecedor',
      
      // Estado da aplicação
      suppliers: [],
      filteredSuppliers: [],
      formLoading: false,
      saving: false,
      deleting: false,
      
      // Seleção
      selectedSuppliers: [],
      selectAll: false,
      
      // Ordenação
      sortField: 'codfornecedor',
      sortDirection: 'asc',
      
      // Modais
      showModal: false,
      showConfirmModal: false,
      showSuccessModal: false,
      modalTitle: 'Novo Fornecedor',
      
      // Formulário
      editingId: null,
      form: {
        cnpj: '',
        fornecedor: '',
        fantasia: '',
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        email: '',
        telefone: '',
        celular: ''
      },
      
      // Confirmação de exclusão
      deleteId: null,
      
      // Mensagens
      successMessage: '',
      
      // API
      apiBaseUrl: 'http://127.0.0.1:8000/api/fornecedores'
    }
  },
  
  computed: {
    // Fornecedores paginados
    paginatedSuppliers() {
      const start = (this.currentPageNum - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredSuppliers.slice(start, end);
    },
    
    // Override do layout base para usar dados específicos
    totalRecords() {
      return this.filteredSuppliers.length;
    }
  },
  
  methods: {
    // === Override dos métodos do layout base ===
    
    onPageChange() {
      // Não precisa fazer nada especial para paginação client-side
      console.log('Página alterada para:', this.currentPageNum);
    },
    
    searchItems() {
      this.searchSuppliers();
    },
    
    openNewItemModal() {
      this.openNewSupplierModal();
    },
    
    exportData() {
      const headers = ['Código', 'Fornecedor', 'Email', 'Data de Cadastro'];
      const data = this.suppliers.map(supplier => [
        supplier.codfornecedor,
        supplier.fornecedor,
        supplier.email,
        this.formatDate(supplier.dtcadastro)
      ]);
      
      this.generateCSV(data, headers, 'fornecedores.csv');
      this.showToastMessage('Dados exportados com sucesso!', 'success');
    },
    
    onDemoModeChange() {
      this.loadSuppliers();
    },
    
    onEscapeKey() {
      if (this.showModal) this.closeModal();
      if (this.showConfirmModal) this.closeConfirmModal();
    },
    
    initializePage() {
      this.loadSuppliers();
    },
    
    // === Métodos específicos do fornecedor ===
    
    async loadSuppliers() {
      this.loading = true;
      try {
        const response = await fetch(this.apiBaseUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`Falha ao carregar fornecedores: ${response.statusText}`);
        }
        
        const result = await response.json();
        this.suppliers = result.data || result;
        this.filteredSuppliers = [...this.suppliers];
        
        this.sortSuppliers();
      } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
        this.showToastMessage('Erro ao carregar fornecedores', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    searchSuppliers() {
      if (!this.searchTerm.trim()) {
        this.filteredSuppliers = [...this.suppliers];
      } else {
        const term = this.searchTerm.toLowerCase();
        this.filteredSuppliers = this.suppliers.filter(supplier => 
          supplier.codfornecedor.toString().includes(term) ||
          supplier.fornecedor.toLowerCase().includes(term) ||
          supplier.email.toLowerCase().includes(term)
        );
      }
      
      this.currentPageNum = 1;
      this.jumpToPage = 1;
      this.sortSuppliers();
    },
    
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
      
      this.sortSuppliers();
    },
    
    sortSuppliers() {
      this.filteredSuppliers.sort((a, b) => {
        let aValue = a[this.sortField];
        let bValue = b[this.sortField];
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (this.sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    },
    
    // === CRUD Operations ===
    
    async saveSupplier() {
      this.saving = true;
      
      try {
        const url = this.editingId 
          ? `${this.apiBaseUrl}/${this.editingId}`
          : this.apiBaseUrl;
          
        const method = this.editingId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(this.form)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          let errorMessage = result.message || 'Ocorreu um erro desconhecido.';
          if (result.errors) {
            errorMessage = 'Por favor, corrija os erros:\n';
            for (const field in result.errors) {
              errorMessage += `- ${result.errors[field].join(', ')}\n`;
            }
          }
          throw new Error(errorMessage);
        }
        
        const successMsg = this.editingId 
          ? 'Fornecedor atualizado com sucesso!' 
          : 'Fornecedor cadastrado com sucesso!';
          
        this.showSuccessMessage(successMsg);
        this.closeModal();
        await this.loadSuppliers();
        
      } catch (error) {
        console.error('Erro ao salvar fornecedor:', error);
        this.showToastMessage(`Erro: ${error.message}`, 'error');
      } finally {
        this.saving = false;
      }
    },
    
    async editSupplier(id) {
      this.formLoading = true;
      this.modalTitle = 'Carregando dados...';
      this.openModal();
      
      try {
        const response = await fetch(`${this.apiBaseUrl}/${id}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error('Falha ao buscar dados do fornecedor.');
        }
        
        const supplier = await response.json();
        
        // Preencher formulário
        this.form.cnpj = supplier.cnpj || '';
        this.form.fornecedor = supplier.fornecedor || '';
        this.form.fantasia = supplier.fantasia || '';
        this.form.email = supplier.email || '';
        
        // Endereço
        if (supplier.pwendereco) {
          this.form.cep = supplier.pwendereco.cep || '';
          this.form.logradouro = supplier.pwendereco.logradouro || '';
          this.form.numero = supplier.pwendereco.numero || '';
          this.form.bairro = supplier.pwendereco.bairro || '';
          this.form.cidade = supplier.pwendereco.cidade || '';
          this.form.estado = supplier.pwendereco.estado || '';
        }
        
        // Telefone
        if (supplier.pwtelefone) {
          this.form.telefone = supplier.pwtelefone.telefone || '';
          this.form.celular = supplier.pwtelefone.celular || '';
        }
        
        this.editingId = id;
        this.modalTitle = 'Editar Fornecedor';
        
      } catch (error) {
        console.error('Erro ao editar fornecedor:', error);
        this.showToastMessage(`Erro: ${error.message}`, 'error');
        this.closeModal();
      } finally {
        this.formLoading = false;
      }
    },
    
    async deleteSupplier() {
      if (!this.deleteId) return;
      
      this.deleting = true;
      
      try {
        const response = await fetch(`${this.apiBaseUrl}/${this.deleteId}`, {
          method: 'DELETE',
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok && response.status !== 204) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Falha ao excluir fornecedor.');
        }
        
        this.showSuccessMessage('Fornecedor excluído com sucesso!');
        this.closeConfirmModal();
        await this.loadSuppliers();
        
      } catch (error) {
        console.error('Erro ao excluir fornecedor:', error);
        this.showToastMessage(`Erro: ${error.message}`, 'error');
      } finally {
        this.deleting = false;
      }
    },
    
    // === Modal Management ===
    
    openNewSupplierModal() {
      this.resetForm();
      this.editingId = null;
      this.modalTitle = 'Novo Fornecedor';
      this.openModal();
    },
    
    openModal() {
      this.showModal = true;
      document.body.style.overflow = 'hidden';
    },
    
    closeModal() {
      this.showModal = false;
      this.resetForm();
      document.body.style.overflow = 'auto';
    },
    
    closeModalOnBackdrop(event) {
      if (event.target === event.currentTarget) {
        this.closeModal();
      }
    },
    
    confirmDelete(id) {
      this.deleteId = id;
      this.showConfirmModal = true;
    },
    
    closeConfirmModal() {
      this.showConfirmModal = false;
      this.deleteId = null;
    },
    
    // === Form Management ===
    
    resetForm() {
      this.form = {
        cnpj: '',
        fornecedor: '',
        fantasia: '',
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        email: '',
        telefone: '',
        celular: ''
      };
      this.editingId = null;
    },
    
    // === External APIs ===
    
    async fetchAddressByCep() {
      const cleanCep = this.form.cep.replace(/\D/g, '');
      if (cleanCep.length !== 8) return;
      
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (!response.ok) throw new Error('Não foi possível consultar o CEP.');
        
        const addressData = await response.json();
        if (addressData.erro) {
          this.showToastMessage('CEP não localizado. Preencha o endereço manualmente.', 'warning');
          return;
        }
        
        this.form.logradouro = addressData.logradouro || '';
        this.form.bairro = addressData.bairro || '';
        this.form.cidade = addressData.localidade || '';
        this.form.estado = addressData.uf || '';
        
        this.showToastMessage('Endereço preenchido automaticamente!', 'success');
        
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        this.showToastMessage('Erro ao consultar CEP', 'error');
      }
    },
    
    async fetchCnpjData() {
      const cleanCnpj = this.form.cnpj.replace(/\D/g, '');
      if (cleanCnpj.length !== 14) return;
      
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
        if (!response.ok) throw new Error('Falha ao buscar CNPJ.');
        
        const data = await response.json();
        
        this.form.fornecedor = data.razao_social || '';
        this.form.fantasia = data.nome_fantasia || '';
        this.form.cep = data.cep || '';
        this.form.logradouro = data.logradouro || '';
        this.form.numero = data.numero || '';
        this.form.bairro = data.bairro || '';
        this.form.cidade = data.municipio || '';
        this.form.estado = data.uf || '';
        this.form.email = data.email || '';
        this.form.telefone = data.ddd_telefone_1 || '';
        
        this.showToastMessage('Dados preenchidos automaticamente!', 'success');
        
      } catch (error) {
        console.error('Erro ao buscar CNPJ:', error);
        this.showToastMessage('CNPJ não localizado ou API falhou', 'warning');
      }
    },
    
    // === Selection ===
    
    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedSuppliers = this.paginatedSuppliers.map(s => s.codfornecedor);
      } else {
        this.selectedSuppliers = [];
      }
    },
    
    // === Messages ===
    
    showSuccessMessage(message) {
      this.successMessage = message;
      this.showSuccessModal = true;
      
      setTimeout(() => {
        this.showSuccessModal = false;
      }, 2000);
    }
  },
  
  // === Watchers ===
  
  watch: {
    selectedSuppliers: {
      handler(newVal) {
        this.selectAll = newVal.length === this.paginatedSuppliers.length && newVal.length > 0;
      },
      deep: true
    }
  }
}).mount('#app');