document.addEventListener('DOMContentLoaded', () => {

    //Seleção de elementos do DOM
    const newSupplierBtn = document.getElementById('new-supplier-btn');
    const supplierModal = document.getElementById('supplier-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal, #cancel-btn');
    const supplierForm = document.getElementById('supplier-form');
    const cepInput = document.getElementById('endereco-cep');
    const saveButton = document.getElementById('save-btn');
    const modalTitle = document.getElementById('modal-title');
    
    //Limpa o formulário e abre o modal para um novo cadastro
    const openNewSupplierModal = () => {
        supplierForm.reset();
        modalTitle.textContent = 'Novo Fornecedor:';
        saveButton.disable = false;
        saveButton.textContent = 'Salvar';
        supplierModal.style.display = 'block'
    }

    //Fecha o Modal
    const closeModal = () => {
        supplierModal.style.display = 'none';
    };

    //Busca o endereço a partir de um CEP usando a API ViaCEP.
    const fetchAddressByCep = async (cep) => {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

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
            document.getElementById('endereco-uf').value = addressData.uf;

            document.getElementById('endereco-numero').focus();

        } catch (error) {
            console.error('Erro ao buscar CEP: ', error);
            alert(error.message);
        }
    }

    //Envia os dados do formulário para a API para criar um novo fornecedor.
    const handleFormSubmit= async (event) => {
        event.preventDefault();

        // Desabilita o botão para evitar cliques múltiplos
        saveButton.disable = true;
        saveButton.textContent = 'Salvando...';

        const formData = new FormData(supplierForm);
        const supplierData = Object.fromEntries(formData.entries());

        //URL da api
        const apiUrl = '/api/fornecedores';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(suppliersData),
            });

            const result = await response.json();

            // Se a resposta não for de sucesso (status 2xx)
            if (!response.ok) {
                // Monta uma mensagem de erro com as validações do Laravel
                let errorMessage = result.message || 'Ocorreu um erro desconhecido.';
                if(result.errors) {
                    errorMessage += '\n\nErrors:\n';
                    for (const field in result.errors) {
                        errorMessage += `- ${result.errors[field].join(', ')}\n`;
                    }
                }
                throw new Error(errorMessage);
            }

            alert('Fornecedor cadastrado com sucesso!');
            closeModal();
        } catch (error) {
            console.error('Falha ao cadastrar fornecedor: ', error);
            alert(`Erro: ${error.message}`);
        } finally {
            // Reabilita o botão, independentemente do resultado
            saveButton.disable = false;
            saveButton.textContent = 'Salvar';
        }
    };

    //Abrir o modal
    newSupplierBtn.addEventListener('click', openNewSupplierModal);

    closeModalBtns.forEach(btn)
})