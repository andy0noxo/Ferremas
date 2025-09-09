from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.conf import settings
from .api import api_request
from django.contrib import messages
from .forms import ProductoForm, UsuarioForm
from .forms_stock import StockUpdateForm

from datetime import datetime

import logging

logger = logging.getLogger(__name__)

def home_view(request):
    """
    Vista principal que muestra la página de inicio.
    """
    user = request.session.get('user')
    if user:
        return redirect('core:dashboard')
        
    # Si no está autenticado, mostrar página de inicio
    return render(request, 'core/home.html', {
        'hide_user_info': False,  # Mostrar enlaces de login/registro
        'year': 2025  # Año para el footer
    })

def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        try:
            response = api_request('post', '/api/auth/login', request, json={
                'email': email,
                'contrasena': password
            })
            if response and response.status_code == 200:
                data = response.json()
                request.session['token'] = data['token']
                request.session['user'] = {
                    'id': data['id'],
                    'nombre': data['nombre'],
                    'email': data['email'],
                    'rol': data['rol'],
                    'sucursal': data.get('sucursal')
                }
                return redirect('core:dashboard')
            else:
                # Mostrar mensaje real del backend si existe
                try:
                    error_msg = response.json().get('message', 'Credenciales inválidas')
                except Exception:
                    error_msg = 'Error de conexión con el backend'
                messages.error(request, error_msg)
        except Exception as e:
            messages.error(request, f'Error de conexión con el backend: {str(e)}')
    return render(request, 'core/login.html')

    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        try:
            response = api_request('post', '/api/auth/login', request, json={
                'email': email,
                'contrasena': password
            })
            if response and response.status_code == 200:
                data = response.json()
                request.session['token'] = data['token']
                request.session['user'] = {
                    'id': data['id'],
                    'nombre': data['nombre'],
                    'email': data['email'],
                    'rol': data['rol'],
                    'sucursal': data.get('sucursal')
                }
                return redirect('core:dashboard')
            else:
                msg = response.json().get('message', 'Credenciales inválidas') if response else 'Error de conexión con el backend'
                messages.error(request, msg)
        except Exception:
            messages.error(request, 'Error de conexión con el backend')
    return render(request, 'core/login.html')

def register_view(request):
    """
    Vista de registro que maneja la creación de nuevos usuarios.
    Solo administradores pueden registrar nuevos usuarios.
    """
    # Check if user is logged in and is an admin
    user = request.session.get('user')
    if not user:
        messages.error(request, 'Debe iniciar sesión como administrador para registrar usuarios.')
        return redirect('core:login')
        
    if user.get('rol') != 'Administrador':
        messages.error(request, 'Solo los administradores pueden registrar nuevos usuarios.')
        return redirect('core:dashboard')

    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        email = request.POST.get('email')
        password = request.POST.get('password')
        rut = request.POST.get('rut')
        rol = request.POST.get('rol')
        
        if not all([nombre, email, password, rut, rol]):
            messages.error(request, 'Todos los campos son requeridos.')
            return render(request, 'core/register.html', {
                'hide_user_info': False,
                'form_data': request.POST
            })
        
        try:
            payload = {
                'nombre': nombre,
                'email': email,
                'contrasena': password,
                'rut': rut,
                'rol': rol
            }
            response = api_request('post', '/api/auth/registro', request, json=payload)
            
            if not response:
                messages.error(request, 'Error de conexión con el servidor. Por favor, intente más tarde.')
            elif response.status_code == 400:
                error_msg = response.json().get('message', 'Error en los datos enviados')
                messages.error(request, error_msg)
            elif response.status_code in [200, 201]:
                messages.success(request, 'Usuario registrado exitosamente.')
                return redirect('core:usuarios_list')
            else:
                messages.error(request, 'Error en el registro. Por favor, intente más tarde.')
        except Exception as e:
            logger.error(f"Error en el registro: {str(e)}")
            messages.error(request, 'Error inesperado. Por favor, intente más tarde.')
    
    return render(request, 'core/register.html', {
        'hide_user_info': False,
        'form_data': request.POST if request.method == 'POST' else None
    })

def logout_view(request):
    request.session.flush()
    return redirect('core:login')

def dashboard_view(request):
    user = request.session.get('user')
    if not user:
        return redirect('core:login')
    rol = user.get('rol')
    # Renderizar dashboard según rol
    if rol == 'Administrador':
        return render(request, 'core/dashboard_admin.html', {'user': user})
    elif rol == 'Vendedor':
        return render(request, 'core/dashboard_vendedor.html', {'user': user})
    elif rol == 'Bodeguero':
        return render(request, 'core/dashboard_bodeguero.html', {'user': user})
    elif rol == 'Contador':
        return render(request, 'core/dashboard_contador.html', {'user': user})
    else:
        return render(request, 'core/dashboard_cliente.html', {'user': user})

def productos_list(request):
    user = request.session.get('user')
    if not user:
        return redirect('core:login')
    # Manejo del carrito en sesión
    carrito = request.session.get('carrito', {})
    if request.method == 'POST':
        if user.get('rol') == 'Administrador':
            messages.error(request, 'No autorizado para agregar productos al pedido.')
            return redirect('core:productos_list')
        producto_id = str(request.POST.get('producto_id'))
        cantidad = int(request.POST.get('cantidad', 1))
        if producto_id:
            if producto_id in carrito:
                carrito[producto_id] += cantidad
            else:
                carrito[producto_id] = cantidad
            request.session['carrito'] = carrito
            messages.success(request, 'Producto agregado al pedido.')
        return redirect('core:productos_list')
    response = api_request('get', '/api/productos', request)
    productos = response.json() if response and response.status_code == 200 else []
    pedido_count = sum(carrito.values()) if carrito else 0
    return render(request, 'core/productos_list.html', {
        'productos': productos,
        'user': user,
        'carrito': carrito,
        'pedido_count': pedido_count
    })

def producto_detalle(request, producto_id):
    user = request.session.get('user')
    if not user:
        return redirect('core:login')
    response = api_request('get', f'/api/productos/{producto_id}', request)
    producto = response.json() if response and response.status_code == 200 else None
    if not producto:
        messages.error(request, 'Producto no encontrado.')
        return redirect('core:productos_list')
    return render(request, 'core/producto_detalle.html', {'producto': producto, 'user': user})

def producto_crear(request):
    user = request.session.get('user')
    if not user or user.get('rol') not in ['Administrador', 'Bodeguero']:
        messages.error(request, 'No autorizado.')
        return redirect('core:productos_list')
    if request.method == 'POST':
        form = ProductoForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            # Convert Decimal fields to float for JSON serialization
            if 'precio' in data:
                data['precio'] = float(data['precio'])
            response = api_request('post', '/api/productos', request, json=data)
            if response and response.status_code == 201:
                messages.success(request, 'Producto creado exitosamente.')
                return redirect('core:productos_list')
            else:
                msg = response.json().get('message', 'Error al crear producto') if response else 'Error de conexión con el backend'
                messages.error(request, msg)
        else:
            messages.error(request, 'Corrija los errores en el formulario.')
    else:
        form = ProductoForm()
    marcas_resp = api_request('get', '/api/marcas', request)
    categorias_resp = api_request('get', '/api/categorias', request)
    marcas = marcas_resp.json() if marcas_resp and marcas_resp.status_code == 200 else []
    categorias = categorias_resp.json() if categorias_resp and categorias_resp.status_code == 200 else []
    return render(request, 'core/producto_form.html', {'accion': 'Crear', 'marcas': marcas, 'categorias': categorias, 'user': user, 'form': form, 'producto': None})


def producto_editar(request, producto_id):
    user = request.session.get('user')
    if not user or user.get('rol') not in ['Administrador', 'Bodeguero']:
        messages.error(request, 'No autorizado.')
        return redirect('core:productos_list')
    response = api_request('get', f'/api/productos/{producto_id}', request)
    producto = response.json() if response and response.status_code == 200 else None
    if not producto:
        messages.error(request, 'Producto no encontrado.')
        return redirect('core:productos_list')
    if request.method == 'POST':
        form = ProductoForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            # Convert Decimal fields to float for JSON serialization
            if 'precio' in data:
                data['precio'] = float(data['precio'])
            response = api_request('put', f'/api/productos/{producto_id}', request, json=data)
            if response and response.status_code == 200:
                messages.success(request, 'Producto actualizado exitosamente.')
                return redirect('core:producto_detalle', producto_id=producto_id)
            else:
                msg = response.json().get('message', 'Error al actualizar producto') if response else 'Error de conexión con el backend'
                messages.error(request, msg)
        else:
            messages.error(request, 'Corrija los errores en el formulario.')
    else:
        form = ProductoForm(initial=producto)
    marcas_resp = api_request('get', '/api/marcas', request)
    categorias_resp = api_request('get', '/api/categorias', request)
    marcas = marcas_resp.json() if marcas_resp and marcas_resp.status_code == 200 else []
    categorias = categorias_resp.json() if categorias_resp and categorias_resp.status_code == 200 else []
    return render(request, 'core/producto_form.html', {'accion': 'Editar', 'producto': producto, 'marcas': marcas, 'categorias': categorias, 'user': user, 'form': form})


def producto_eliminar(request, producto_id):
    user = request.session.get('user')
    if not user or user.get('rol') not in ['Administrador', 'Bodeguero']:
        messages.error(request, 'No autorizado.')
        return redirect('core:productos_list')
    response = api_request('delete', f'/api/productos/{producto_id}', request)
    if response and response.status_code == 200:
        messages.success(request, 'Producto eliminado exitosamente.')
    else:
        msg = response.json().get('message', 'Error al eliminar producto') if response else 'Error de conexión con el backend'
        messages.error(request, msg)
    return redirect('core:productos_list')

def usuarios_list(request):
    user = request.session.get('user')
    if not user or user.get('rol') != 'Administrador':
        messages.error(request, 'No autorizado.')
        return redirect('core:dashboard')
    response = api_request('get', '/api/usuarios', request)
    usuarios = response.json() if response and response.status_code == 200 else []
    return render(request, 'core/usuarios_list.html', {'usuarios': usuarios, 'user': user})

def usuario_detalle(request, usuario_id):
    user = request.session.get('user')
    if not user or user.get('rol') != 'Administrador':
        messages.error(request, 'No autorizado.')
        return redirect('core:dashboard')
    response = api_request('get', f'/api/usuarios/{usuario_id}', request)
    usuario = response.json() if response and response.status_code == 200 else None
    pedidos = []
    if usuario and usuario.get('rol', {}).get('nombre') == 'Cliente':
        pedidos_resp = api_request('get', f'/api/usuarios/{usuario_id}/ventas', request)
        if pedidos_resp and pedidos_resp.status_code == 200:
            pedidos = pedidos_resp.json()
    if not usuario:
        messages.error(request, 'Usuario no encontrado.')
        return redirect('core:usuarios_list')
    return render(request, 'core/usuario_detalle.html', {'usuario': usuario, 'user': user, 'pedidos': pedidos})

def usuario_crear(request):
    user = request.session.get('user')
    if not user or user.get('rol') != 'Administrador':
        messages.error(request, 'No autorizado.')
        return redirect('core:usuarios_list')
    if request.method == 'POST':
        form = UsuarioForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            response = api_request('post', '/api/usuarios', request, json=data)
            if response and response.status_code == 201:
                messages.success(request, 'Usuario creado exitosamente.')
                return redirect('core:usuarios_list')
            else:
                msg = response.json().get('message', 'Error al crear usuario') if response else 'Error de conexión con el backend'
                messages.error(request, msg)
        else:
            messages.error(request, 'Corrija los errores en el formulario.')
    else:
        form = UsuarioForm()
    roles_resp = api_request('get', '/api/roles', request)
    sucursales_resp = api_request('get', '/api/sucursales', request)
    roles = roles_resp.json() if roles_resp and roles_resp.status_code == 200 else []
    sucursales = sucursales_resp.json() if sucursales_resp and sucursales_resp.status_code == 200 else []
    return render(request, 'core/usuario_form.html', {'accion': 'Crear', 'roles': roles, 'sucursales': sucursales, 'user': user, 'form': form})


def usuario_editar(request, usuario_id):
    user = request.session.get('user')
    if not user or user.get('rol') != 'Administrador':
        messages.error(request, 'No autorizado.')
        return redirect('core:usuarios_list')
    response = api_request('get', f'/api/usuarios/{usuario_id}', request)
    usuario = response.json() if response and response.status_code == 200 else None
    if not usuario:
        messages.error(request, 'Usuario no encontrado.')
        return redirect('core:usuarios_list')
    if request.method == 'POST':
        form = UsuarioForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            password = data.pop('password', None)
            if password:
                data['contrasena'] = password
            response = api_request('put', f'/api/usuarios/{usuario_id}', request, json=data)
            if response and response.status_code == 200:
                messages.success(request, 'Usuario actualizado exitosamente.')
                return redirect('core:usuario_detalle', usuario_id=usuario_id)
            else:
                msg = response.json().get('message', 'Error al actualizar usuario') if response else 'Error de conexión con el backend'
                messages.error(request, msg)
        else:
            messages.error(request, 'Corrija los errores en el formulario.')
    else:
        form = UsuarioForm(initial=usuario)
    roles_resp = api_request('get', '/api/roles', request)
    sucursales_resp = api_request('get', '/api/sucursales', request)
    roles = roles_resp.json() if roles_resp and roles_resp.status_code == 200 else []
    sucursales = sucursales_resp.json() if sucursales_resp and sucursales_resp.status_code == 200 else []
    return render(request, 'core/usuario_form.html', {'accion': 'Editar', 'usuario': usuario, 'roles': roles, 'sucursales': sucursales, 'user': user, 'form': form})

def usuario_eliminar(request, usuario_id):
    user = request.session.get('user')
    if not user or user.get('rol') != 'Administrador':
        messages.error(request, 'No autorizado.')
        return redirect('core:usuarios_list')
    response = api_request('delete', f'/api/usuarios/{usuario_id}', request)
    if response and response.status_code == 200:
        messages.success(request, 'Usuario eliminado exitosamente.')
    else:
        msg = response.json().get('message', 'Error al eliminar usuario') if response else 'Error de conexión con el backend'
        messages.error(request, msg)
    return redirect('core:usuarios_list')

def stock_general(request):
    user = request.session.get('user')
    if not user or user.get('rol') not in ['Administrador', 'Bodeguero', 'Vendedor']:
        messages.error(request, 'No autorizado.')
        return redirect('core:dashboard')
    # Filtros
    producto_nombre = request.GET.get('producto', '').strip()
    sucursal_nombre = request.GET.get('sucursal', '').strip()
    response = api_request('get', '/api/stock', request)
    stock = response.json() if response and response.status_code == 200 else []
    # Filtrado en Python (idealmente sería en backend, pero aquí es frontend)
    if producto_nombre:
        stock = [s for s in stock if producto_nombre.lower() in s['producto']['nombre'].lower()]
    if sucursal_nombre:
        stock = [s for s in stock if sucursal_nombre.lower() in s['sucursal']['nombre'].lower()]
    return render(request, 'core/stock_list.html', {
        'stock': stock,
        'user': user,
        'producto_nombre': producto_nombre,
        'sucursal_nombre': sucursal_nombre
    })


def stock_actualizar(request, producto_id, sucursal_id):
    user = request.session.get('user')
    if not user or user.get('rol') not in ['Administrador', 'Bodeguero']:
        messages.error(request, 'No autorizado.')
        return redirect('core:dashboard')
    if request.method == 'POST':
        form = StockUpdateForm(request.POST)
        if form.is_valid():
            cantidad = form.cleaned_data['cantidad']
            response = api_request('put', f'/api/stock/{producto_id}/sucursal/{sucursal_id}', request, json={'cantidad': cantidad, 'producto_id': producto_id, 'sucursal_id': sucursal_id})
            if response and response.status_code == 200:
                messages.success(request, 'Stock actualizado exitosamente.')
                return redirect('core:stock_list')
            else:
                msg = response.json().get('message', 'Error al actualizar stock') if response else 'Error de conexión con el backend'
                messages.error(request, msg)
        else:
            messages.error(request, 'Corrija los errores en el formulario.')
    else:
        # Obtener stock actual
        response = api_request('get', f'/api/stock', request)
        stock = response.json() if response and response.status_code == 200 else []
        actual = next((s for s in stock if s['producto']['id'] == producto_id and s['sucursal']['id'] == sucursal_id), None)
        form = StockUpdateForm(initial={'cantidad': actual['cantidad'] if actual else 0})
    return render(request, 'core/stock_form.html', {'form': form, 'producto_id': producto_id, 'sucursal_id': sucursal_id, 'user': user})

def informe_ventas_mensual(request):
    user = request.session.get('user')
    if not user or user.get('rol') != 'Administrador':
        messages.error(request, 'No autorizado.')
        return redirect('core:dashboard')
    sucursales_resp = api_request('get', '/api/sucursales', request)
    sucursales = sucursales_resp.json() if sucursales_resp and sucursales_resp.status_code == 200 else []
    informe = None
    selected_sucursal = request.GET.get('sucursal')
    selected_anio = request.GET.get('anio', str(datetime.now().year))
    selected_mes = request.GET.get('mes', str(datetime.now().month))
    if selected_sucursal and selected_anio and selected_mes:
        endpoint = f"/api/ventas/informe-mensual?sucursalId={selected_sucursal}&anio={selected_anio}&mes={selected_mes}"
        informe_resp = api_request('get', endpoint, request)
        if informe_resp and informe_resp.status_code == 200:
            informe = informe_resp.json()
        else:
            messages.error(request, 'No hay datos para ese filtro o error en el servidor.')
    return render(request, 'core/informe_ventas_mensual.html', {
        'user': user,
        'sucursales': sucursales,
        'informe': informe,
        'selected_sucursal': selected_sucursal,
        'selected_anio': selected_anio,
        'selected_mes': selected_mes,
        'meses': range(1, 13)  # Agrega la lista de meses para el template
    })
