# front-web/web_app/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin-django/', admin.site.urls), # Admin propio de Django por si hiciera falta
    path('panel/', include('admin_panel.urls')), # Rutas del panel administrativo municipal (/panel/login, /panel/dashboard)
    path('', include('public.urls')),            # Rutas públicas del vecino (/ /reclamos)
]