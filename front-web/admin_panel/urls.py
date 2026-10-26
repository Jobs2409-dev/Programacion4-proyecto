# front-web/admin_panel/urls.py
from django.urls import path
from .views import login_view, dashboard_view

urlpatterns = [
    path('login/', login_view, name='admin_login'),
    path('dashboard/', dashboard_view, name='admin_dashboard'),
]