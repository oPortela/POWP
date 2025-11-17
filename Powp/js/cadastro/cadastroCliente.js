document.addEventListener('DOMContentLoaded', () => {
    
    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    const newClientBtn = document.getElementById('new-client-btn');
    const clientModal = document.getElementById('client-modal');
    const cliseModalBtns = document.querySelectorAll('.close-modal, #cancel-btn');
    const clientForm = document.getElementById('client-form');
    const saveButton = document.getElementById('sabe-btn');
    const modalTitle = document.getElementById('modal-title');
    const tableBody = document.getElementById('clients-table-body');

    const tipoPessoaSelect = document.getElementById('cliente-tipopessoa');
    const pessoaFisicaFields = document.getElementById('pessoa-fisica-fields');
    const pessoaJuridicaFields = document.getElementById('pessoa-juridica-fields');

    const cepInput = document.getElementById('endereco-cep')
    const cpfInput = document.getElementById('cliente-cpf');
    const cnpjInput = document.getElementById('cliente-cnpj');

    const confirmationModal = document.getElementById('confirmation-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmeDeleteBtn = document.getElementById('confirm-delete-btn');
    const successModal = document.getElementById('sucess-modal');
    const successMessageText = document.getElementById('success-message-text');

    let clientIdToDelete = null;
    let editingClientId = null;
    let currentPage = 1;
    const itemsParPage = 10;

    const togglePessoaFields = () => {
        const tipo = tipoPessoaSelect.value; 

        if (tipo === 'F') {
            pessoaFisicaFields.classList.remove('hidden');
            pessoaJuridicaFields.classList.add('hidden');

            cnpjInput.value = '';
            document.getElementById('cliente-inscricaoestadual').value = '';
            document.getElementById('cliente-abertura').value = '';
        } else if (tipo === 'J') {
            pessoaFisicaFields.classList.add('hidden');
            pessoaJuridicaFields.classList.remove('hidden');

            cpfInput.value = '';
            document.getElementById('cliente-rg').value = '';
            document.getElementById('cliente-dt-nascimento').value ='';
        } else {
            pessoaFisicaFields.classList.add('hidden');
            pessoaJuridicaFields.classList.add('hidden');
        }
    };

    //abre o modal para novo cliente
    const opneNewClientModal = () => {
        clientForm.reset();
        modalTitle.texteContent = 'Novo Cliente';
        saveButton.disabled = false;
        editingClientId = null;
        saveButton.textContent = 'Salvar';

        togglePessoaFields();

        clientModal.classList.add('show');
    };

    //Modal de sucesso
    const showSuccessModal = (message) => {
        clientModal.classList.remove('show');
        consfirmartionModal.classList,remove('show');

        successMessageText.textContent = message;
        successModal.classList.add('show');

        setTimeout(() => {
            successModal.classList.remove('show');        
        }, 2000);

        loadClients();
    }

    //Fecha o mnodal principal
    const closeModal = () => {
        clientModal.classList.remove('show');
    }

    //Abre o modal de confirmação
    const openConfirmationModal = (id) => {
        clientIdToDelete = id;
        confirmationModal.classList.add('show');
    }

    //Fecha o modal de confirmação de exclusão
    const closeConfirmationModal = () => {
        clientIdToDelete = null;
        confirmationModal.classList.remove('show');
    }

    //Modal de editar cliente
    const openEditModal = async (id) => {
        clientForm.reset();
        modalTitle.textContent = 'Carregando dados do cliente';
        saveButton.disabled = true;

        const apiUrl = `${API_BASE_URL}/clientes/${id}`;

        try {
            const response = await fetch(apiUtl, {
                method: 'GET',
                headers: {'Accept': 'application/json'}
            });

            if (!response.ok) throw new Error('Falha ao buscar dados do cliente.');

            const client = await response.json();

            document.getElementById('cliente-tipopessoa').value = client.tipopessoa;
            document.getElementById('cliente-nome').value = client.cliente;
            document.getElementById('cliente-fantasia').value = client.fantasia;
            document.getElementById('contato-email').value = client.email;
            document.getElementById('cliente-bloqueio').value = client.bloqueio;
            document.getElementById('cliente-motivo-bloq').value = client.motivo_bloq;
            document.getElementById('cliente-obs').value = client.obs;

            if ('client.pwendereco') {
                document.getElementById('endereco-cep').value = client.pwendereco.cep;
                document.getElementById('endereco-logradouro').value = client.pwendereco.logradouro;
                document.getElementById('endereco-numero').value = client.pwendereco.numero;
                document.getElementById('endereco-bairro').value = client.pwendereco.bairro;
                document.getElementById('endereco-cidade').value = client.pwendereco.cidade;
                document.getElementById('endereco-estado').value = client.pwendereco.estado;
            }

            if (client.pwtelefone) {
                document.getElementById('contato-telefone').value = client.pwtelefone.telefone;
                document.getElementById('contato-celular').value = client.pwtelefone.celular;
            }

            // Preenche Pessoa Física (tabela pwclientefisico)
            if (client.pwclientefisico) {
                document.getElementById('cliente-cpf').value = client.pwclientefisico.cpf;
                document.getElementById('cliente-rg').value = client.pwclientefisico.rg;
                document.getElementById('cliente-dt-nascimento').value = client.pwclientefisico.dt_nascimento;
            }

            // Preenche Pessoa Jurídica (tabela pwclientejuridico)
            if (client.pwclientejuridico) {
                document.getElementById('cliente-cnpj').value = client.pwclientejuridico.cnpj;
                document.getElementById('cliente-inscricaoestadual').value = client.pwclientejuridico.inscricaoestadual;
                document.getElementById('cliente-dtabertura').value = client.pwclientejuridico.dtabertura;
            }

            togglePessoaFields();

            editingClientId = id;
            modalTitle.textContent = 'Editar Cliente';
            saveButton.disabled = false;
            clientModal.classList.add('show');

        } catch (error) {
            console.error('Erro ao carregar dados do cliente: ', error);
            alert(error.message);
        }
    }

    const deleteClient = async () => {
        if (!clientIdToDelete) return;

        confirmeDeleteBtn.disabled = true;
        confirmeDeleteBtn.textContent = 'Excluindo';

        const apiUrl = `${API_BASE_URL}/clientes/${clientIdToDelete}`;

        try {
            const response = await fetch(apiUrl, {
                method: "DELETE",
                headers: {'Accept': 'application/json'}
            });

            if (!response.ok && response.status !== 204) {
                const  errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao excluir o cliente');
            }

            showSuccessModal('Cliente ecvluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir: ', error);
            alert(`Erro: ${error.message}`);
        } finally {
            confirmeDeleteBtn.disabled = false;
            confirmeDeleteBtn.textContent = 'Excluir';
            closeConfirmationModal();
        }
    }

    //Consulta de CEP para buscar endereço
    const fetchAddressByCep = async (cep) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return; 

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            if (!response.ok) throw new Error('Não foi possivel consultar o CEP.');
            
            const addressData = await response.json();
            if (addressData.erro) {
                alert('CEP não localizado. Por favor, preencha o endereço manually.');
                return;
            }

            document.getElementById('endereco-logradouro').value = addressData.logradouro;
            document.getElementById('endereco-bairro').value = addressData.bairro;
            document.getElementById('endereco-cidade').value = addressData.localidade;
            document.getElementById('endereco-estado').value = addressData.uf;
            document.getElementById('endereco-numero').focus();

        } catch (error) {
            console.error('Erro ao buscar CEP: ', error);
            alert(error.message);
        }
    };

    //Consulta de CNPJ para buscar dados da empresa
    const fetchCnpjData = async (cnpj) => {
        const cleanCnpj = cnpj.replace(/\D/g, '');
        if (cleanCnpj.length !== 14) return;

        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
            if (!response.ok) throw new Error('Falha ao buscar CNPJ.');
            
            const data = await response.json();
            
            // Preenche os campos do formulário (com os IDs corretos)
            document.getElementById('cliente-nome').value = data.razao_social;
            document.getElementById('cliente-fantasia').value = data.nome_fantasia;
            document.getElementById('cliente-dtabertura').value = data.data_inicio_atividade;
            document.getElementById('endereco-cep').value = data.cep;
            document.getElementById('endereco-logradouro').value = data.logradouro;
            document.getElementById('endereco-numero').value = data.numero;
            document.getElementById('endereco-bairro').value = data.bairro;
            document.getElementById('endereco-cidade').value = data.municipio;
            document.getElementById('endereco-estado').value = data.uf;
            document.getElementById('contato-email').value = data.email;
            document.getElementById('contato-telefone').value = data.ddd_telefone_1;
            document.getElementById('contato-celular').focus();

        } catch (error) {
            console.error('Erro BrasilAPI (CNPJ):', error);
            alert('CNPJ não localizado ou API falhou.');
        }
    };

    //Buscar dados cliente CPF
    const fetchCpfData = async (cpf) => {
        const cleanCpf = cpf.replace(/\D/g, '');
        if (cleanCpf.length !== 11) return;

        try {
            const response = await fetch(`https://brasilapi.com.br/api/cpf/v1/${cleanCpf}`);
            if (!response.ok) throw new Error('Falha ao buscar CPF.');
            
            const data = await response.json();
            
            document.getElementById('cliente-nome').value = data.nome;
            document.getElementById('cliente-dt-nascimento').value = data.dataNascimento;

        } catch (error) {
            console.error('Erro BrasilAPI (CPF):', error);
            alert('CPF não localizado ou API falhou. (APIs de CPF são restritas)');
        }
    };

    const loadClients = async () => {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Carregando...</td></tr>';

        // ATENÇÃO: Implemente a rota `GET /api/clientes` no seu `routes/api.php`
        // e o método `index` no `ClienteController` para esta função funcionar.
        const apiUrl = `${API_BASE_URL}/clientes?page=${currentPage}&perPage=${itemsPerPage}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {'Accept': 'application/json'}
            });

            if (!response.ok) {
                // Se a rota não existir ainda, vai cair aqui.
                throw new Error(`Falha ao carregar clientes. A API (index) está funcionando? ${response.statusText}`);
            }

            const result = await response.json();
            const clients = result.data;  // Assumindo paginação igual ao fornecedor
            const totalItems = result.total;

            tableBody.innerHTML = '';

            if (clients.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum cliente cadastrado.</td></tr>';
                renderPagination(totalItems); 
                return;
            }

            clients.forEach(client => {
                const tr = document.createElement('tr');
                const dtFormatada = new Date(client.dtcadastro).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

                tr.innerHTML = `
                    <td class="checkbox-column">
                        <input type="checkbox" data-id="${client.codcliente}" />
                    </td>
                    <td>${client.codcliente}</td>
                    <td>${client.cliente}</td> <!-- Campo 'cliente' (Nome/Razão Social) -->
                    <td>${client.email}</td>
                    <td>${dtFormatada}</td>
                    <td>
                        <button class="btn-icon btn-edit" data-id="${client.codcliente}" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </td>
                    <td>
                        <button class="btn-icon btn-delete" data-id="${client.codcliente}" title="Excluir">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            renderPagination(totalItems);

        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">${error.message}</td></tr>`;
        }
    };

    const renderPagination = (totalItems) => {
        const paginationContainer = document.getElementById('pagination-controls');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(totalItems / itemsPerPage);
        paginationContainer.innerHTML = '';
        
        if (totalPages <= 0) return;

        // Botão Anterior
        const prevButton = document.createElement('button');
        prevButton.textContent = '« Anterior';
        prevButton.className = 'btn btn-secondary';
        prevButton.disabled = (currentPage === 1);
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadClients();
            }
        });
        paginationContainer.appendChild(prevButton);

        // Info da Página
        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        pageInfo.style.margin = '0 10px';
        paginationContainer.appendChild(pageInfo);

        // Botão Próximo
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Próximo »';
        nextButton.className = 'btn btn-secondary';
        nextButton.disabled = (currentPage === totalPages);
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadClients();
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        saveButton.disabled = true;
        
        const originalButtonText = editingClientId ? 'Atualizar' : 'Salvar';
        saveButton.textContent = editingClientId ? 'Atualizando...' : 'Salvando...';

        const formData = new FormData(clientForm);
        
        // Converte FormData para um objeto JSON.
        // Isto é PERFEITO para a nossa API, pois todos os 'name'
        // do formulário batem com as chaves que a API espera.
        const clientData = Object.fromEntries(formData.entries());

        let apiUrl = `${API_BASE_URL}/clientes`;
        let httpMethod = 'POST';

        if (editingClientId) {
            // ATENÇÃO: A API de UPDATE (PUT/PATCH) não foi implementada
            // no ClienteController. Ela precisará ser criada no Laravel.
            alert('A função de ATUALIZAR (PUT) ainda precisa ser criada no ClienteController.php');
            saveButton.disabled = false;
            saveButton.textContent = originalButtonText;
            return; // Interrompe a função por enquanto

            // Quando for implementar, será assim:
            // apiUrl = `${API_BASE_URL}/clientes/${editingClientId}`;
            // httpMethod = 'PUT'; // ou 'PATCH'
        }

        try {
            const response = await fetch(apiUrl, {
                method: httpMethod,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(clientData),
            });

            const result = await response.json();

            if (!response.ok) {
                // Tenta pegar a mensagem de erro da Transação (do 'catch' do Laravel)
                let errorMessage = result.message || 'Ocorreu um erro desconhecido.';
                if (result.error) {
                    // Erro da transação (ex: "CPF é obrigatório")
                    errorMessage = result.error.message || result.error;
                }
                
                // Erros de validação do Laravel (StoreClienteRequest)
                if(result.errors) {
                    errorMessage = 'Por favor, corrija os erros:\n'; 
                    for (const field in result.errors) {
                        errorMessage += `- ${result.errors[field].join(', ')}\n`;
                    }
                }
                throw new Error(errorMessage);
            }

            const successMessage = editingClientId ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!';
            showSuccessModal(successMessage);
            
            closeModal();

        } catch (error) {
            console.error('Falha ao salvar cliente: ', error);
            alert(`Erro: ${error.message}`);
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = originalButtonText; 
            if (httpMethod === 'PUT') {
                editingClientId = null;
            }
        }
    };

    // Botão "Novo Cliente"
    newClientBtn.addEventListener('click', openNewClientModal);

    // Botões de fechar o modal
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Submit do formulário
    clientForm.addEventListener('submit', handleFormSubmit);

    // Lógica de mostrar/esconder PF/PJ
    tipoPessoaSelect.addEventListener('change', togglePessoaFields);

    // Buscar CEP
    cepInput.addEventListener('blur', (event) => {
        fetchAddressByCep(event.target.value);
    });

    // Buscar CNPJ (só adiciona o listener se o campo existir)
    if (cnpjInput) {
        cnpjInput.addEventListener('blur', (event) => {
            fetchCnpjData(event.target.value);
        });
    }

    // Buscar CPF (só adiciona o listener se o campo existir)
    if (cpfInput) {
        cpfInput.addEventListener('blur', (event) => {
            // fetchCpfData(event.target.value); // Descomente se quiser usar a API de CPF
        });
    }

    // Fechar modal ao clicar fora
    clientModal.addEventListener('click', (event) => {
        if (event.target === clientModal) {
            closeModal();
        }
    });

    // Confirmação de exclusão
    cancelDeleteBtn.addEventListener('click', closeConfirmationModal);
    confirmeDeleteBtn.addEventListener('click', deleteClient);

    confirmationModal.querySelector('.close-modal').addEventListener('click', closeConfirmationModal);
    
    // Delegação de eventos para os botões na tabela (Editar e Excluir)
    tableBody.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('.btn-delete');
        if (deleteButton) {
            const id = deleteButton.dataset.id;
            openConfirmationModal(id);
        }

        const editButton = event.target.closest('.btn-edit');
        if (editButton) {
            const id = editButton.dataset.id;
            openEditModal(id);
        }
    });
})