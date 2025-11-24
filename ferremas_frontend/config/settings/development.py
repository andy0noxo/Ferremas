"""
Development settings for Ferremas Frontend.
"""

from .base import *

# ============================================================================
# DEVELOPMENT SPECIFIC SETTINGS
# ============================================================================

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# ============================================================================
# DEVELOPMENT DATABASE - DISABLED (Frontend only)
# ============================================================================

# Django configured as frontend-only - minimal local database needed
# All data is fetched from Node.js backend API
# SQLite used only for Django internals (sessions, messages, etc.)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'frontend_dev.db',  # Minimal local DB for Django internals
    }
}

# ============================================================================
# DEVELOPMENT STATIC FILES
# ============================================================================

# Allow serving static files in development
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# ============================================================================
# DEVELOPMENT CACHE
# ============================================================================

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# ============================================================================
# DEVELOPMENT SECURITY SETTINGS
# ============================================================================

# Disable security features for development
SECURE_SSL_REDIRECT = False
SECURE_BROWSER_XSS_FILTER = False
SECURE_CONTENT_TYPE_NOSNIFF = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# ============================================================================
# DEVELOPMENT LOGGING
# ============================================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'core': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# ============================================================================
# BACKEND API CONFIGURATION
# ============================================================================
# Django frontend communicates exclusively with Node.js backend
# Architecture: Django (Frontend) → Node.js (Backend) → MySQL (Database)

BACKEND_URL = 'http://localhost:3000'
BACKEND_API_TIMEOUT = 30  # Longer timeout for development

# ============================================================================
# DEVELOPMENT TOOLS
# ============================================================================

# Add django-extensions if available
try:
    import django_extensions
    INSTALLED_APPS += ['django_extensions']
except ImportError:
    pass

# Add django-debug-toolbar if available
try:
    import debug_toolbar
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE = ['debug_toolbar.middleware.DebugToolbarMiddleware'] + MIDDLEWARE
    INTERNAL_IPS = ['127.0.0.1', 'localhost']
    DEBUG_TOOLBAR_CONFIG = {
        'SHOW_TOOLBAR_CALLBACK': lambda request: DEBUG,
    }
except ImportError:
    pass