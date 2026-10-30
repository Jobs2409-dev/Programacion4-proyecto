# backend_python/reclamos/services.py
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Reclamo, Estado, RegistroHistorial, Usuario, Rol
from .repositories import ReclamoRepository, EstadoRepository, SecurityLogRepository
from .serializers import UsuarioSerializer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

# ==============================================================================
# CLASE 3, 7 & 8: Capa de Servicios, Transacciones Atómicas y Auditoría
# Concepto: Lógica de negocio pura aislada de las vistas. Uso de transaction.atomic()
# para garantizar consistencia ACID al modificar el estado de un reclamo e historial.
# ==============================================================================

class ReclamoService:

    @staticmethod
    def crear_reclamo(usuario, titulo: str, descripcion: str, categoria_id: int, ip_address: str = None) -> Reclamo:
        """
        Crea un nuevo reclamo asignándole el estado inicial 'Pendiente' y notifica por WebSocket.
        """
        estado_inicial = EstadoRepository.get_by_nombre('Pendiente')
        if not estado_inicial:
            raise ValidationError("El estado inicial 'Pendiente' no existe en la base de datos.")

        with transaction.atomic():
            reclamo = Reclamo.objects.create(
                usuario=usuario,
                titulo=titulo,
                descripcion=descripcion,
                categoria_id=categoria_id,
                estado_actual=estado_inicial
            )
            
            # Historial de creación
            RegistroHistorial.objects.create(
                reclamo=reclamo,
                estado=estado_inicial,
                observacion="Reclamo ingresado en el sistema.",
                usuario_operador=None
            )

            # Auditoría OWASP (Clase 8)
            SecurityLogRepository.log_event(
                user=usuario,
                action="RECLAMO_CREADO",
                detail=f"Reclamo #{reclamo.id} creado.",
                ip_address=ip_address
            )

        ReclamoService._notificar_reclamo(reclamo, "NUEVO_RECLAMO")

        return reclamo

    @staticmethod
    def _notificar_reclamo(reclamo: Reclamo, evento: str) -> None:
        channel_layer = get_channel_layer()
        if channel_layer:
            payload = {
                "evento": evento,
                "id": reclamo.id,
                "titulo": reclamo.titulo,
                "categoria_id": reclamo.categoria_id,
                "estado": reclamo.estado_actual.nombre,
                "fecha_creacion": str(reclamo.fecha_creacion)
            }
            for group_name in ("reclamos_publicos", f"categoria_{reclamo.categoria_id}"):
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        "type": "reclamo_notification",
                        "payload": payload
                    }
                )

    @staticmethod
    def cambiar_estado(reclamo_id: int, nuevo_estado_id: int, operador, observacion: str, ip_address: str = None) -> Reclamo:
        """
        Cambia el estado de un reclamo y registra la transición en el historial.
        """
        reclamo = ReclamoRepository.get_by_id_with_history(reclamo_id)
        if not reclamo:
            raise ValidationError("El reclamo especificado no existe.")

        nuevo_estado = Estado.objects.filter(id=nuevo_estado_id).first()
        if not nuevo_estado:
            raise ValidationError("El nuevo estado especificado no es válido.")

        if reclamo.estado_actual_id == nuevo_estado.id:
            raise ValidationError("El reclamo ya se encuentra en ese estado.")

        # Transacción ACID para asegurar consistencia
        with transaction.atomic():
            estado_anterior_nombre = reclamo.estado_actual.nombre
            reclamo.estado_actual = nuevo_estado
            reclamo.save()

            RegistroHistorial.objects.create(
                reclamo=reclamo,
                estado=nuevo_estado,
                observacion=observacion,
                usuario_operador=operador
            )

            SecurityLogRepository.log_event(
                user=operador,
                action="RECLAMO_CAMBIO_ESTADO",
                detail=f"Reclamo #{reclamo.id} pasó de {estado_anterior_nombre} a {nuevo_estado.nombre}.",
                ip_address=ip_address
            )

        ReclamoService._notificar_reclamo(reclamo, "CAMBIO_ESTADO")

        return reclamo




class AuthService:

    @staticmethod
    def autenticar_o_registrar_google(token_jwt_google: str, ip_address: str = None) -> dict:
        """
        CLASE 6 & 8: Valida el id_token de Google utilizando las credenciales del proyecto,
        registra al vecino si no existe y genera los tokens JWT (access y refresh) de VozVecinal.
        """
        try:
            # Validacion del token contra el GOOGLE_CLIENT_ID registrado
            id_info = google_id_token.verify_oauth2_token(
                token_jwt_google, 
                google_requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )
        except Exception:
            raise ValidationError("El token de Google proporcionado no es válido o expiró.")

        email = id_info.get('email')
        first_name = id_info.get('given_name', '')
        last_name = id_info.get('family_name', '')
        
        if not email:
            raise ValidationError("La cuenta de Google no proporciona un correo electrónico válido.")

        with transaction.atomic():
            user = Usuario.objects.filter(email=email).first()
            
            if not user:
                base_username = email.split('@')[0]
                username = base_username
                contador = 1
                while Usuario.objects.filter(username=username).exists():
                    username = f"{base_username}{contador}"
                    contador += 1

                rol_vecino, _ = Rol.objects.get_or_create(nombre='VECINO')
                
                user = Usuario.objects.create(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    rol=rol_vecino
                )
                user.set_unusable_password()
                user.save()

                SecurityLogRepository.log_event(
                    user=user,
                    action="USUARIO_REGISTRADO_GOOGLE",
                    detail=f"Registro automático vía Google OAuth2 ({email}).",
                    ip_address=ip_address
                )

        refresh = RefreshToken.for_user(user)
        
        SecurityLogRepository.log_event(
            user=user,
            action="LOGIN_GOOGLE_EXITOSO",
            detail=f"Sesión iniciada vía Google OAuth2.",
            ip_address=ip_address
        )

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UsuarioSerializer(user).data
        }
        