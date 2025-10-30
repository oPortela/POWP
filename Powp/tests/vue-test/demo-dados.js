// Dados de demonstração para testar a aplicação Vue.js
// Este arquivo pode ser usado para simular dados quando a API não estiver disponível

const DEMO_SUPPLIERS = [
  {
    codfornecedor: 1,
    cnpj: "11.222.333/0001-44",
    fornecedor: "Tech Solutions Ltda",
    fantasia: "TechSol",
    email: "contato@techsol.com.br",
    dtcadastro: "2024-01-15",
    pwendereco: {
      cep: "01310-100",
      logradouro: "Av. Paulista",
      numero: "1000",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      estado: "SP"
    },
    pwtelefone: {
      telefone: "(11) 3333-4444",
      celular: "(11) 99999-8888"
    }
  },
  {
    codfornecedor: 2,
    cnpj: "22.333.444/0001-55",
    fornecedor: "Inovação Digital S.A.",
    fantasia: "InovaDigital",
    email: "vendas@inovadigital.com.br",
    dtcadastro: "2024-02-20",
    pwendereco: {
      cep: "22071-900",
      logradouro: "Av. Atlântica",
      numero: "500",
      bairro: "Copacabana",
      cidade: "Rio de Janeiro",
      estado: "RJ"
    },
    pwtelefone: {
      telefone: "(21) 2222-3333",
      celular: "(21) 98888-7777"
    }
  },
  {
    codfornecedor: 3,
    cnpj: "33.444.555/0001-66",
    fornecedor: "Sistemas Avançados ME",
    fantasia: "SisAvançados",
    email: "info@sisavancados.com.br",
    dtcadastro: "2024-03-10",
    pwendereco: {
      cep: "30112-000",
      logradouro: "Rua da Bahia",
      numero: "1200",
      bairro: "Centro",
      cidade: "Belo Horizonte",
      estado: "MG"
    },
    pwtelefone: {
      telefone: "(31) 3333-4444",
      celular: "(31) 97777-6666"
    }
  },
  {
    codfornecedor: 4,
    cnpj: "44.555.666/0001-77",
    fornecedor: "Automação Industrial Ltda",
    fantasia: "AutoInd",
    email: "comercial@autoind.com.br",
    dtcadastro: "2024-04-05",
    pwendereco: {
      cep: "80010-000",
      logradouro: "Rua XV de Novembro",
      numero: "800",
      bairro: "Centro",
      cidade: "Curitiba",
      estado: "PR"
    },
    pwtelefone: {
      telefone: "(41) 3333-2222",
      celular: "(41) 96666-5555"
    }
  },
  {
    codfornecedor: 5,
    cnpj: "55.666.777/0001-88",
    fornecedor: "Consultoria Empresarial S.A.",
    fantasia: "ConsultEmp",
    email: "atendimento@consultemp.com.br",
    dtcadastro: "2024-05-12",
    pwendereco: {
      cep: "40070-110",
      logradouro: "Av. Sete de Setembro",
      numero: "300",
      bairro: "Centro",
      cidade: "Salvador",
      estado: "BA"
    },
    pwtelefone: {
      telefone: "(71) 3333-1111",
      celular: "(71) 95555-4444"
    }
  },
  {
    codfornecedor: 6,
    cnpj: "66.777.888/0001-99",
    fornecedor: "Logística Express Ltda",
    fantasia: "LogExpress",
    email: "operacoes@logexpress.com.br",
    dtcadastro: "2024-06-18",
    pwendereco: {
      cep: "60160-230",
      logradouro: "Av. Beira Mar",
      numero: "1500",
      bairro: "Meireles",
      cidade: "Fortaleza",
      estado: "CE"
    },
    pwtelefone: {
      telefone: "(85) 3333-0000",
      celular: "(85) 94444-3333"
    }
  },
  {
    codfornecedor: 7,
    cnpj: "77.888.999/0001-00",
    fornecedor: "Desenvolvimento Web ME",
    fantasia: "DevWeb",
    email: "projetos@devweb.com.br",
    dtcadastro: "2024-07-22",
    pwendereco: {
      cep: "69005-040",
      logradouro: "Av. Eduardo Ribeiro",
      numero: "600",
      bairro: "Centro",
      cidade: "Manaus",
      estado: "AM"
    },
    pwtelefone: {
      telefone: "(92) 3333-9999",
      celular: "(92) 93333-2222"
    }
  },
  {
    codfornecedor: 8,
    cnpj: "88.999.000/0001-11",
    fornecedor: "Segurança Digital S.A.",
    fantasia: "SecDigital",
    email: "seguranca@secdigital.com.br",
    dtcadastro: "2024-08-30",
    pwendereco: {
      cep: "70040-010",
      logradouro: "SCS Quadra 1",
      numero: "100",
      bairro: "Asa Sul",
      cidade: "Brasília",
      estado: "DF"
    },
    pwtelefone: {
      telefone: "(61) 3333-8888",
      celular: "(61) 92222-1111"
    }
  }
];

// Função para simular API quando não estiver disponível
function createMockAPI() {
  // Simular delay de rede
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  return {
    // GET /api/fornecedores
    async getSuppliers() {
      await delay(800); // Simula delay da rede
      return {
        data: DEMO_SUPPLIERS,
        total: DEMO_SUPPLIERS.length
      };
    },
    
    // GET /api/fornecedores/:id
    async getSupplier(id) {
      await delay(500);
      const supplier = DEMO_SUPPLIERS.find(s => s.codfornecedor == id);
      if (!supplier) {
        throw new Error('Fornecedor não encontrado');
      }
      return supplier;
    },
    
    // POST /api/fornecedores
    async createSupplier(data) {
      await delay(1000);
      const newSupplier = {
        codfornecedor: Math.max(...DEMO_SUPPLIERS.map(s => s.codfornecedor)) + 1,
        ...data,
        dtcadastro: new Date().toISOString().split('T')[0]
      };
      DEMO_SUPPLIERS.push(newSupplier);
      return newSupplier;
    },
    
    // PUT /api/fornecedores/:id
    async updateSupplier(id, data) {
      await delay(1000);
      const index = DEMO_SUPPLIERS.findIndex(s => s.codfornecedor == id);
      if (index === -1) {
        throw new Error('Fornecedor não encontrado');
      }
      DEMO_SUPPLIERS[index] = { ...DEMO_SUPPLIERS[index], ...data };
      return DEMO_SUPPLIERS[index];
    },
    
    // DELETE /api/fornecedores/:id
    async deleteSupplier(id) {
      await delay(800);
      const index = DEMO_SUPPLIERS.findIndex(s => s.codfornecedor == id);
      if (index === -1) {
        throw new Error('Fornecedor não encontrado');
      }
      DEMO_SUPPLIERS.splice(index, 1);
      return true;
    }
  };
}

// Função para ativar modo demo
function enableDemoMode() {
  console.log('🧪 Modo Demo Ativado - Usando dados simulados');
  
  const mockAPI = createMockAPI();
  
  // Sobrescrever fetch para usar dados simulados
  const originalFetch = window.fetch;
  
  window.fetch = async function(url, options = {}) {
    const method = options.method || 'GET';
    
    // Interceptar chamadas para a API de fornecedores
    if (url.includes('/api/fornecedores')) {
      try {
        if (method === 'GET' && !url.includes('/api/fornecedores/')) {
          // GET /api/fornecedores
          return {
            ok: true,
            json: async () => await mockAPI.getSuppliers()
          };
        } else if (method === 'GET' && url.includes('/api/fornecedores/')) {
          // GET /api/fornecedores/:id
          const id = url.split('/').pop();
          return {
            ok: true,
            json: async () => await mockAPI.getSupplier(id)
          };
        } else if (method === 'POST') {
          // POST /api/fornecedores
          const data = JSON.parse(options.body);
          return {
            ok: true,
            json: async () => await mockAPI.createSupplier(data)
          };
        } else if (method === 'PUT') {
          // PUT /api/fornecedores/:id
          const id = url.split('/').pop();
          const data = JSON.parse(options.body);
          return {
            ok: true,
            json: async () => await mockAPI.updateSupplier(id, data)
          };
        } else if (method === 'DELETE') {
          // DELETE /api/fornecedores/:id
          const id = url.split('/').pop();
          await mockAPI.deleteSupplier(id);
          return {
            ok: true,
            status: 204,
            json: async () => ({})
          };
        }
      } catch (error) {
        return {
          ok: false,
          status: 400,
          json: async () => ({ message: error.message })
        };
      }
    }
    
    // Para outras URLs, usar fetch original
    return originalFetch(url, options);
  };
}

// Função para desativar modo demo
function disableDemoMode() {
  console.log('🔄 Modo Demo Desativado - Usando API real');
  // Restaurar fetch original seria necessário salvar a referência
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.DEMO_SUPPLIERS = DEMO_SUPPLIERS;
  window.enableDemoMode = enableDemoMode;
  window.disableDemoMode = disableDemoMode;
}

// Para Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEMO_SUPPLIERS,
    createMockAPI,
    enableDemoMode,
    disableDemoMode
  };
}