from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from .models import AreaDependencia, Categoria, Estado, Reclamo, Rol


User = get_user_model()


class UsuarioViewSetTests(APITestCase):
    def setUp(self):
        self.admin_role = Rol.objects.create(nombre='ADMIN')
        self.operator_role = Rol.objects.create(nombre='OPERADOR')
        self.neighbor_role = Rol.objects.create(nombre='VECINO')
        self.admin = User.objects.create_user(
            username='admin',
            password='admin-password',
            rol=self.admin_role
        )
        self.operator = User.objects.create_user(
            username='operador',
            password='operator-password',
            rol=self.operator_role
        )
        self.neighbor = User.objects.create_user(
            username='vecino',
            password='neighbor-password',
            rol=self.neighbor_role
        )
        self.client.force_authenticate(user=self.admin)

    def test_admin_lists_users_of_every_role(self):
        response = self.client.get(reverse('usuario-list'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 3)
        self.assertEqual(
            {user['rol']['nombre'] for user in response.data['results']},
            {'ADMIN', 'OPERADOR', 'VECINO'}
        )

    def test_non_admin_cannot_list_users(self):
        self.client.force_authenticate(user=self.neighbor)

        response = self.client.get(reverse('usuario-list'))

        self.assertEqual(response.status_code, 403)

    def test_anonymous_user_cannot_list_users(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(reverse('usuario-list'))

        self.assertEqual(response.status_code, 401)

    def test_admin_creates_user_with_selected_role_and_hashed_password(self):
        response = self.client.post(reverse('usuario-list'), {
            'username': 'nuevo-vecino',
            'email': 'vecino@example.com',
            'password': 'password-segura',
            'rol_nombre': 'VECINO',
        })

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username='nuevo-vecino')
        self.assertEqual(user.rol, self.neighbor_role)
        self.assertTrue(user.check_password('password-segura'))

    def test_admin_updates_user_role_and_password(self):
        response = self.client.patch(
            reverse('usuario-detail', args=[self.operator.id]),
            {'rol_nombre': 'ADMIN', 'password': 'password-nueva'},
            format='json'
        )

        self.assertEqual(response.status_code, 200)
        self.operator.refresh_from_db()
        self.assertEqual(self.operator.rol, self.admin_role)
        self.assertTrue(self.operator.check_password('password-nueva'))

    def test_admin_deletes_user(self):
        response = self.client.delete(
            reverse('usuario-detail', args=[self.neighbor.id])
        )

        self.assertEqual(response.status_code, 204)
        self.assertFalse(User.objects.filter(pk=self.neighbor.id).exists())

    def test_admin_cannot_delete_user_with_claims(self):
        area = AreaDependencia.objects.create(nombre='Obras')
        categoria = Categoria.objects.create(nombre='Bacheo', area=area)
        estado = Estado.objects.create(nombre='Pendiente')
        reclamo = Reclamo.objects.create(
            titulo='Bache en la calle',
            descripcion='Hay un bache frente a mi casa.',
            usuario=self.neighbor,
            categoria=categoria,
            estado_actual=estado
        )

        response = self.client.delete(
            reverse('usuario-detail', args=[self.neighbor.id])
        )

        self.assertEqual(response.status_code, 400)
        self.assertTrue(User.objects.filter(pk=self.neighbor.id).exists())
        self.assertTrue(Reclamo.objects.filter(pk=reclamo.id).exists())

    def test_admin_cannot_delete_the_current_user(self):
        response = self.client.delete(
            reverse('usuario-detail', args=[self.admin.id])
        )

        self.assertEqual(response.status_code, 400)
        self.assertTrue(User.objects.filter(pk=self.admin.id).exists())
