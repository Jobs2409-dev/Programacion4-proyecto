# backend_python/VozVecinal/urls.py
from django.contrib import admin
from django.urls import path, include
from reclamos.views import SocialLoginJWTView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('reclamos.urls')),
    
    # Rutas oficiales de django-allauth (Clase 7)
    path('accounts/', include('allauth.urls')),
    path('api/auth/social/jwt/', SocialLoginJWTView.as_view(), name='social_jwt'),
]
