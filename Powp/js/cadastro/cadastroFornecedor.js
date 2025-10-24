document.addEventListener('DOMContentLoaded', () => {

    //  Seleção de elementos 
    const newSupplierBtn = document.getElementById('new-supplier-btn');
    const supplierModal = document.getElementById('supplier-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal, #cancel-btn');
    const supplierForm = document.getElementById('supplier-form');
    const cepInput = document.getElementById('endereco-cep');
    const saveButton = document.getElementById('save-btn');
    const modalTitle = document.getElementById('modal-title');
    
    //  Funções 

    //Limpa o formulário e abre o modal para um novo cadastro
    const openNewSupplierModal = () => {
        supplierForm.reset();
        modalTitle.textContent = 'Novo Fornecedor';
        saveButton.disabled = false; 
        saveButton.textContent = 'Salvar';
        supplierModal.classList.add('show');
    };

    //Fecha o Modal
    const closeModal = () => {
        supplierModal.classList.remove('show');
    };

    //Busca o endereço a partir de um CEP usando a API ViaCEP.
    const fetchAddressByCep = async (cep) => {
        const cleanCep = cep.replace(/\D/g, '');

        if (cleanCep.length !== 8) {
            return; 
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);

            if (!response.ok) {
                throw new Error('Não foi possivel consultar o CEP.');
            }
            const addressData = await response.json();

            if (addressData.erro) {
                alert('CEP não localizado. Por favor, preencha o endereço manualmente.');
                return;
            }

            //Preenche os campos de endereço
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

    //Envia os dados do formulário para a API.
    const handleFormSubmit = async (event) => {
        event.preventDefault();

        saveButton.disabled = true;
        saveButton.textContent = 'Salvando...';

        const formData = new FormData(supplierForm);
        const supplierData = Object.fromEntries(formData.entries());

        const apiUrl = 'http://127.0.0.1:8000/api/fornecedores';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(supplierData),
            });

            const result = await response.json();

            if (!response.ok) {
                let errorMessage = result.message || 'Ocorreu um erro desconhecido.';
                if(result.errors) {
                    errorMessage += '\n\nErros:\n';
                    for (const field in result.errors) {
                        errorMessage += `- ${result.errors[field].join(', ')}\n`;
                    }
                }
                throw new Error(errorMessage);
            }

            alert('Fornecedor cadastrado com sucesso!');
            closeModal();
            // (Talvez aqui você queira recarregar sua tabela de fornecedores)
            // ex: loadSuppliers();
        } catch (error) {
            console.error('Falha ao cadastrar fornecedor: ', error);
            alert(`Erro: ${error.message}`);
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Salvar';
        }
    };

    //  Adicionando Event Listeners 

    //Abrir o modal
    newSupplierBtn.addEventListener('click', openNewSupplierModal);

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Salvar o formulário
    supplierForm.addEventListener('submit', handleFormSubmit);

    cepInput.addEventListener('blur', (event) => {
        fetchAddressByCep(event.target.value);
    });

    const cnpjInput = document.getElementById('cnpj');

    cnpjInput.addEventListener('blur', (event) => {
        fetchCnpjData(event.target.value);
    });

    supplierModal.addEventListener('click', (event) => {
        if (event.target === supplierModal) {
            closeModal();
        }
    });

});