# backend_python/reclamos/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ReclamoNotificationConsumer(AsyncWebsocketConsumer):
    """
    CLASE 9: Consumer asincrónico para notificaciones de reclamos en tiempo real.
    Las conexiones pueden escuchar una categoría o todos los reclamos públicos.
    """
    async def connect(self):
        categoria_id = self.scope["url_route"]["kwargs"].get("categoria_id")
        self.group_name = f"categoria_{categoria_id}" if categoria_id else "reclamos_publicos"

        # Se une al grupo del channel layer
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Abandona el grupo al desconectarse
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        # Maneja mensajes enviados desde el cliente (Modo Echo para pruebas)
        data = json.loads(text_data)
        await self.send(text_data=json.dumps({"echo": data}))

    async def reclamo_notification(self, event):
        # Método encargado de retransmitir eventos a los clientes del grupo (Clase 10)
        await self.send(text_data=json.dumps(event["payload"]))