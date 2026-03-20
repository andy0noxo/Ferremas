from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.conf import settings
from .api import api_request
from django.contrib import messages
from .forms import ProductoForm, UsuarioForm
from .forms_stock import StockUpdateForm, StockUpdateDetailedForm

from datetime import datetime

import logging
import json
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

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
    """Vista de login con manejo mejorado de errores."""
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        
        if not email or not password:
            messages.error(request, 'Email y contraseña son requeridos.')
            return render(request, 'core/login.html')
        
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
                messages.success(request, f'Bienvenido, {data["nombre"]}!')
                return redirect('core:dashboard')
            else:
                # Mostrar mensaje real del backend si existe
                try:
                    error_msg = response.json().get('message', 'Credenciales inválidas')
                except Exception:
                    error_msg = 'Error de conexión con el backend'
                messages.error(request, error_msg)
        except Exception as e:
            logger.error(f'Error en login: {str(e)}')
            messages.error(request, 'Error de conexión con el servidor. Intente más tarde.')
    
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
        confirm_password = request.POST.get('confirm_password')
        rut = request.POST.get('rut')
        rol = request.POST.get('rol')
        
        if not all([nombre, email, password, confirm_password, rut, rol]):
            messages.error(request, 'Todos los campos son requeridos.')
            return render(request, 'core/register.html', {
                'hide_user_info': False,
                'form_data': request.POST
            })

        if password != confirm_password:
            messages.error(request, 'Las contraseñas no coinciden.')
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
        # Dashboard Vendedor: Resumen de ventas y tareas
        response = api_request('get', '/api/pedidos', request)
        pedidos = response.json() if response and response.status_code == 200 else []
        
        # Filtrar pedidos relevantes (ej: pendientes de la sucursal del vendedor sería ideal, pero por ahora todos)
        pendientes = [p for p in pedidos if p.get('estado') == 'pendiente']
        fecha_hoy = datetime.now().strftime('%Y-%m-%d')
        pedidos_hoy = sum(1 for p in pedidos if p.get('fecha_pedido', '').startswith(fecha_hoy))
        
        # Calcular ventas del mes actual (simple)
        mes_actual = datetime.now().strftime('%Y-%m')
        ventas_mes = sum(1 for p in pedidos if p.get('fecha_pedido', '').startswith(mes_actual) and p.get('estado') == 'aprobado')

        context = {
            'user': user,
            'recent_orders': pendientes[:5], # Mostrar primeros 5 pendientes para acción rápida
            'stats': {
                'pedidos_hoy': pedidos_hoy,
                'pendientes': len(pendientes),
                'ventas_mes': ventas_mes
            }
        }
        return render(request, 'core/dashboard_vendedor.html', context)
    elif rol == 'Bodeguero':
        # Dashboard Bodeguero: Gestión de Inventario y Pedidos
        # 1. Pedidos
        response_pedidos = api_request('get', '/api/pedidos', request)
        pedidos = response_pedidos.json() if response_pedidos and response_pedidos.status_code == 200 else []
        
        # Filtrar pedidos relevantes para bodega
        # 'aprobado' -> Pendiente de preparación
        # 'preparado' -> Listo para entrega/despacho
        por_preparar = [p for p in pedidos if p.get('estado') == 'aprobado']
        listos_entrega = [p for p in pedidos if p.get('estado') == 'preparado']
        
        # 2. Stock Crítico
        response_stock = api_request('get', '/api/stock', request)
        stock_list = response_stock.json() if response_stock and response_stock.status_code == 200 else []
        
        # Filtrar stock bajo (ej: < 20 unidades)
        stock_critico = []
        # Obtener ID de sucursal desde el objeto 'sucursal' en la sesión del usuario
        user_sucursal = user.get('sucursal')
        user_sucursal_id = user_sucursal.get('id') if isinstance(user_sucursal, dict) else None
        
        for item in stock_list:
            # Si el bodeguero tiene sucursal asignada, filtrar por ella. Si no, mostrar todo global.
            stock_sucursal_id = item.get('sucursal', {}).get('id')
            if user_sucursal_id and str(stock_sucursal_id) != str(user_sucursal_id):
                continue
            
            if item.get('cantidad', 0) < 20: # Umbral de alerta
                stock_critico.append(item)
        
        # Ordenar por cantidad ascendente (más críticos primero)
        stock_critico.sort(key=lambda x: x.get('cantidad', 0))

        context = {
            'user': user,
            'pedidos_preparar': por_preparar[:5], # Mostrar top 5 más antiguos
            'stock_critico': stock_critico[:5],   # Mostrar top 5 más críticos
            'stats': {
                'por_preparar': len(por_preparar),
                'listos_entrega': len(listos_entrega),
                'alertas_stock': len(stock_critico)
            }
        }
        return render(request, 'core/dashboard_bodeguero.html', context)
    elif rol == 'Contador':
        # Dashboard Contador: Resumen Financiero y Reportes
        response_pedidos = api_request('get', '/api/pedidos', request)
        pedidos = response_pedidos.json() if response_pedidos and response_pedidos.status_code == 200 else []

        # Calcular totales
        mes_actual = datetime.now().strftime('%Y-%m')
        
        # Filtrar pedidos del mes que representan ventas (pagados/aprobados/entregados/despachados/preparados)
        ventas_validas = [
            p for p in pedidos 
            if p.get('fecha_pedido', '').startswith(mes_actual) 
            and p.get('estado') not in ['pendiente', 'rechazado']
        ]

        total_ventas_mes = sum(float(p.get('total', 0)) for p in ventas_validas)
        cantidad_ventas = len(ventas_validas)
        ticket_promedio = total_ventas_mes / cantidad_ventas if cantidad_ventas > 0 else 0

        # Pedidos pendientes de pago (estado 'pendiente')
        pendientes_pago = [p for p in pedidos if p.get('estado') == 'pendiente']
        
        # Últimas ventas aprobadas (para tabla)
        ultimas_ventas = [p for p in pedidos if p.get('estado') == 'aprobado'][:5]

        context = {
            'user': user,
            'ultimas_ventas': ultimas_ventas,
            'pendientes_pago': pendientes_pago[:5],
            'stats': {
                'total_ventas_mes': total_ventas_mes,
                'cantidad_ventas': cantidad_ventas,
                'ticket_promedio': ticket_promedio,
                'pendientes_count': len(pendientes_pago)
            }
        }
        return render(request, 'core/dashboard_contador.html', context)
    else:
        # Dashboard Cliente: Cargar resumen de pedidos
        response = api_request('get', '/api/pedidos/usuario', request)
        pedidos = response.json() if response and response.status_code == 200 else []
        
        # Calcular estadísticas básicas
        ultimos_pedidos = pedidos[:5] # Mostrar max 5 recientes
        pendientes = sum(1 for p in pedidos if p.get('estado') == 'pendiente')
        aprobados = sum(1 for p in pedidos if p.get('estado') == 'aprobado')
        
        context = {
            'user': user,
            'recent_orders': ultimos_pedidos,
            'stats': {
                'total': len(pedidos),
                'pendientes': pendientes,
                'aprobados': aprobados
            }
        }
        return render(request, 'core/dashboard_cliente.html', context)

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
    
    # Obtener categorias, marcas y sucursales para los filtros
    cat_response = api_request('get', '/api/categorias', request)
    categorias = cat_response.json() if cat_response and cat_response.status_code == 200 else []
    
    marcas_response = api_request('get', '/api/marcas', request)
    marcas = marcas_response.json() if marcas_response and marcas_response.status_code == 200 else []
    
    sucursales_response = api_request('get', '/api/sucursales', request)
    sucursales = sucursales_response.json() if sucursales_response and sucursales_response.status_code == 200 else []

    # Aplicar filtros si existen en la request (opcional en backend si express lo soporta, o en frontend)
    search = request.GET.get('search', '')
    categoria_id = request.GET.get('categoria_id', '')
    marca_id = request.GET.get('marca_id', '')

    if search:
        productos = [p for p in productos if search.lower() in p.get('nombre', '').lower() or search.lower() in p.get('descripcion', '').lower()]
    if categoria_id:
        productos = [p for p in productos if str(p.get('categoria_id')) == str(categoria_id)]
    if marca_id:
        productos = [p for p in productos if str(p.get('marca_id')) == str(marca_id)]

    # Enriquecer productos con información de stock completa por sucursal para visualización
    for p in productos:
        stock_map = {}
        if 'stocks' in p and isinstance(p['stocks'], list):
            for s in p['stocks']:
                # Usamos sucursal_id que viene en el objeto stock
                stock_map[s.get('sucursal_id')] = s.get('cantidad', 0)
        
        p['stock_info'] = []
        for suc in sucursales:
            cant = stock_map.get(suc['id'], 0)
            p['stock_info'].append({
                'sucursal': suc['nombre'],
                'cantidad': cant
            })

    pedido_count = sum(carrito.values()) if carrito else 0
    return render(request, 'core/productos_list.html', {
        'productos': productos,
        'user': user,
        'carrito': carrito,
        'pedido_count': pedido_count,
        'categorias': categorias,
        'marcas': marcas,
        'sucursales': sucursales,
        'search': search,
        'categoria_id': categoria_id,
        'marca_id': marca_id
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
    if not user or user.get('rol') not in ['Administrador', 'Bodeguero', 'Vendedor']:
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
        initial_stock = 0
        if 'stocks' in producto and len(producto['stocks']) > 0:
            initial_stock = producto['stocks'][0].get('cantidad', 0)
        
        initial_data = producto.copy()
        initial_data['stock'] = initial_stock
        form = ProductoForm(initial=initial_data)
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
    if not user or user.get('rol') not in ['Administrador', 'Bodeguero', 'Vendedor', 'Contador']:
        messages.error(request, 'No autorizado.')
        return redirect('core:dashboard')
    
    # 1. Obtener datos maestros (sucursales y productos)
    sucursales = []
    resp_suc = api_request('get', '/api/sucursales', request)
    if resp_suc and resp_suc.status_code == 200:
        sucursales = resp_suc.json()

    productos = []
    resp_prod = api_request('get', '/api/productos', request)
    if resp_prod and resp_prod.status_code == 200:
        productos = resp_prod.json()

    # 2. Procesar formulario de actualización
    if request.method == 'POST':
        if user.get('rol') == 'Contador':
            messages.error(request, 'No autorizado para modificar stock.')
            return redirect('core:stock_list')
        # Pasamos productos y sucursales para que el form popule los choices
        form = StockUpdateDetailedForm(request.POST, productos=productos, sucursales=sucursales)
        if form.is_valid():
            pid = form.cleaned_data['producto_id']
            sid = form.cleaned_data['sucursal_id']
            cantidad = form.cleaned_data['cantidad']
            
            # Llamada a la API para actualizar
            resp = api_request('put', f'/api/stock/{pid}/sucursal/{sid}', request, json={
                'cantidad': cantidad, 
                'producto_id': pid, 
                'sucursal_id': sid
            })
            
            if resp and resp.status_code == 200:
                messages.success(request, 'Stock actualizado exitosamente.')
                return redirect('core:stock_list')
            else:
                msg = resp.json().get('message', 'Error al actualizar stock') if resp else 'Error de conexión con el backend'
                messages.error(request, msg)
    else:
        form = StockUpdateDetailedForm(productos=productos, sucursales=sucursales)

    # 3. Obtener stock y armar tabla pivote
    response = api_request('get', '/api/stock', request)
    stock_list = response.json() if response and response.status_code == 200 else []
    
    # Armar estructura { id_prod: { producto: {}, stocks: {id_suc: cant}, total: 0 } }
    pivot_map = {}
    
    # Inicializar con todos los productos (para mostrar incluso los sin stock)
    for p in productos:
        str_pid = str(p['id'])
        pivot_map[str_pid] = {
            'producto': p,
            'stocks': {str(s['id']): 0 for s in sucursales},
            'total': 0
        }
    
    # Llenar con datos reales
    for item in stock_list:
        if 'producto' in item and 'sucursal' in item:
            str_pid = str(item['producto']['id'])
            str_sid = str(item['sucursal']['id'])
            qty = item['cantidad']
            
            if str_pid in pivot_map:
                pivot_map[str_pid]['stocks'][str_sid] = qty

    # Convertir a lista y ordenar columnas de stock según orden de sucursales
    sucursal_ids = [str(s['id']) for s in sucursales]
    pivot_list = []
    
    for pid, data in pivot_map.items():
        # Lista ordenada de cantidades correspondiendo a la lista de 'sucursales'
        ordered_stocks = [data['stocks'].get(sid, 0) for sid in sucursal_ids]
        data['ordered_stocks'] = ordered_stocks
        data['total'] = sum(data['stocks'].values())
        pivot_list.append(data)

    # Filtros visuales
    producto_nombre = request.GET.get('producto', '').strip()
    # sucursal_nombre ya no aplica tanto porque mostramos todas las columnas, 
    # pero podríamos filtrar si tuviera sentido. Por ahora filtramos por nombre producto.
    if producto_nombre:
        pivot_list = [p for p in pivot_list if producto_nombre.lower() in p['producto']['nombre'].lower()]

    return render(request, 'core/stock_list.html', {
        'form': form,
        'pivot_list': pivot_list,
        'sucursales': sucursales,
        'user': user,
        'producto_nombre': producto_nombre
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

def informe_ventas(request):
    user = request.session.get('user')
    if not user or user.get('rol') not in ['Administrador', 'Contador']:
        messages.error(request, 'No autorizado.')
        return redirect('core:dashboard')
    
    sucursales_resp = api_request('get', '/api/sucursales', request)
    sucursales = sucursales_resp.json() if sucursales_resp and sucursales_resp.status_code == 200 else []
    
    informe = None
    selected_sucursal = request.GET.get('sucursal')
    selected_anio = request.GET.get('anio', str(datetime.now().year))
    selected_periodo = request.GET.get('periodo', f"mes-{datetime.now().month}")
    
    if selected_sucursal and selected_anio and selected_periodo:
        endpoint = f"/api/ventas/informes?sucursalId={selected_sucursal}&anio={selected_anio}&periodo={selected_periodo}"
        informe_resp = api_request('get', endpoint, request)
        if informe_resp and informe_resp.status_code == 200:
            informe = informe_resp.json()
        else:
            messages.error(request, 'No hay datos para ese filtro o error en el servidor.')
            
    return render(request, 'core/informe_ventas.html', {
        'user': user,
        'sucursales': sucursales,
        'informe': informe,
        'selected_sucursal': selected_sucursal,
        'selected_anio': selected_anio,
        'selected_periodo': selected_periodo
    })

@csrf_exempt
@require_http_methods(["GET", "POST"])
def carrito_api(request):
    """
    API interna para manejar el carrito de compras en la sesión de Django.
    Permite obtener el estado actual, agregar, eliminar y actualizar items sin recargar la página.
    """
    carrito = request.session.get('carrito', {})
    
    if request.method == 'GET':
        # Retrieve product details from API to populate the cart response
        products_response = api_request('get', '/api/productos', request)
        if products_response and products_response.status_code == 200:
            all_products = products_response.json()
        else:
            all_products = []
            
        cart_items = []
        total = 0
        
        for pid, qty in carrito.items():
            # Buscar el producto en la lista completa
            # Nota: Esto no es lo más eficiente si hay muchos productos, 
            # pero dado que el backend no tiene un endpoint para 'get_multiple_by_ids', esto funciona.
            product = next((p for p in all_products if str(p['id']) == pid), None)
            if product:
                precio = float(product['precio'])
                subtotal = precio * qty
                cart_items.append({
                    'id': product['id'],
                    'nombre': product['nombre'],
                    'precio': precio,
                    'imagen': product.get('imagen', ''), # Asegúrate de que el backend envíe esto o manejar default en JS
                    'cantidad': qty,
                    'subtotal': subtotal
                })
                total += subtotal
                
        return JsonResponse({
            'items': cart_items,
            'total': total,
            'count': sum(carrito.values())
        })
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            action = data.get('action')
            pid = str(data.get('pid'))
            
            if action == 'add':
                qty = int(data.get('qty', 1))
                if pid in carrito:
                    carrito[pid] += qty
                else:
                    carrito[pid] = qty
            
            elif action == 'remove':
                if pid in carrito:
                    del carrito[pid]
            
            elif action == 'clear':
                carrito = {}
            
            elif action == 'update':
                qty = int(data.get('qty', 1))
                if qty > 0:
                    carrito[pid] = qty
                else:
                    if pid in carrito: del carrito[pid]
            
            request.session['carrito'] = carrito
            return JsonResponse({
                'status': 'ok', 
                'count': sum(carrito.values()),
                'message': 'Carrito actualizado'
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
