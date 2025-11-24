from django.shortcuts import redirect
from django.urls import reverse
from django.contrib import messages

class RoleRequiredMiddleware:
    """
    Middleware para proteger rutas según el rol del usuario.
    Se debe configurar en settings.py.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):        # Permitir acceso a login, registro, home y estáticos sin autenticación
        allowed_paths = [
            reverse('core:login'), 
            reverse('core:register'), 
            reverse('core:home'),
            '/admin/', 
            '/static/'
        ]
        if any(request.path.startswith(path) for path in allowed_paths):
            return self.get_response(request)

        user = request.session.get('user')
        if not user:
            messages.error(request, 'Debes iniciar sesión para continuar.')
            return redirect('core:login')
        # Aquí podrías agregar lógica extra para proteger rutas por rol
        return self.get_response(request)
