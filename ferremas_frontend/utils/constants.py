"""
Constants for Ferremas Frontend application.
"""

# HTTP Status Codes
HTTP_STATUS = {
    'OK': 200,
    'CREATED': 201,
    'BAD_REQUEST': 400,
    'UNAUTHORIZED': 401,
    'FORBIDDEN': 403,
    'NOT_FOUND': 404,
    'METHOD_NOT_ALLOWED': 405,
    'CONFLICT': 409,
    'INTERNAL_SERVER_ERROR': 500,
}

# User Roles
USER_ROLES = {
    'ADMIN': 'Administrador',
    'SELLER': 'Vendedor',
    'WAREHOUSE': 'Bodeguero',
    'ACCOUNTANT': 'Contador',
    'CLIENT': 'Cliente',
}

# Role Permissions
ROLE_PERMISSIONS = {
    'Administrador': [
        'manage_users',
        'manage_products',
        'manage_stock',
        'view_reports',
        'manage_orders',
        'manage_system',
    ],
    'Bodeguero': [
        'manage_products',
        'manage_stock',
        'view_orders',
    ],
    'Vendedor': [
        'view_products',
        'view_stock',
        'manage_orders',
        'view_customers',
    ],
    'Contador': [
        'view_reports',
        'view_orders',
        'view_products',
    ],
    'Cliente': [
        'view_products',
        'manage_own_orders',
        'view_own_profile',
    ],
}

# Order Status
ORDER_STATUS = {
    'PENDING': 'pendiente',
    'APPROVED': 'aprobado',
    'REJECTED': 'rechazado',
    'PREPARED': 'preparado',
    'SHIPPED': 'despachado',
    'DELIVERED': 'entregado',
}

ORDER_STATUS_DISPLAY = {
    'pendiente': 'Pendiente',
    'aprobado': 'Aprobado',
    'rechazado': 'Rechazado',
    'preparado': 'Preparado',
    'despachado': 'Despachado',
    'entregado': 'Entregado',
}

# Payment Methods
PAYMENT_METHODS = {
    'DEBIT': 'debito',
    'CREDIT': 'credito',
    'TRANSFER': 'transferencia',
}

PAYMENT_METHODS_DISPLAY = {
    'debito': 'Débito',
    'credito': 'Crédito',
    'transferencia': 'Transferencia',
}

# Payment Status
PAYMENT_STATUS = {
    'PENDING': 'pendiente',
    'COMPLETED': 'completado',
    'FAILED': 'fallido',
}

PAYMENT_STATUS_DISPLAY = {
    'pendiente': 'Pendiente',
    'completado': 'Completado',
    'fallido': 'Fallido',
}

# Application Messages
MESSAGES = {
    'LOGIN_REQUIRED': 'Debe iniciar sesión para acceder a esta página.',
    'PERMISSION_DENIED': 'No tiene permisos para realizar esta acción.',
    'LOGIN_SUCCESS': 'Ha iniciado sesión correctamente.',
    'LOGIN_FAILED': 'Credenciales inválidas.',
    'LOGOUT_SUCCESS': 'Ha cerrado sesión correctamente.',
    'ITEM_CREATED': '{} creado exitosamente.',
    'ITEM_UPDATED': '{} actualizado exitosamente.',
    'ITEM_DELETED': '{} eliminado exitosamente.',
    'ITEM_NOT_FOUND': '{} no encontrado.',
    'CONNECTION_ERROR': 'Error de conexión con el servidor.',
    'UNEXPECTED_ERROR': 'Ha ocurrido un error inesperado.',
    'FORM_INVALID': 'Corrija los errores en el formulario.',
    'CART_ITEM_ADDED': 'Producto agregado al carrito.',
    'CART_ITEM_REMOVED': 'Producto eliminado del carrito.',
    'ORDER_PLACED': 'Pedido realizado exitosamente.',
}

# Pagination
PAGINATION = {
    'DEFAULT_PER_PAGE': 20,
    'MAX_PER_PAGE': 100,
    'PRODUCTS_PER_PAGE': 12,
    'ORDERS_PER_PAGE': 15,
    'USERS_PER_PAGE': 25,
}

# File Upload
FILE_UPLOAD = {
    'MAX_FILE_SIZE': 5 * 1024 * 1024,  # 5MB
    'ALLOWED_IMAGE_TYPES': ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    'ALLOWED_DOCUMENT_TYPES': ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
    'IMAGE_MAX_WIDTH': 1920,
    'IMAGE_MAX_HEIGHT': 1080,
    'THUMBNAIL_SIZE': (300, 300),
}

# Cache Keys
CACHE_KEYS = {
    'PRODUCTS_LIST': 'products_list_{}',
    'PRODUCT_DETAIL': 'product_detail_{}',
    'CATEGORIES': 'categories_list',
    'BRANDS': 'brands_list',
    'STOCK_LIST': 'stock_list_{}',
    'USER_PERMISSIONS': 'user_permissions_{}',
}

# Cache Timeouts (in seconds)
CACHE_TIMEOUTS = {
    'SHORT': 300,      # 5 minutes
    'MEDIUM': 1800,    # 30 minutes
    'LONG': 3600,      # 1 hour
    'VERY_LONG': 86400, # 24 hours
}

# Business Rules
BUSINESS_RULES = {
    'MIN_PASSWORD_LENGTH': 8,
    'MAX_CART_ITEMS': 50,
    'MIN_ORDER_AMOUNT': 1000,  # CLP
    'MAX_ORDER_AMOUNT': 10000000,  # CLP
    'STOCK_WARNING_THRESHOLD': 10,
    'STOCK_CRITICAL_THRESHOLD': 5,
    'SESSION_TIMEOUT': 3600,  # 1 hour
    'MAX_LOGIN_ATTEMPTS': 3,
    'LOGIN_LOCKOUT_TIME': 900,  # 15 minutes
}

# Email Templates
EMAIL_TEMPLATES = {
    'ORDER_CONFIRMATION': 'emails/order_confirmation.html',
    'ORDER_STATUS_UPDATE': 'emails/order_status_update.html',
    'PASSWORD_RESET': 'emails/password_reset.html',
    'WELCOME': 'emails/welcome.html',
}

# Date Formats
DATE_FORMATS = {
    'DISPLAY': '%d/%m/%Y',
    'DISPLAY_WITH_TIME': '%d/%m/%Y %H:%M',
    'ISO': '%Y-%m-%d',
    'ISO_WITH_TIME': '%Y-%m-%d %H:%M:%S',
    'FILENAME': '%Y%m%d_%H%M%S',
}

# Currency
CURRENCY = {
    'CODE': 'CLP',
    'SYMBOL': '$',
    'DECIMAL_PLACES': 0,
}

# Application URLs
URLS = {
    'TERMS_OF_SERVICE': '/terminos-y-condiciones/',
    'PRIVACY_POLICY': '/politica-de-privacidad/',
    'CONTACT': '/contacto/',
    'HELP': '/ayuda/',
}

# Social Media (if needed)
SOCIAL_MEDIA = {
    'FACEBOOK': 'https://facebook.com/ferremas',
    'INSTAGRAM': 'https://instagram.com/ferremas',
    'TWITTER': 'https://twitter.com/ferremas',
    'LINKEDIN': 'https://linkedin.com/company/ferremas',
}

# API Endpoints (for frontend API consumption)
API_ENDPOINTS = {
    'AUTH_LOGIN': '/api/auth/login',
    'AUTH_REGISTER': '/api/auth/registro',
    'AUTH_LOGOUT': '/api/auth/logout',
    'PRODUCTS': '/api/productos',
    'CATEGORIES': '/api/categorias',
    'BRANDS': '/api/marcas',
    'USERS': '/api/usuarios',
    'ORDERS': '/api/pedidos',
    'STOCK': '/api/stock',
    'ROLES': '/api/roles',
    'SUCURSALES': '/api/sucursales',
}