"""
Decorators for Ferremas Frontend views and functions.
"""

from functools import wraps
from django.shortcuts import redirect
from django.contrib import messages
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)


def login_required_custom(view_func):
    """
    Custom login required decorator that checks session.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user = request.session.get('user')
        if not user:
            messages.error(request, 'Debe iniciar sesión para acceder a esta página.')
            return redirect('core:login')
        return view_func(request, *args, **kwargs)
    return wrapper


def role_required(*allowed_roles):
    """
    Decorator to require specific roles.
    
    Usage:
        @role_required('Administrador', 'Bodeguero')
        def my_view(request):
            pass
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            user = request.session.get('user')
            if not user:
                messages.error(request, 'Debe iniciar sesión.')
                return redirect('core:login')
            
            user_role = user.get('rol')
            if user_role not in allowed_roles:
                messages.error(request, f'No tiene permisos para acceder a esta página. Se requiere rol: {", ".join(allowed_roles)}')
                return redirect('core:dashboard')
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def ajax_required(view_func):
    """
    Decorator to ensure request is AJAX.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': 'Esta vista solo acepta peticiones AJAX.'}, status=400)
        return view_func(request, *args, **kwargs)
    return wrapper


def handle_exceptions(default_response=None):
    """
    Decorator to handle exceptions in views.
    
    Args:
        default_response: Default response if exception occurs
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            try:
                return view_func(request, *args, **kwargs)
            except Exception as e:
                logger.error(f"Error in view {view_func.__name__}: {str(e)}", exc_info=True)
                
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({'error': 'Ha ocurrido un error inesperado.'}, status=500)
                
                messages.error(request, 'Ha ocurrido un error inesperado. Por favor, intente nuevamente.')
                
                if default_response:
                    return default_response
                
                return redirect('core:dashboard')
        return wrapper
    return decorator


def log_user_action(action_description):
    """
    Decorator to log user actions.
    
    Args:
        action_description: Description of the action being performed
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            user = request.session.get('user')
            user_info = f"User {user.get('id')} ({user.get('email')})" if user else "Anonymous user"
            
            logger.info(f"{user_info} - {action_description} - View: {view_func.__name__}")
            
            result = view_func(request, *args, **kwargs)
            
            # Log successful completion
            logger.info(f"{user_info} - {action_description} completed successfully")
            
            return result
        return wrapper
    return decorator


def cache_control(**kwargs):
    """
    Decorator to set cache control headers.
    
    Usage:
        @cache_control(max_age=3600, public=True)
        def my_view(request):
            pass
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            from django.views.decorators.cache import cache_control as django_cache_control
            decorated_view = django_cache_control(**kwargs)(view_func)
            return decorated_view(request, *args, **kwargs)
        return wrapper
    return decorator


def admin_required(view_func):
    """
    Shortcut decorator for admin-only views.
    """
    return role_required('Administrador')(view_func)


def staff_required(view_func):
    """
    Decorator for staff members (Administrador, Bodeguero, Vendedor).
    """
    return role_required('Administrador', 'Bodeguero', 'Vendedor')(view_func)