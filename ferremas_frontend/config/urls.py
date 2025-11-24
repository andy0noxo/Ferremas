"""
URL configuration for Ferremas Frontend (Django).

This is a frontend-only Django application that communicates with Node.js backend.
Architecture: Django (Frontend) → Node.js (Backend) → MySQL (Database)

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
# from django.contrib import admin  # Disabled - no admin needed for frontend-only
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import render

def handler404(request, exception):
    return render(request, 'core/404.html', status=404)

urlpatterns = [
    # path('admin/', admin.site.urls),  # Disabled - no admin interface
    # path('pedidos/', include(('pedidos.urls', 'pedidos'), namespace='pedidos')),  # Handled by core
    path('', include(('core.urls', 'core'), namespace='core')),  # All routes through core app
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
