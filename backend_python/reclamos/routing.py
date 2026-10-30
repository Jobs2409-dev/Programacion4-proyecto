# backend_python/reclamos/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(
        r"ws/reclamos/publicos/$",
        consumers.ReclamoNotificationConsumer.as_asgi()
    ),
    re_path(
        r"ws/reclamos/(?P<categoria_id>\d+)/$", 
        consumers.ReclamoNotificationConsumer.as_asgi()
    ),
]