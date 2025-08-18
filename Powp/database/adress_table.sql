CREATE TABLE pwendereco (
	codendereco INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    logradouro VARCHAR(255) NOT NULL, 
    numero VARCHAR(20),
    bairro VARCHAR(100),
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    tipo_endereco VARCHAR(50) NOT NULL COMMENT 'Tipo de endereço Ex: Residencial, Comercial, Entrega',
    
	codentidade INT NOT NULL,
    entidade_tipo VARCHAR(50) NOT NULL COMMENT 'Qual tabela será referenciada Ex: Cliente, Funcionario, Fornecedor'
);

COMMIT;