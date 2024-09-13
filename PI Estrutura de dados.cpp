#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <locale.h>

// Estrutura para armazenar os dados dos produtos
typedef struct {
    int codigo;
    char nome[100];
    float preco;
    int estoque;
    char embalagem[50];
    int fornecedor;
    int codauxiliar;
} Produto;

// Ponteiro para o array din�mico de produtos
Produto **produtos = NULL;
int count = 0;
int capacidade = 0;

// Fun��o para redimensionar o array de produtos se necess�rio
void redimensionar_produtos() {
    if (count == capacidade) {
        capacidade = (capacidade == 0) ? 2 : capacidade * 2;  // Inicializa com 2 e duplica conforme necess�rio
        produtos = (Produto **)realloc(produtos, capacidade * sizeof(Produto *));
        if (produtos == NULL) {
            printf("Erro ao alocar mem�ria!\n");
            exit(1);  // Encerra o programa em caso de falha
        }
    }
}

// Fun��o para encontrar o �ndice de um produto pelo c�digo
int encontrar_produto(int codigo) {
    for (int i = 0; i < count; i++) {
        if (produtos[i]->codigo == codigo) {
            return i;
        }
    }
    return -1;
}

// Fun��o para cadastrar produtos
void cadastrar_produto(int codigo, char *nome, float preco, int estoque, char *embalagem, int fornecedor, int codauxiliar) {
    if (encontrar_produto(codigo) == -1) {
        redimensionar_produtos();
        Produto *novo = (Produto *)malloc(sizeof(Produto));
        novo->codigo = codigo;
        strcpy(novo->nome, nome);
        novo->preco = preco;
        novo->estoque = estoque;
        strcpy(novo->embalagem, embalagem);
        novo->fornecedor = fornecedor;
        novo->codauxiliar = codauxiliar;

        produtos[count++] = novo;
        printf("Produto cadastrado com sucesso!\n");
    } else {
        printf("Produto com c�digo j� existente!\n");
    }
}

// Fun��o para excluir produtos
void excluir_produto(int codigo) {
    int index = encontrar_produto(codigo);
    if (index != -1) {
        free(produtos[index]);
        for (int i = index; i < count - 1; i++) {
            produtos[i] = produtos[i + 1];
        }
        count--;
        printf("Produto exclu�do com sucesso!\n");
    } else {
        printf("Produto n�o encontrado!\n");
    }
}

// Fun��o para editar produtos
void editar_produto(int codigo, char *nome, float preco, int estoque, char *embalagem, int fornecedor, int codauxiliar) {
    int index = encontrar_produto(codigo);
    if (index != -1) {
        Produto *produto = produtos[index];
        if (nome != NULL) strcpy(produto->nome, nome);
        produto->preco = preco;
        produto->estoque = estoque;
        if (embalagem != NULL) strcpy(produto->embalagem, embalagem);
        produto->fornecedor = fornecedor;
        produto->codauxiliar = codauxiliar;
        printf("Produto editado com sucesso!\n");
    } else {
        printf("Produto n�o encontrado!\n");
    }
}

// Fun��o para pesquisar produtos
void pesquisar_produto(int codigo) {
    int index = encontrar_produto(codigo);
    if (index != -1) {
        Produto *produto = produtos[index];
        printf("C�digo: %d\n", produto->codigo);
        printf("Nome: %s\n", produto->nome);
        printf("Pre�o: R$%.2f\n", produto->preco);
        printf("Estoque: %d\n", produto->estoque);
        printf("Embalagem: %s\n", produto->embalagem);
        printf("Fornecedor: %d\n", produto->fornecedor);
        printf("Cod Barras: %d\n", produto->codauxiliar);
    } else {
        printf("Produto n�o encontrado!\n");
    }
}

// Fun��o Principal
int main() {
    setlocale(LC_ALL, "portuguese");
    int op;
    while (1) {
        printf("\n1 - Inserir Produtos\n");
        printf("2 - Pesquisar Produtos\n");
        printf("3 - Editar Produtos\n");
        printf("4 - Excluir Produtos\n");
        printf("Escolha uma das op��es acima: ");
        scanf("%d", &op);

        switch (op) {
            case 1: {
                int codigo, estoque, fornecedor, codauxiliar;
                char nome[100], embalagem[50];
                float preco;

                printf("C�digo: ");
                scanf("%d", &codigo);
                printf("Descri��o: ");
                scanf(" %[^\n]", nome);
                printf("QT. Estoque: ");
                scanf("%d", &estoque);
                printf("Embalagem: ");
                scanf(" %[^\n]", embalagem);
                printf("Cod. Fornecedor: ");
                scanf("%d", &fornecedor);
                printf("Cod. Barras: ");
                scanf("%d", &codauxiliar);
                printf("Pre�o: ");
                scanf("%f", &preco);

                cadastrar_produto(codigo, nome, preco, estoque, embalagem, fornecedor, codauxiliar);
                break;
            }
            case 2: {
                int codigo;
                printf("Qual produto deseja pesquisar: ");
                scanf("%d", &codigo);
                pesquisar_produto(codigo);
                break;
            }
            case 3: {
                int codigo, estoque, fornecedor, codauxiliar;
                char nome[100], embalagem[50];
                float preco;

                printf("Qual produto deseja alterar: ");
                scanf("%d", &codigo);
                printf("Descri��o: ");
                scanf(" %[^\n]", nome);
                printf("Pre�o: ");
                scanf("%f", &preco);
                printf("Estoque: ");
                scanf("%d", &estoque);
                printf("Embalagem: ");
                scanf(" %[^\n]", embalagem);
                printf("Fornecedor: ");
                scanf("%d", &fornecedor);
                printf("Cod. Barras: ");
                scanf("%d", &codauxiliar);

                editar_produto(codigo, nome, preco, estoque, embalagem, fornecedor, codauxiliar);
                break;
            }
            case 4: {
                int codigo;
                char confirm;

                printf("Qual produto deseja excluir: ");
                scanf("%d", &codigo);
                printf("Deseja mesmo excluir o produto %d? (S para sim, N para n�o): ", codigo);
                scanf(" %c", &confirm);

                if (confirm == 'S' || confirm == 's') {
                    excluir_produto(codigo);
                } else {
                    printf("Opera��o abortada\n");
                }
                break;
            }
            default:
                printf("ERRO! Op��o inv�lida.\n");
        }

        char continuar;
        printf("Deseja continuar? (s/n): ");
        scanf(" %c", &continuar);
        if (continuar != 's' && continuar != 'S') {
            break;
        }
    }

    // Liberar mem�ria alocada
    for (int i = 0; i < count; i++) {
        free(produtos[i]);
    }
    free(produtos);

    return 0;
}
