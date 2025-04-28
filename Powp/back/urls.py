from django.urls import path
from .views import alterar_senha

urlpatterns = [
    path('alterar-senha/', alterar_senha, name='alterar_senha'),
]
