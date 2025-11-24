from django.shortcuts import render
import requests
from django.conf import settings

def lista_productos(request):
    token = request.session.get('token')
    headers = {'Authorization': f'Bearer {token}'}
    # Obtener filtros del formulario
    search = request.GET.get('search', '')
    categoria_id = request.GET.get('categoria_id', '')
    sucursal_id = request.GET.get('sucursal_id', '')
    # Construir parámetros para la solicitud al backend
    params = {}
    if search:
        params['search'] = search
    if categoria_id:
        params['categoria_id'] = categoria_id
    if sucursal_id:
        params['sucursal_id'] = sucursal_id
    # Solicitud al backend con filtros
    response = requests.get(f"{settings.BACKEND_URL}/productos", headers=headers, params=params)
    productos = response.json() if response.status_code == 200 else []
    # Obtener categorías y sucursales para los filtros
    categorias = requests.get(f"{settings.BACKEND_URL}/categorias", headers=headers).json()
    sucursales = requests.get(f"{settings.BACKEND_URL}/sucursales", headers=headers).json()
    return render(request, 'core/productos_list.html', {
        'productos': productos,
        'categorias': categorias,
        'sucursales': sucursales,
        'search': search,
        'categoria_id': categoria_id,
        'sucursal_id': sucursal_id,
    })