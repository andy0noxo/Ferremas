from django.urls import path
from . import views

app_name = 'pedidos'

urlpatterns = [
    path('', views.pedidos_list, name='pedidos_list'),
    path('<int:pedido_id>/', views.pedido_detalle, name='pedido_detalle'),
    path('<int:pedido_id>/actualizar/', views.pedido_actualizar_estado, name='pedido_actualizar_estado'),
    path('crear/', views.pedido_crear, name='pedido_crear'),
    path('pago/iniciar/', views.pago_iniciar, name='pago_iniciar'),
    path('pago/webpay-mock/', views.webpay_mock, name='webpay_mock'),
    path('pago/retorno/', views.pago_retorno, name='pago_retorno'),
]
