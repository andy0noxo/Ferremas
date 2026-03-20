from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from core.api import api_request
from django.contrib import messages
from .forms import PedidoForm
import json
from django.conf import settings # Import missing settings

def pedidos_list(request):
    user = request.session.get('user')
    if not user:
        return redirect('core:login')
    # Admin y Vendedor ven todos, Cliente ve solo los suyos
    if user.get('rol') in ['Administrador', 'Vendedor', 'Bodeguero', 'Contador']:
        response = api_request('get', '/api/pedidos', request)
        es_admin_o_vendedor = True
    else:
        response = api_request('get', '/api/pedidos/usuario', request)
        es_admin_o_vendedor = False
        
    pedidos = response.json() if response and response.status_code == 200 else []
    
    # Filtrar por estado si viene en query params (útil para dashboards)
    estado_filtro = request.GET.get('estado')
    if estado_filtro:
        pedidos = [p for p in pedidos if p.get('estado') == estado_filtro]
    
    # Ordenar pedidos por fecha descendente si es posible
    # (Asumiendo que la API no lo hace, aunque el controller sí lo hace)
    
    return render(request, 'pedidos/pedidos_list.html', {
        'pedidos': pedidos, 
        'user': user,
        'estado_actual': estado_filtro,
        'es_admin_o_vendedor': es_admin_o_vendedor,
        'estados_posibles': ['pendiente', 'aprobado', 'rechazado', 'preparado', 'despachado', 'entregado']
    })

def pedido_actualizar_estado(request, pedido_id):
    user = request.session.get('user')
    rol_raw = user.get('rol') if user else None
    rol = str(rol_raw).strip() if rol_raw else ''
    
    es_staff = rol in ['Administrador', 'Vendedor', 'Bodeguero'] or rol.lower() in ['administrador', 'vendedor', 'bodeguero']
    es_cliente = rol == 'Cliente'

    if not user or (not es_staff and not es_cliente):
        messages.error(request, 'No autorizado para cambiar estados de pedidos.')
        return redirect('pedidos:pedidos_list')

    if request.method == 'POST':
        nuevo_estado = request.POST.get('estado')
        
        # Validacion frontend para cliente
        if es_cliente and nuevo_estado != 'rechazado':
             messages.error(request, 'Clientes solo pueden cancelar pedidos.')
             return redirect('pedidos:pedido_detalle', pedido_id=pedido_id)

        print(f"DEBUG: Intentando cambiar estado pedido #{pedido_id} a {nuevo_estado} por usuario {user['email']}") # Debug Log
        if nuevo_estado:
            response = api_request('put', f'/api/pedidos/{pedido_id}/estado', request, json={'estado': nuevo_estado})
            
            if response and response.status_code == 200:
                msg = f'Estado del pedido #{pedido_id} actualizado a {nuevo_estado}.'
                if es_cliente and nuevo_estado == 'rechazado':
                    msg = 'Pedido cancelado exitosamente.'
                messages.success(request, msg)
                return redirect('pedidos:pedido_detalle', pedido_id=pedido_id)
            else:
                msg = response.json().get('message', 'Error al actualizar estado') if response else 'Error de conexión'
                messages.error(request, msg)
        else:
            messages.error(request, 'Debe seleccionar un estado válido.')
            
    return redirect('pedidos:pedido_detalle', pedido_id=pedido_id)



def pedido_detalle(request, pedido_id):
    user = request.session.get('user')
    if not user:
        return redirect('core:login')
    response = api_request('get', f'/api/pedidos/{pedido_id}', request)
    pedido = response.json() if response and response.status_code == 200 else None
    if not pedido:
        messages.error(request, 'Pedido no encontrado.')
        return redirect('pedidos:pedidos_list')
        
    rol_raw = user.get('rol')
    rol = str(rol_raw).strip() if rol_raw else ''
    
    # Check robusto con normalización
    es_admin_o_vendedor = rol in ['Administrador', 'Vendedor'] or rol.lower() in ['administrador', 'vendedor']
    es_bodeguero = rol == 'Bodeguero' or rol.lower() == 'bodeguero'
    
    return render(request, 'pedidos/pedido_detalle.html', {
        'pedido': pedido, 
        'user': user,
        'es_admin_o_vendedor': es_admin_o_vendedor,
        'es_bodeguero': es_bodeguero
    })


@require_http_methods(["GET", "POST"])
def pedido_crear(request):
    """
    Vista de Checkout (Revisión de Pedido y Selección de Entrega).
    Si es POST, procesa los datos de entrega y redirige al flujo de pago.
    """
    user = request.session.get('user')
    if not user or user.get('rol') != 'Cliente':
        messages.error(request, 'Solo los clientes pueden crear pedidos.')
        return redirect('core:dashboard')
    
    carrito = request.session.get('carrito', {})
    if not carrito:
        messages.warning(request, 'Su carrito está vacío.')
        return redirect('core:productos_list')

    if request.method == 'POST':
        # Validar formulario de entrega
        tipo_entrega = request.POST.get('tipo_entrega') # 'retiro' o 'despacho'
        sucursal_id = request.POST.get('sucursal_id')
        direccion = request.POST.get('direccion')
        comuna = request.POST.get('comuna')
        region = request.POST.get('region')
        
        # Validaciones básicas
        if tipo_entrega == 'retiro' and not sucursal_id:
            messages.error(request, 'Debe seleccionar una sucursal para retiro.')
        elif tipo_entrega == 'despacho' and not (direccion and comuna and region):
            messages.error(request, 'Debe completar la dirección de despacho.')
        else:
            costo_envio = 0
            if tipo_entrega == 'despacho':
                try:
                    costo_envio = int(request.POST.get('costo_envio', 5000))
                except ValueError:
                    costo_envio = 5000 # Fallback

            # Guardar datos de entrega en sesión temporalmente
            request.session['checkout_data'] = {
                'tipo_entrega': tipo_entrega,
                'sucursal_id': sucursal_id,
                'direccion': direccion,
                'comuna': comuna,
                'region': region,
                'costo_envio': costo_envio
            }
            return redirect('pedidos:pago_iniciar')

    # GET: Mostrar items del carrito y formulario
    productos_resp = api_request('get', '/api/productos', request)
    sucursales_resp = api_request('get', '/api/sucursales', request)
    
    all_products = productos_resp.json() if productos_resp and productos_resp.status_code == 200 else []
    sucursales = sucursales_resp.json() if sucursales_resp and sucursales_resp.status_code == 200 else []
    
    cart_items = []
    subtotal = 0
    
    for pid, qty in carrito.items():
        product = next((p for p in all_products if str(p['id']) == pid), None)
        if product:
            precio = float(product['precio'])
            item_subtotal = precio * qty
            
            # Fix image URL if it's relative
            img_url = product.get('imagen_url', '')
            if img_url and not img_url.startswith('http'):
                img_url = f"{settings.BACKEND_URL}/{img_url.lstrip('/')}"
            
            cart_items.append({
                'id': product['id'],
                'nombre': product['nombre'],
                'precio': precio,
                'cantidad': qty,
                'subtotal': item_subtotal,
                'imagen': img_url
            })
            subtotal += item_subtotal
            
    return render(request, 'pedidos/pedido_form.html', {
        'items': cart_items,
        'subtotal': subtotal,
        'sucursales': sucursales,
        'user': user
    })

def pago_iniciar(request):
    """Inicia el flujo de pago con Webpay (Mock)."""
    checkout_data = request.session.get('checkout_data')
    carrito = request.session.get('carrito')
    
    if not checkout_data or not carrito:
        return redirect('pedidos:pedido_crear')
        
    # Calcular total final
    # (En una app real, recalcularíamos nuevamente todo desde la DB para evitar fraude)
    # Aquí asumimos que el subtotal se pasa o se recalcula... idealmente recalcular.
    # Por simplicidad, recalculo rápido:
    products_resp = api_request('get', '/api/productos', request)
    all_products = products_resp.json() if products_resp and products_resp.status_code == 200 else []
    subtotal = sum(float(next((p['precio'] for p in all_products if str(p['id']) == pid), 0)) * qty for pid, qty in carrito.items())
    
    total = subtotal + checkout_data.get('costo_envio', 0)
    
    # Agregar total a sesión para mostrar en Webpay
    request.session['payment_total'] = total
    
    return redirect('pedidos:webpay_mock')

def webpay_mock(request):
    """Simula la pasarela de pago de Webpay."""
    total = request.session.get('payment_total', 0)
    if total == 0:
        return redirect('pedidos:pedido_crear')
    return render(request, 'pedidos/webpay_mock.html', {'total': total})

def pago_retorno(request):
    """Procesa el retorno exitoso de Webpay y crea el pedido."""
    carrito = request.session.get('carrito')
    checkout_data = request.session.get('checkout_data')
    payment_total = request.session.get('payment_total')
    
    if not carrito or not checkout_data:
        messages.error(request, 'Sesión de pago inválida.')
        return redirect('core:productos_list')
        
    # Construir payload para crear pedido
    productos_data = [{'producto_id': int(pid), 'cantidad': qty} for pid, qty in carrito.items()]
    

    payload = {
        'productos': productos_data,
        'metodoPago': 'Webpay', 
        'total': payment_total,
        'estado': 'pendiente', # El pedido nace pendiente de validación
    }

    # Aseguramos que el método de pago sea válido según la definición del modelo en backend
    # ENUM: 'debito', 'credito', 'transferencia'
    # Como es Webpay, mapearemos a 'debito' por defecto, o 'credito' si pudiéramos saberlo.
    payload['metodoPago'] = 'debito' 

    

    if checkout_data['tipo_entrega'] == 'retiro':
        payload['sucursalId'] = int(checkout_data['sucursal_id'])
        payload['tipoEntrega'] = 'Retiro en tienda'
    else:
        # Para despacho, necesitamos asignar una sucursal de origen (Bodega)
        # Consultamos la primera sucursal disponible como default
        try:
            sucursales_resp = api_request('get', '/api/sucursales', request)
            if sucursales_resp and sucursales_resp.status_code == 200:
                sucursales = sucursales_resp.json()
                if sucursales:
                    # Usamos la primera sucursal como bodega de origen
                    payload['sucursalId'] = sucursales[0]['id']
                else:
                    # Fallback si no hay sucursales (aunque raro)
                    payload['sucursalId'] = 1 
            else:
                 payload['sucursalId'] = 1
        except:
            payload['sucursalId'] = 1
            
        payload['tipoEntrega'] = 'Despacho a domicilio'
        payload['direccionEnvio'] = f"{checkout_data['direccion']}, {checkout_data['comuna']}, {checkout_data['region']}"
        payload['costoEnvio'] = checkout_data['costo_envio']


    # Llamar API
    response = api_request('post', '/api/pedidos', request, json=payload)
    
    if response and response.status_code == 201:
        # Limpiar sesión
        if 'carrito' in request.session: del request.session['carrito']
        if 'checkout_data' in request.session: del request.session['checkout_data']
        if 'payment_total' in request.session: del request.session['payment_total']
        
        messages.success(request, '¡Pedido pagado y creado exitosamente!')
        return redirect('pedidos:pedidos_list') # O detalle del pedido si la API retorna ID
    else:
        msg = response.json().get('message', 'Error al crear pedido') if response else 'Error de conexión'
        messages.error(request, f"Pago exitoso pero error al crear pedido: {msg}")
        return redirect('pedidos:pedido_crear')


