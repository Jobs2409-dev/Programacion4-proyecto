# front-web/admin_panel/views.py
from django.shortcuts import render

def login_view(request):
    """Renderiza la vista del Login Administrativo."""
    return render(request, 'admin_panel/login.html')

def dashboard_view(request):
    """Renderiza el Panel Principal de Administración."""
    return render(request, 'admin_panel/dashboard.html')