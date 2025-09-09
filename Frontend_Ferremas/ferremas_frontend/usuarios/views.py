from django.shortcuts import render, redirect
import requests
from django.conf import settings

def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        # Consumir API del backend Node.js para autenticar
        response = requests.post(
            f"{settings.BACKEND_URL}/auth/login",
            json={'email': email, 'password': password}
        )
        if response.status_code == 200:
            # Guardar token en sesión
            request.session['token'] = response.json().get('token')
            return redirect('inicio')
        else:
            return render(request, 'usuarios/login.html', {'error': 'Credenciales inválidas'})
    return render(request, 'usuarios/login.html')