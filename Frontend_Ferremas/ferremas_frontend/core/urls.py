from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.home_view, name='home'),  # Add root URL handler
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('productos/', views.productos_list, name='productos_list'),
    path('productos/<int:producto_id>/', views.producto_detalle, name='producto_detalle'),
    path('productos/crear/', views.producto_crear, name='producto_crear'),
    path('productos/<int:producto_id>/editar/', views.producto_editar, name='producto_editar'),
    path('productos/<int:producto_id>/eliminar/', views.producto_eliminar, name='producto_eliminar'),
    path('usuarios/', views.usuarios_list, name='usuarios_list'),
    path('usuarios/<int:usuario_id>/', views.usuario_detalle, name='usuario_detalle'),
    path('usuarios/crear/', views.usuario_crear, name='usuario_crear'),
    path('usuarios/<int:usuario_id>/editar/', views.usuario_editar, name='usuario_editar'),
    path('usuarios/<int:usuario_id>/eliminar/', views.usuario_eliminar, name='usuario_eliminar'),
    path('stock/', views.stock_general, name='stock_list'),
    path('stock/<int:producto_id>/<int:sucursal_id>/actualizar/', views.stock_actualizar, name='stock_actualizar'),
    path('informe-ventas-mensual/', views.informe_ventas_mensual, name='informe_ventas_mensual'),
]
