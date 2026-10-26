# front-web/public/views.py
from django.shortcuts import render

def index_view(request):
    """Página principal del vecino (listado público de reclamos)."""
    return render(request, 'public/index.html')

def login_vecino_view(request):
    """Pantalla de Login / Registro para vecinos con Google OAuth2."""
    return render(request, 'public/login_vecino.html')

def nuevo_reclamo_view(request):
    """Formulario para crear un nuevo reclamo."""
    return render(request, 'public/nuevo_reclamo.html')

def mis_reclamos_view(request):
    """Panel personal del vecino para seguir sus reclamos."""
    return render(request, 'public/mis_reclamos.html')

def registro_vecino_view(request):
    """Pantalla de registro público de vecinos."""
    return render(request, 'public/registro_vecino.html')