from django.db import models
from django.contrib.auth.models import AbstractUser

class Usuario(AbstractUser):
    ROLES = [
        ('Administrador', 'Administrador'),
        ('Vendedor', 'Vendedor'),
        ('Bodeguero', 'Bodeguero'),
        ('Contador', 'Contador'),
        ('Cliente', 'Cliente'),
    ]
    rol = models.CharField(max_length=15, choices=ROLES, default='Cliente')
    sucursal_id = models.IntegerField(null=True, blank=True)