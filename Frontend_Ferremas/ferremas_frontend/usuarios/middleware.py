from django.http import HttpResponseForbidden

class RolMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.user.is_authenticated:
            return redirect('login')
        
        # Ejemplo: Solo Administrador puede acceder a /admin/
        if request.path.startswith('/admin/') and request.user.rol != 'Administrador':
            return HttpResponseForbidden()
        
        return self.get_response(request)