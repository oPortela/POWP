CREATE TABLE pwcontatos (
	codcontato INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(50) NOT NULL COMMENT 'Descrecer tipo Ex: e-mail, celular, telefone',
    valor VARCHAR(255) NOT NULL,
    
    codentidade INT NOT NULL,
    entidade_tipo VARCHAR(50) NOT NULL COMMENT 'Qual tabela será referenciada Ex: Cliente, Funcionario, Fornecedor'
);

COMMIT;