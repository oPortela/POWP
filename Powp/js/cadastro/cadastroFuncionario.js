// Cadastro de Funcionários - JavaScript
class FuncionarioManager {
  constructor() {
    this.employees = JSON.parse(localStorage.getItem('employees')) || [];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadEmployees();
    this.generateSampleData();
  }

  generateSampleData() {
    if (this.employees.length === 0) {
      const sampleEmployees = [
        {
          id: 1,
          registration: 'FUNC001',
          name: 'João Silva Santos',
          cpf: '123.456.789-00',
          rg: '12.345.678-9',
          birthDate: '1985-03-15',
          phone: '(11) 99999-1234',
          email: 'joao.silva@empresa.com',
          cep: '01234-567',
          address: 'Rua das Flores, 123',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          position: 'gerente',
          department: 'vendas',
          hireDate: '2020-01-15',
          salary: 5000.00,
          workload: '44h',
          status: 'ativo',
          observations: 'Funcionário exemplar com ótimo desempenho'
        },
        {
          id: 2,
          registration: 'FUNC002',
          name: 'Maria Oliveira Costa',
          cpf: '987.654.321-00',
          rg: '98.765.432-1',
          birthDate: '1990-07-22',
          phone: '(11) 88888-5678',
          email: 'maria.oliveira@empresa.com',
          cep: '04567-890',
          address: 'Av. Paulista, 456',
          number: '456',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          position: 'vendedor',
          department: 'vendas',
          hireDate: '2021-03-10',
          salary: 2500.00,
          workload: '44h',
          status: 'ativo',
          observations: 'Vendedora com excelente relacionamento com clientes'
        },
        {
          id: 3,
          registration: 'FUNC003',
          name: 'Carlos Roberto Lima',
          cpf: '456.789.123-00',
          rg: '45.678.912-3',
          birthDate: '1988-12-05',
          phone: '(11) 77777-9012',
          email: 'carlos.lima@empresa.com',
          cep: '02345-678',
          address: 'Rua do Comércio, 789',
          number: '789',
          neighborhood: 'Vila Madalena',
          city: 'São Paulo',
          position: 'estoquista',
          department: 'estoque',
          hireDate: '2019-08-20',
          salary: 2200.00,
          workload: '44h',
          status: 'ativo',
          observations: 'Responsável pelo controle de estoque'
        }
      ];
      
      this.employees = sampleEmployees;
      this.saveEmployees();
    }
  }

  setupEventListeners() {
    // Botões principais
    document.getElementById('new-employee-btn').addEventListener('click', () => this.openEmployeeModal());
    document.getElementById('export-btn').addEventListener('click', () => this.exportData());

    // Modal
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
    });

    document.getElementById('cancel-btn').addEventListener('click', () => this.closeModal(document.getElementById('employee-modal')));

    // Formulário
    document.getElementById('employee-form').addEventListener('submit', (e) => this.saveEmployee(e));

    // Busca
    document.getElementById('search-input').addEventListener('input', (e) => this.searchEmployees(e.target.value));

    // Select all checkbox
    document.getElementById('select-all').addEventListener('change', (e) => this.selectAllEmployees(e.target.checked));

    // Máscaras de input
    this.setupInputMasks();

    // CEP lookup
    document.getElementById('employee-cep').addEventListener('blur', (e) => this.lookupCEP(e.target.value));
  }

  setupInputMasks() {
    // Máscara para CPF
    document.getElementById('employee-cpf').addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      e.target.value = value;
    });

    // Máscara para telefone
    document.getElementById('employee-phone').addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      value = value.replace(/(\d{2})(\d)/, '($1) $2');
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
      e.target.value = value;
    });

    // Máscara para CEP
    document.getElementById('employee-cep').addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
      e.target.value = value;
    });
  }

  async lookupCEP(cep) {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          document.getElementById('employee-address').value = data.logradouro;
          document.getElementById('employee-neighborhood').value = data.bairro;
          document.getElementById('employee-city').value = data.localidade;
        }
      } catch (error) {
        console.log('Erro ao buscar CEP:', error);
      }
    }
  }

  loadEmployees() {
    const tbody = document.getElementById('employees-table-body');
    tbody.innerHTML = '';

    this.employees.forEach(employee => {
      const row = this.createEmployeeRow(employee);
      tbody.appendChild(row);
    });
  }

  createEmployeeRow(employee) {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td><input type="checkbox" class="employee-checkbox" data-id="${employee.id}"></td>
      <td>${employee.registration}</td>
      <td>
        <div>
          <strong>${employee.name}</strong>
          <br><small style="color: #666;">${employee.email}</small>
        </div>
      </td>
      <td>${this.getPositionName(employee.position)}</td>
      <td>${this.getDepartmentName(employee.department)}</td>
      <td>${employee.phone}</td>
      <td>${employee.email}</td>
      <td>R$ ${employee.salary.toFixed(2)}</td>
      <td><span class="status-badge ${this.getStatusClass(employee.status)}">${this.getStatusName(employee.status)}</span></td>
      <td>
        <button class="btn btn-outline" onclick="funcionarioManager.editEmployee(${employee.id})" style="padding: 4px 8px; margin-right: 4px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="btn btn-danger" onclick="funcionarioManager.deleteEmployee(${employee.id})" style="padding: 4px 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </td>
    `;

    return row;
  }

  getPositionName(position) {
    const positions = {
      'gerente': 'Gerente',
      'vendedor': 'Vendedor',
      'caixa': 'Caixa',
      'estoquista': 'Estoquista',
      'supervisor': 'Supervisor',
      'assistente': 'Assistente',
      'analista': 'Analista',
      'coordenador': 'Coordenador'
    };
    return positions[position] || position;
  }

  getDepartmentName(department) {
    const departments = {
      'vendas': 'Vendas',
      'financeiro': 'Financeiro',
      'estoque': 'Estoque',
      'rh': 'Recursos Humanos',
      'ti': 'Tecnologia da Informação',
      'marketing': 'Marketing',
      'administrativo': 'Administrativo'
    };
    return departments[department] || department;
  }

  getStatusName(status) {
    const statuses = {
      'ativo': 'Ativo',
      'inativo': 'Inativo',
      'ferias': 'Férias',
      'licenca': 'Licença'
    };
    return statuses[status] || status;
  }

  getStatusClass(status) {
    const classes = {
      'ativo': 'status-success',
      'inativo': 'status-danger',
      'ferias': 'status-warning',
      'licenca': 'status-warning'
    };
    return classes[status] || 'status-success';
  }

  openEmployeeModal(employee = null) {
    const modal = document.getElementById('employee-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('employee-form');
    
    if (employee) {
      title.textContent = 'Editar Funcionário';
      this.fillEmployeeForm(employee);
    } else {
      title.textContent = 'Novo Funcionário';
      form.reset();
      document.getElementById('employee-registration').value = this.generateEmployeeRegistration();
      document.getElementById('employee-status').value = 'ativo';
      document.getElementById('employee-workload').value = '44h';
      document.getElementById('employee-hire-date').value = new Date().toISOString().split('T')[0];
    }
    
    modal.classList.add('show');
  }

  closeModal(modal) {
    modal.classList.remove('show');
  }

  generateEmployeeRegistration() {
    const lastEmployee = this.employees[this.employees.length - 1];
    const lastNumber = lastEmployee ? parseInt(lastEmployee.registration.replace('FUNC', '')) : 0;
    return `FUNC${String(lastNumber + 1).padStart(3, '0')}`;
  }

  fillEmployeeForm(employee) {
    document.getElementById('employee-registration').value = employee.registration;
    document.getElementById('employee-name').value = employee.name;
    document.getElementById('employee-cpf').value = employee.cpf;
    document.getElementById('employee-rg').value = employee.rg || '';
    document.getElementById('employee-birth-date').value = employee.birthDate || '';
    document.getElementById('employee-phone').value = employee.phone;
    document.getElementById('employee-email').value = employee.email;
    document.getElementById('employee-cep').value = employee.cep || '';
    document.getElementById('employee-address').value = employee.address || '';
    document.getElementById('employee-number').value = employee.number || '';
    document.getElementById('employee-neighborhood').value = employee.neighborhood || '';
    document.getElementById('employee-city').value = employee.city || '';
    document.getElementById('employee-position').value = employee.position;
    document.getElementById('employee-department').value = employee.department;
    document.getElementById('employee-hire-date').value = employee.hireDate;
    document.getElementById('employee-salary').value = employee.salary;
    document.getElementById('employee-workload').value = employee.workload || '44h';
    document.getElementById('employee-status').value = employee.status || 'ativo';
    document.getElementById('employee-observations').value = employee.observations || '';
  }

  saveEmployee(e) {
    e.preventDefault();
    
    const employeeData = {
      id: Date.now(),
      registration: document.getElementById('employee-registration').value,
      name: document.getElementById('employee-name').value,
      cpf: document.getElementById('employee-cpf').value,
      rg: document.getElementById('employee-rg').value,
      birthDate: document.getElementById('employee-birth-date').value,
      phone: document.getElementById('employee-phone').value,
      email: document.getElementById('employee-email').value,
      cep: document.getElementById('employee-cep').value,
      address: document.getElementById('employee-address').value,
      number: document.getElementById('employee-number').value,
      neighborhood: document.getElementById('employee-neighborhood').value,
      city: document.getElementById('employee-city').value,
      position: document.getElementById('employee-position').value,
      department: document.getElementById('employee-department').value,
      hireDate: document.getElementById('employee-hire-date').value,
      salary: parseFloat(document.getElementById('employee-salary').value),
      workload: document.getElementById('employee-workload').value,
      status: document.getElementById('employee-status').value,
      observations: document.getElementById('employee-observations').value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Verificar se é edição ou novo funcionário
    const existingIndex = this.employees.findIndex(e => e.registration === employeeData.registration);
    
    if (existingIndex >= 0) {
      employeeData.id = this.employees[existingIndex].id;
      employeeData.createdAt = this.employees[existingIndex].createdAt;
      this.employees[existingIndex] = employeeData;
    } else {
      this.employees.push(employeeData);
    }

    this.saveEmployees();
    this.loadEmployees();
    this.closeModal(document.getElementById('employee-modal'));
    this.showToast('Funcionário salvo com sucesso!', 'success');
  }

  editEmployee(id) {
    const employee = this.employees.find(e => e.id === id);
    if (employee) {
      this.openEmployeeModal(employee);
    }
  }

  deleteEmployee(id) {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      this.employees = this.employees.filter(e => e.id !== id);
      this.saveEmployees();
      this.loadEmployees();
      this.showToast('Funcionário excluído com sucesso!', 'success');
    }
  }

  searchEmployees(query) {
    if (!query.trim()) {
      this.loadEmployees();
      return;
    }
    
    const filteredEmployees = this.employees.filter(employee => 
      employee.name.toLowerCase().includes(query.toLowerCase()) ||
      employee.registration.toLowerCase().includes(query.toLowerCase()) ||
      employee.email.toLowerCase().includes(query.toLowerCase()) ||
      employee.cpf.includes(query) ||
      employee.phone.includes(query) ||
      this.getPositionName(employee.position).toLowerCase().includes(query.toLowerCase()) ||
      this.getDepartmentName(employee.department).toLowerCase().includes(query.toLowerCase())
    );
    
    this.displayFilteredEmployees(filteredEmployees);
  }

  displayFilteredEmployees(employees) {
    const tbody = document.getElementById('employees-table-body');
    tbody.innerHTML = '';
    
    employees.forEach(employee => {
      const row = this.createEmployeeRow(employee);
      tbody.appendChild(row);
    });
  }

  selectAllEmployees(checked) {
    const checkboxes = document.querySelectorAll('.employee-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.checked = checked;
    });
  }

  exportData() {
    const selectedIds = Array.from(document.querySelectorAll('.employee-checkbox:checked'))
      .map(cb => parseInt(cb.dataset.id));
    
    const dataToExport = selectedIds.length > 0 
      ? this.employees.filter(e => selectedIds.includes(e.id))
      : this.employees;
    
    const data = {
      employees: dataToExport,
      exportDate: new Date().toISOString(),
      totalEmployees: dataToExport.length
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `funcionarios_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showToast(`${dataToExport.length} funcionário(s) exportado(s) com sucesso!`, 'success');
  }

  saveEmployees() {
    localStorage.setItem('employees', JSON.stringify(this.employees));
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
if (!document.querySelector('style[data-employee-styles]')) {
  const style = document.createElement('style');
  style.setAttribute('data-employee-styles', 'true');
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
    
    .status-warning {
      background-color: #fff3cd;
      color: #856404;
    }
    
    .status-danger {
      background-color: #f8d7da;
      color: #721c24;
    }
  `;
  document.head.appendChild(style);
}

// Inicializar quando a página carregar
let funcionarioManager;
document.addEventListener('DOMContentLoaded', () => {
  funcionarioManager = new FuncionarioManager();
});