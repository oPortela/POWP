// Cadastro de Produtos - JavaScript
class ProdutoManager {
  constructor() {
    this.products = JSON.parse(localStorage.getItem('products')) || [];
    this.suppliers = JSON.parse(localStorage.getItem('suppliers')) || [
      { id: 1, name: 'Fornecedor A' },
      { id: 2, name: 'Fornecedor B' },
      { id: 3, name: 'Fornecedor C' }
    ];
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadSuppliers();
    this.loadProducts();
    this.generateSampleData();
  }

  generateSampleData() {
    if (this.products.length === 0) {
      const sampleProducts = [
        {
          id: 1,
          code: 'PROD001',
          name: 'Smartphone Samsung Galaxy A54',
          category: 'eletronicos',
          supplier: 'Fornecedor A',
          brand: 'Samsung',
          costPrice: 800.00,
          salePrice: 1200.00,
          barcode: '7891234567890',
          unit: 'UN',
          status: 'ativo',
          description: 'Smartphone Android com 128GB de armazenamento e câmera de 50MP'
        },
        {
          id: 2,
          code: 'PROD002',
          name: 'Camiseta Polo Masculina',
          category: 'roupas',
          supplier: 'Fornecedor B',
          brand: 'Lacoste',
          costPrice: 25.00,
          salePrice: 45.00,
          barcode: '7891234567891',
          unit: 'UN',
          status: 'ativo',
          description: 'Camiseta polo 100% algodão, disponível em várias cores'
        },
        {
          id: 3,
          code: 'PROD003',
          name: 'Mesa de Jantar 6 Lugares',
          category: 'casa',
          supplier: 'Fornecedor C',
          brand: 'Móveis Brasil',
          costPrice: 300.00,
          salePrice: 500.00,
          barcode: '7891234567892',
          unit: 'UN',
          status: 'ativo',
          description: 'Mesa de jantar em madeira maciça para 6 pessoas'
        }
      ];
      
      this.products = sampleProducts;
      this.saveProducts();
    }
  }

  setupEventListeners() {
    // Botões principais
    document.getElementById('new-product-btn').addEventListener('click', () => this.openProductModal());
    document.getElementById('export-btn').addEventListener('click', () => this.exportData());

    // Modal
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
    });

    document.getElementById('cancel-btn').addEventListener('click', () => this.closeModal(document.getElementById('product-modal')));

    // Formulário
    document.getElementById('product-form').addEventListener('submit', (e) => this.saveProduct(e));

    // Busca
    document.getElementById('search-input').addEventListener('input', (e) => this.searchProducts(e.target.value));

    // Select all checkbox
    document.getElementById('select-all').addEventListener('change', (e) => this.selectAllProducts(e.target.checked));

    // Cálculo automático de margem
    document.getElementById('product-cost-price').addEventListener('input', () => this.calculateMargin());
    document.getElementById('product-sale-price').addEventListener('input', () => this.calculateMargin());
  }

  loadSuppliers() {
    const supplierSelect = document.getElementById('product-supplier');
    supplierSelect.innerHTML = '<option value="">Selecione um fornecedor</option>';
    
    this.suppliers.forEach(supplier => {
      const option = document.createElement('option');
      option.value = supplier.name;
      option.textContent = supplier.name;
      supplierSelect.appendChild(option);
    });
  }

  loadProducts() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';

    this.products.forEach(product => {
      const row = this.createProductRow(product);
      tbody.appendChild(row);
    });
  }

  createProductRow(product) {
    const row = document.createElement('tr');
    const margin = this.calculateProductMargin(product.costPrice, product.salePrice);
    
    row.innerHTML = `
      <td><input type="checkbox" class="product-checkbox" data-id="${product.id}"></td>
      <td>${product.code}</td>
      <td>
        <div>
          <strong>${product.name}</strong>
          ${product.brand ? `<br><small style="color: #666;">${product.brand}</small>` : ''}
        </div>
      </td>
      <td>${this.getCategoryName(product.category)}</td>
      <td>${product.supplier}</td>
      <td>R$ ${product.costPrice.toFixed(2)}</td>
      <td>R$ ${product.salePrice.toFixed(2)}</td>
      <td>${margin.toFixed(1)}%</td>
      <td><span class="status-badge ${product.status === 'ativo' ? 'status-success' : 'status-danger'}">${product.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
      <td>
        <button class="btn btn-outline" onclick="produtoManager.editProduct(${product.id})" style="padding: 4px 8px; margin-right: 4px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="btn btn-danger" onclick="produtoManager.deleteProduct(${product.id})" style="padding: 4px 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </td>
    `;

    return row;
  }

  getCategoryName(category) {
    const categories = {
      'eletronicos': 'Eletrônicos',
      'roupas': 'Roupas',
      'casa': 'Casa e Jardim',
      'esportes': 'Esportes',
      'livros': 'Livros',
      'beleza': 'Beleza e Cuidados',
      'automotivo': 'Automotivo',
      'outros': 'Outros'
    };
    return categories[category] || category;
  }

  calculateProductMargin(costPrice, salePrice) {
    if (costPrice <= 0) return 0;
    return ((salePrice - costPrice) / costPrice) * 100;
  }

  calculateMargin() {
    const costPrice = parseFloat(document.getElementById('product-cost-price').value) || 0;
    const salePrice = parseFloat(document.getElementById('product-sale-price').value) || 0;
    
    const margin = this.calculateProductMargin(costPrice, salePrice);
    document.getElementById('product-margin').value = margin.toFixed(2);
  }

  openProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('product-form');
    
    if (product) {
      title.textContent = 'Editar Produto';
      this.fillProductForm(product);
    } else {
      title.textContent = 'Novo Produto';
      form.reset();
      document.getElementById('product-code').value = this.generateProductCode();
      document.getElementById('product-status').value = 'ativo';
      document.getElementById('product-unit').value = 'UN';
    }
    
    modal.classList.add('show');
  }

  closeModal(modal) {
    modal.classList.remove('show');
  }

  generateProductCode() {
    const lastProduct = this.products[this.products.length - 1];
    const lastNumber = lastProduct ? parseInt(lastProduct.code.replace('PROD', '')) : 0;
    return `PROD${String(lastNumber + 1).padStart(3, '0')}`;
  }

  fillProductForm(product) {
    document.getElementById('product-code').value = product.code;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-supplier').value = product.supplier;
    document.getElementById('product-brand').value = product.brand || '';
    document.getElementById('product-cost-price').value = product.costPrice;
    document.getElementById('product-sale-price').value = product.salePrice;
    document.getElementById('product-barcode').value = product.barcode || '';
    document.getElementById('product-unit').value = product.unit || 'UN';
    document.getElementById('product-status').value = product.status || 'ativo';
    document.getElementById('product-description').value = product.description || '';
    
    this.calculateMargin();
  }

  saveProduct(e) {
    e.preventDefault();
    
    const productData = {
      id: Date.now(),
      code: document.getElementById('product-code').value,
      name: document.getElementById('product-name').value,
      category: document.getElementById('product-category').value,
      supplier: document.getElementById('product-supplier').value,
      brand: document.getElementById('product-brand').value,
      costPrice: parseFloat(document.getElementById('product-cost-price').value),
      salePrice: parseFloat(document.getElementById('product-sale-price').value),
      barcode: document.getElementById('product-barcode').value,
      unit: document.getElementById('product-unit').value,
      status: document.getElementById('product-status').value,
      description: document.getElementById('product-description').value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Verificar se é edição ou novo produto
    const existingIndex = this.products.findIndex(p => p.code === productData.code);
    
    if (existingIndex >= 0) {
      productData.id = this.products[existingIndex].id;
      productData.createdAt = this.products[existingIndex].createdAt;
      this.products[existingIndex] = productData;
    } else {
      this.products.push(productData);
    }

    this.saveProducts();
    this.loadProducts();
    this.closeModal(document.getElementById('product-modal'));
    this.showToast('Produto salvo com sucesso!', 'success');
  }

  editProduct(id) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      this.openProductModal(product);
    }
  }

  deleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.products = this.products.filter(p => p.id !== id);
      this.saveProducts();
      this.loadProducts();
      this.showToast('Produto excluído com sucesso!', 'success');
    }
  }

  searchProducts(query) {
    if (!query.trim()) {
      this.loadProducts();
      return;
    }
    
    const filteredProducts = this.products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.code.toLowerCase().includes(query.toLowerCase()) ||
      product.brand?.toLowerCase().includes(query.toLowerCase()) ||
      product.supplier.toLowerCase().includes(query.toLowerCase()) ||
      product.barcode?.includes(query)
    );
    
    this.displayFilteredProducts(filteredProducts);
  }

  displayFilteredProducts(products) {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';
    
    products.forEach(product => {
      const row = this.createProductRow(product);
      tbody.appendChild(row);
    });
  }

  selectAllProducts(checked) {
    const checkboxes = document.querySelectorAll('.product-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.checked = checked;
    });
  }

  exportData() {
    const selectedIds = Array.from(document.querySelectorAll('.product-checkbox:checked'))
      .map(cb => parseInt(cb.dataset.id));
    
    const dataToExport = selectedIds.length > 0 
      ? this.products.filter(p => selectedIds.includes(p.id))
      : this.products;
    
    const data = {
      products: dataToExport,
      exportDate: new Date().toISOString(),
      totalProducts: dataToExport.length
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produtos_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showToast(`${dataToExport.length} produto(s) exportado(s) com sucesso!`, 'success');
  }

  saveProducts() {
    localStorage.setItem('products', JSON.stringify(this.products));
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
}

// Adicionar estilos para status badges se não existirem
if (!document.querySelector('style[data-product-styles]')) {
  const style = document.createElement('style');
  style.setAttribute('data-product-styles', 'true');
  style.textContent = `
    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .status-success {
      background-color: #d4edda;
      color: #155724;
    }
    
    .status-danger {
      background-color: #f8d7da;
      color: #721c24;
    }
  `;
  document.head.appendChild(style);
}

// Inicializar quando a página carregar
let produtoManager;
document.addEventListener('DOMContentLoaded', () => {
  produtoManager = new ProdutoManager();
});