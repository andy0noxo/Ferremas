from django.shortcuts import render, redirect
from core.api import api_request
from django.contrib import messages
from .forms import PedidoForm
import json

def pedidos_list(request):
    user = request.session.get('user')
    if not user:
        return redirect('core:login')
    # Admin y Vendedor ven todos, Cliente ve solo los suyos
    if user.get('rol') in ['Administrador', 'Vendedor']:
        response = api_request('get', '/api/pedidos', request)
    else:
        response = api_request('get', '/api/pedidos/usuario', request)
    pedidos = response.json() if response and response.status_code == 200 else []
    return render(request, 'pedidos/pedidos_list.html', {'pedidos': pedidos, 'user': user})


def pedido_detalle(request, pedido_id):
    user = request.session.get('user')
    if not user:
        return redirect('core:login')
    response = api_request('get', f'/api/pedidos/{pedido_id}', request)
    pedido = response.json() if response and response.status_code == 200 else None
    if not pedido:
        messages.error(request, 'Pedido no encontrado.')
        return redirect('pedidos:pedidos_list')
    return render(request, 'pedidos/pedido_detalle.html', {'pedido': pedido, 'user': user})


def pedido_crear(request):
    user = request.session.get('user')
    if not user or user.get('rol') != 'Cliente':
        messages.error(request, 'Solo los clientes pueden crear pedidos.')
        return redirect('core:dashboard')
    carrito = request.session.get('carrito', {})
    if request.method == 'POST':
        form = PedidoForm(request.POST)
        productos = request.POST.getlist('productos')  # Se espera una lista de IDs y cantidades
        productos_data = []
        for prod in productos:
            # prod debe venir como 'id-cantidad', ej: '3-2'
            try:
                pid, cant = prod.split('-')
                productos_data.append({'producto_id': int(pid), 'cantidad': int(cant)})
            except Exception:
                continue
        if form.is_valid() and productos_data:
            data = form.cleaned_data
            # Ajustar nombres de campos para el backend
            data['sucursalId'] = data.pop('sucursal_id', None)
            data['metodoPago'] = data.pop('metodo_pago', None)
            data['productos'] = productos_data
            response = api_request('post', '/api/pedidos', request, json=data)
            if response and response.status_code == 201:
                messages.success(request, 'Pedido creado exitosamente.')
                # Limpiar carrito después de crear pedido
                if 'carrito' in request.session:
                    del request.session['carrito']
                return redirect('pedidos:pedidos_list')
            else:
                msg = response.json().get('message', 'Error al crear pedido') if response else 'Error de conexión con el backend'
                messages.error(request, msg)
        else:
            messages.error(request, 'Corrija los errores y seleccione productos.')
    else:
        form = PedidoForm()
    # Obtener productos y sucursales para el formulario
    productos_resp = api_request('get', '/api/productos', request)
    sucursales_resp = api_request('get', '/api/sucursales', request)
    productos = productos_resp.json() if productos_resp and productos_resp.status_code == 200 else []
    sucursales = sucursales_resp.json() if sucursales_resp and sucursales_resp.status_code == 200 else []
    # Pre-cargar cantidades del carrito en los productos
    for producto in productos:
        producto['cantidad_carrito'] = int(carrito.get(str(producto['id']), 0))
    # Construir estructura de stocks para el template JS
    stocks_json = json.dumps({
        str(producto['id']): {
            str(stock.get('sucursal', {}).get('id', stock.get('sucursal_id'))): stock['cantidad']
            for stock in producto.get('stocks', [])
        } for producto in productos
    })
    return render(request, 'pedidos/pedido_form.html', {
        'form': form,
        'productos': productos,
        'sucursales': sucursales,
        'user': user,
        'carrito': carrito,
        'stocks_json': stocks_json
    })
