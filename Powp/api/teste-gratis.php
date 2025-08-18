<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/conexao/connection.php';
require_once __DIR__ . '/demo-manager.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }

    // Receber dados JSON
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Dados inválidos');
    }

    // Validar campos obrigatórios
    $required_fields = ['nomeEmpresa', 'nomeResponsavel', 'email', 'telefone'];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            throw new Exception("Campo obrigatório: $field");
        }
    }

    // Validar email
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('E-mail inválido');
    }

    // Verificar se email já existe
    $stmt = $conn->prepare("SELECT id FROM teste_gratis WHERE email = ?");
    $stmt->bind_param("s", $input['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        throw new Exception('E-mail já cadastrado para teste grátis');
    }

    // Criar conta demo usando o gerenciador
    $result = createDemoAccount($input);
    
    if (!$result['success']) {
        throw new Exception($result['message']);
    }

    // Enviar email de boas-vindas
    sendWelcomeEmail(
        $input['email'], 
        $input['nomeResponsavel'], 
        $result['credentials']['usuario'], 
        $result['credentials']['senha']
    );

    // Resposta de sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Teste grátis ativado com sucesso!',
        'credentials' => $result['credentials']
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

function generatePassword($length = 8) {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    $password = '';
    for ($i = 0; $i < $length; $i++) {
        $password .= $chars[rand(0, strlen($chars) - 1)];
    }
    return $password;
}

function sendWelcomeEmail($email, $nome, $usuario, $senha) {
    // Implementar envio de email
    // Pode usar PHPMailer, SendGrid, etc.
    
    $subject = "Bem-vindo ao ERP Modal - Suas credenciais de teste";
    $message = "
    <html>
    <body>
        <h2>Bem-vindo ao ERP Modal!</h2>
        <p>Olá $nome,</p>
        <p>Seu teste grátis foi ativado com sucesso! Aqui estão suas credenciais:</p>
        
        <div style='background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;'>
            <p><strong>Usuário:</strong> $usuario</p>
            <p><strong>Senha:</strong> $senha</p>
            <p><strong>Link de acesso:</strong> <a href='http://localhost/Powp/login.html'>Acessar Sistema</a></p>
        </div>
        
        <p>Seu teste é válido por 30 dias e inclui:</p>
        <ul>
            <li>Acesso completo ao sistema</li>
            <li>Dados de exemplo para testes</li>
            <li>Suporte por WhatsApp</li>
            <li>Sem compromisso</li>
        </ul>
        
        <p>Dúvidas? Entre em contato: (62) 9999-9999</p>
        
        <p>Equipe ERP Modal</p>
    </body>
    </html>
    ";
    
    // Implementar envio real do email aqui
    // mail($email, $subject, $message, $headers);
    
    return true;
}
?>