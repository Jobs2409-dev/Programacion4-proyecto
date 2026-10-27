# front-web/public/urls.py
from django.urls import path
from django.views.generic import TemplateView
from .views import index_view, login_vecino_view, nuevo_reclamo_view, mis_reclamos_view, registro_vecino_view

urlpatterns = [
    path('', index_view, name='public_index'),
    path('login/', login_vecino_view, name='public_login'),
    path('registro/', registro_vecino_view, name='public_registro'),
    path('nuevo-reclamo/', nuevo_reclamo_view, name='nuevo_reclamo'),
    path('mis-reclamos/', mis_reclamos_view, name='mis_reclamos'),
    # Ruta de callback para el login social con Google
    path('login/callback/', TemplateView.as_view(template_name='public/login_callback.html'), name='login_callback'),
    path('nuevo-reclamo/', TemplateView.as_view(template_name='public/nuevo_reclamo.html'), name='nuevo_reclamo'),
]