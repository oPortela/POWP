//Aba para cadastro de cliente
// Arquivo: js/cadastro/cadastroCliente.js

//Dados iniciais para clientes
const initialClients = [
    {
        codcli: 1,
        name: "João Pereira Silva",
        email: "joaosilva@exemplo.com",
        phone: "62999887766",
        cpf_cnpj: "00022211158",
        address: [
            {
                logradoudoro: "Rua das Flores",
                numero: "123",
                bairro: "Centro",
                cidade: "São Paulo",
                estado: "SP",
                pais: "Brasil",
                cep: "01000000",
            }
        ],
        registration_date: "31-07-2025",
        status: "A"
    },
    {
        codcli: 2,
        name: "Maria da Silva",
        email: "mariasilva@exemplo.com",
        phone: "62998887766",
        cpf_cnpj: "44422211158",
        address: [
            {
                logradoudoro: "Rua das Ortensias",
                numero: "15",
                bairro: "Centro",
                cidade: "São Bernardo do Campo",
                estado: "SP",
                pais: "Brasil",
                cep: "01000000",
            }
        ],
        registration_date: "30-07-2025",
        status: "A"
    },
    {
        codcli: 3,
        name: "Lucas Santos",
        email: "lucassantos@exemplo.com",
        phone: "62997776655",
        cpf_cnpj: "00033322211",
        address: [
            {
                logradoudoro: "Rua das carentes",
                numero: "123",
                bairro: "Barra Funda",
                cidade: "São Paulo",
                estado: "SP",
                pais: "Brasil",
                cep: "078090909",
            }
        ],
        registration_date: "10-07-2025",
        status: "A"
    }
];

// Função para formatar a data no formato "DD MMM YYYY"
function formateDate(date) {
    if (!date) return '';
    const d = new Date(date);

    const day = d.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${month} ${year}`;
}

function formatCpfCnpj(value) {
    if (!value) return '';
    const cleanValue = value.replace(/\D/g, '');

    if (cleanValue.length <= 11) {
        //CPF
        return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
        //CNPJ
        return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
}

// Classe principal para gerenciar os clientes
class ClientManager {
    constructor() {
        this.clients = [];
        this.selectedClient = null;
        this.sortColumn = 'codcli';
        this.sortDirection = 'asc';
        this.selectedClients = new Set();
        this.isLoading = false;

        //Configurações de paginação
        this.currentPage = 1;
        this.recordsPerPage = 25;
        this.totalRecords = 0;
        this.totalPages = 0;
    }

    // Método para carregar os clientes do backend
    async loadClients() {
        try {
            this.isLoading = true;

            const params = new URLSearchParams({
                action: 'list',
                page: this.currentPage,
                limit: this.recordsPerPage,
                sort: this.sortColumn,
                direction: this.sortDirection
            });

            if (searchTerm) {
                params.append('search', searchTerm);
            }

            const response = await fetch(`./back/cadastro/clients.php?${params}`);

            if (!response.ok) {
                throw new Errpr(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                this.clients = data.clients || [];

                if (data.pagination) {
                    this.currentPage = data.pagination.currentPage;
                    this.totalRecords = data.pagination.totalRecords;
                    this.totalPages = data.pagination.totalPages;
                    this.recordsPerPage = data.pagination.recordsPerPage;
                }
            } else {
                console.error('Erro ao carregar clientes: ', data.message);
                //Usar dados iniciais se houver erro
                this.clients = initialClients;
                this.totalRecords = initialClients.length;
                this.totalPages = Math.ceil(this.totalRecords / this.recordsPerPage);
            }

        } catch (error) {
            console.error('Erro na comunicação com o servidor: ', error);
            // Usar dados iniciais se houver erro
            this.clients = initialClients;
            this.totalRecords = initialClients.length;
            this.totalPages = Math.ceil(this.totalRecords / this.recordsPerPage);
        } finally {
            this.isLoading = false;
        }
    }

    //Obter todos os clientes com filtro e ordenação
    getAllClients(searchTerm = '') {
        let filtered = [...this.clients];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(client => 
                client.codcli.toString().includes(term) ||
                client.name.toLowerCase().includes(term) ||
                client.email.toLowerCase().includes(term) ||
                client.phone.toLowerCase().includes(term) ||
                client.cpf_cnpj.toLowerCase().includes(term) ||
                client.address.some(address => 
                    address.logradoudoro.toLowerCase().includes(term) ||
                    address.bairro.toLowerCase().includes(term) ||
                    address.cidade.toLowerCase().includes(term) ||
                    address.estado.toLowerCase().includes(term) ||
                    address.pais.toLowerCase().includes(term) ||
                    address.cep.toLowerCase().includes(term)
                )
            );
        }

        //Ordenar os clientes
        filtered.sort((a, b) => {
            const aValue = a[this.sortColumn];
            const bValue = b[this.sortColumn];

            if (typeof aValue === 'string') {
                return this.sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            } else {
                return this.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }
        });

        return filtered;
    }

    //Obter clientes paginados (agora retorna os dados já carregados do backend)
    getPaginatedClients(searchTerm = '') {
        // Como a paginação é feita no backend, apenas retornamos os clientes já carregados
        return this.clients;
    }

    // Definir registros por página
    setRecordsPerPage(count) {
        this.recordsPerPage = parseInt(count);
        this.currentPage = 1; // Resetar para a primeira página ao mudar o número de registros por página
    }

    // Ir para uma página específica
    goToPage(page) {
        const pageNum = parseInt(page);
        if (pageNum >= 1 && pageNum <= this.totalPages) {
            this.currentPage = pageNum;
            return true;
        }
        return false;
    }

    // Ir para a próxima página
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            return true;
        }
        return false;
    }

    // Ir para a página anterior
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            return true;
        }
        return false;
    }

    // Ir para a primeira página
    firstPage() {
        if (this.currentPage > 1) {
            this.currentPage = 1;
            return true;
        }
        return false
    }

    // Ir para a última página
    lastPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage = this.totalPages;
            return true;
        }
        return false;
    }

    // Obter informações de paginação
    getPaginationInfo() {
        const startRecord = this.totalRecords === 0 ? 0 : (this.currentPage - 1) * this.recordsPerPage + 1;
        const endRecord = Math.min(this.currentPage * this.recordsPerPage, this.totalRecords);

        return {
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            recordsPerPage: this.recordsPerPage,
            totalRecords: this.totalRecords,
            startRecord,
            endRecord
        };
    }

    // Adicionar um novo cliente
    async addClient(clientData) {
        try {
            const formData = new FormData();
            formData.append('action', 'create');

            // Adicionar os dados do cliente ao FormData
            Object.keys(clientData).forEach(key => {
                formData.append(key, clientData[key]);
            });

            const response = await fetch('./back/cadastro/clients.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                await this.loadClients();
                return data.client;
            } else {
                throw new Error(data.message || 'Erro ao adicionar cliente');
            }
        } catch (error) {
            console.error('Erro ao adicionar cliente: ', error);
            throw error;
        }
    }
}