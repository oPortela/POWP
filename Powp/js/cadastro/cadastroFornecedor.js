document.addEventListener('DOMContentLoaded', () => {

    const newSupplierBtn = document.getElementById('new-supplier-btn');
    const supplierModal = document.getElementById('supplier-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal, #cancel-btn');
    const supplierForm = document.getElementById('supplier-form');
    const cepInput = document.getElementById('endereco-cep');
    const saveButton = document.getElementById('save-btn');
    const modalTitle = document.getElementById('modal-title');
    
    const openNewSupplierModal = () => {
        supplierForm.reset();
        modalTitle.textContent = 'Novo Fornecedor:';
        saveButton.disable = false;
        saveButton.textContent = 'Salvar';
        supplierModal.style.display = 'block'
    }

    const closeModal = () => {
        supplierModal.style.display = 'none';
    };


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

})