"""
Mixins for Ferremas Frontend views.
Contains common functionality that can be reused across views.
"""

from django.shortcuts import redirect
from django.contrib import messages
from django.http import JsonResponse
from utils.constants import USER_ROLES, MESSAGES
from utils.decorators import login_required_custom, role_required
import logging

logger = logging.getLogger(__name__)


class AuthRequiredMixin:
    """Mixin to require authentication for views."""
    
    def dispatch(self, request, *args, **kwargs):
        user = request.session.get('user')
        if not user:
            messages.error(request, MESSAGES['LOGIN_REQUIRED'])
            return redirect('core:login')
        return super().dispatch(request, *args, **kwargs)


class RoleRequiredMixin:
    """Mixin to require specific roles for views."""
    
    required_roles = []
    
    def dispatch(self, request, *args, **kwargs):
        user = request.session.get('user')
        if not user:
            messages.error(request, MESSAGES['LOGIN_REQUIRED'])
            return redirect('core:login')
        
        user_role = user.get('rol')
        if user_role not in self.required_roles:
            messages.error(request, MESSAGES['PERMISSION_DENIED'])
            return redirect('core:dashboard')
        
        return super().dispatch(request, *args, **kwargs)


class AdminRequiredMixin(RoleRequiredMixin):
    """Mixin for admin-only views."""
    required_roles = [USER_ROLES['ADMIN']]


class StaffRequiredMixin(RoleRequiredMixin):
    """Mixin for staff members (Admin, Warehouse, Seller)."""
    required_roles = [
        USER_ROLES['ADMIN'],
        USER_ROLES['WAREHOUSE'], 
        USER_ROLES['SELLER']
    ]


class AjaxRequiredMixin:
    """Mixin to ensure view only accepts AJAX requests."""
    
    def dispatch(self, request, *args, **kwargs):
        if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse(
                {'error': 'Esta vista solo acepta peticiones AJAX.'}, 
                status=400
            )
        return super().dispatch(request, *args, **kwargs)


class APIResponseMixin:
    """Mixin to handle API responses consistently."""
    
    def handle_api_response(self, response, success_message=None, error_message=None):
        """
        Handle API response and return appropriate Django response.
        
        Args:
            response: API response object
            success_message: Success message to show (optional)
            error_message: Error message to show (optional)
            
        Returns:
            Dict with success status and data/message
        """
        if not response:
            return {
                'success': False,
                'message': error_message or 'Error de conexión con el servidor'
            }
        
        if response.status_code in [200, 201]:
            try:
                data = response.json()
                return {
                    'success': True,
                    'data': data,
                    'message': success_message
                }
            except ValueError:
                return {
                    'success': True,
                    'message': success_message or 'Operación completada exitosamente'
                }
        else:
            try:
                error_data = response.json()
                message = error_data.get('message', error_message or 'Error en la operación')
            except ValueError:
                message = error_message or f'Error HTTP {response.status_code}'
            
            return {
                'success': False,
                'message': message
            }
    
    def add_message_from_result(self, request, result):
        """Add Django message based on result."""
        if result['success']:
            if result.get('message'):
                messages.success(request, result['message'])
        else:
            messages.error(request, result['message'])


class PaginationMixin:
    """Mixin to handle pagination consistently."""
    
    paginate_by = 20
    
    def get_page_number(self, request):
        """Get current page number from request."""
        try:
            return int(request.GET.get('page', 1))
        except (ValueError, TypeError):
            return 1
    
    def get_paginate_by(self):
        """Get number of items per page."""
        return getattr(self, 'paginate_by', 20)


class FormValidationMixin:
    """Mixin to handle form validation consistently."""
    
    def validate_form_data(self, request, required_fields):
        """
        Validate required form fields.
        
        Args:
            request: Django request object
            required_fields: List of required field names
            
        Returns:
            Tuple (is_valid, cleaned_data, errors)
        """
        cleaned_data = {}
        errors = []
        
        for field in required_fields:
            value = request.POST.get(field, '').strip()
            if not value:
                errors.append(f'El campo {field} es requerido.')
            else:
                cleaned_data[field] = value
        
        return len(errors) == 0, cleaned_data, errors


class LoggingMixin:
    """Mixin to add consistent logging to views."""
    
    def log_user_action(self, request, action, details=None):
        """Log user action with consistent format."""
        user = request.session.get('user', {})
        user_info = f"User {user.get('id', 'Unknown')} ({user.get('email', 'Unknown')})"
        
        log_message = f"{user_info} - {action}"
        if details:
            log_message += f" - {details}"
        
        logger.info(log_message)
    
    def log_error(self, request, error, context=None):
        """Log error with context."""
        user = request.session.get('user', {})
        user_info = f"User {user.get('id', 'Unknown')} ({user.get('email', 'Unknown')})"
        
        log_message = f"{user_info} - Error: {str(error)}"
        if context:
            log_message += f" - Context: {context}"
        
        logger.error(log_message, exc_info=True)


class ContextMixin:
    """Mixin to add common context to templates."""
    
    def get_base_context(self, request):
        """Get base context that should be available in all templates."""
        user = request.session.get('user')
        carrito = request.session.get('carrito', {})
        
        return {
            'user': user,
            'carrito': carrito,
            'carrito_count': sum(carrito.values()) if carrito else 0,
            'is_authenticated': bool(user),
            'is_admin': user.get('rol') == USER_ROLES['ADMIN'] if user else False,
            'is_staff': user.get('rol') in [
                USER_ROLES['ADMIN'],
                USER_ROLES['WAREHOUSE'],
                USER_ROLES['SELLER']
            ] if user else False,
        }


class CrudMixin:
    """Mixin for common CRUD operations."""
    
    def get_list_context(self, request, items, title, create_url=None):
        """Get context for list views."""
        context = self.get_base_context(request)
        context.update({
            'items': items,
            'title': title,
            'create_url': create_url,
        })
        return context
    
    def get_form_context(self, request, form, title, action, item=None, 
                        cancel_url=None, extra_context=None):
        """Get context for form views."""
        context = self.get_base_context(request)
        context.update({
            'form': form,
            'title': title,
            'action': action,
            'item': item,
            'cancel_url': cancel_url,
        })
        
        if extra_context:
            context.update(extra_context)
        
        return context