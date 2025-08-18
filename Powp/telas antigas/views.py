import json
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def alterar_senha(request):
    if request.method == 'POST':
        dados = json.loads(request.body)
        usuario = dados.get('usuario')
        senha_atual = dados.get('senha_atual')
        nova_senha = dados.get('nova_senha')

        user = authenticate(username=usuario, password=senha_atual)

        if user is not None:
            user.set_password(nova_senha)
            user.save()

            # Enviar email avisando da alteração
            send_mail(
                'Alteração de Senha',
                'Sua senha foi alterada com sucesso!',
                'noreply@seusite.com',
                [user.email],
                fail_silently=False,
            )

            return JsonResponse({'mensagem': 'Senha alterada com sucesso!'})
        else:
            return JsonResponse({'erro': 'Usuário ou senha atual incorretos.'}, status=400)

    return JsonResponse({'erro': 'Método não permitido'}, status=405)
