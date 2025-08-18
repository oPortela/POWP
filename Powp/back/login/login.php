<?php
// Habilita a exibição de erros para depuração
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configurações de CORS
header('Content-Type: application/json');
header('Access-Control-Allow-origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Verifica se a requisição é do tipo OPTIONS e encerra a execução
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    exit(0);
}

// Inicia a sessão se ainda não estiver iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Conecta ao banco de dados
try {
    require_once __DIR__ . '/../conexao/connection.php';
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro de conexão com o banco de dados: ' . $e->getMessage()]);
    exit;
}

// Verifica se a ação foi definida na requisição
$action = $_GET['action'] ?? $_POST['action'] ?? 'login';

// Função para lidar com o login
try {
    switch ($action) {
        case 'login':
            handleLogin();
            break;
        
        case 'get_user_data':
            handleGetUserData();
            break;

        case 'update_profile': 
            handleUpdateProfile();
            break;

        case 'change_password':
            handleChangePassword();
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Ação não especificada ou inválida']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro interno do servidor: ' . $e->getMessage()]);
}

function handleLogin() {
    global $conn;

    // Verifica se os dados foram enviados via POST
    $usuario = $_POST['usuario'] ?? null;
    $senha = $_POST['senha'] ?? null;

    // Verifica se os dados estão completos
    if (!$usuario || !$senha) {
        echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
        return;
    }

    // busca o usuário no banco de dados
    $stmt = $conn->prepare("SELECT codusur, nome, usuario, senha, funcao FROM usuarios WHERE usuario = ?");
    $stmt->bind_param("s", $usuario);
    $stmt->execute();
    $result = $stmt->get_result();

    // Verifica se o usuário foi encontrado
    if ($result && $result->num_rows > 0) {
        $user_data = $result->fetch_assoc();

        // Verifica se a senha está correta (suporta tanto hash quanto texto plano)
        $senhaCorreta = false;
        
        // Primeiro tenta verificar se é um hash
        if (password_verify($senha, $user_data['senha'])) {
            $senhaCorreta = true;
        } 
        // Se não for hash, compara diretamente (para senhas em texto plano)
        else if ($senha === $user_data['senha']) {
            $senhaCorreta = true;
        }

        if ($senhaCorreta) {
            // Atualiza o último login
            $updateStmt = $conn->prepare("UPDATE usuarios SET ultimo_login = NOW() WHERE codusur = ?");
            $updateStmt->bind_param("i", $user_data['codusur']);
            $updateStmt->execute();

            $_SESSION['codusur'] = $user_data['codusur'];
            $_SESSION['usuario'] = $user_data['usuario'];
            $_SESSION['nome'] = $user_data['nome'];
            $_SESSION['funcao'] = $user_data['funcao'];

            //Retorna o JSON de resposta
            echo json_encode([
                'success' => true,
                'message' => 'Login bem-sucedido',
                'user' => [
                    'id' => $user_data['codusur'],
                    'usuario' => $user_data['usuario'],
                    'nome' => $user_data['nome'],
                    'funcao' => $user_data['funcao']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Usuário ou senha inválidos']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuário ou senha inválidos']);
    }
}

?>