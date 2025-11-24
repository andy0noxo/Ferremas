from django.urls import path
from . import views

app_name = 'pedidos'

urlpatterns = [
    path('', views.pedidos_list, name='pedidos_list'),
    path('<int:pedido_id>/', views.pedido_detalle, name='pedido_detalle'),
    path('crear/', views.pedido_crear, name='pedido_crear'),
]
