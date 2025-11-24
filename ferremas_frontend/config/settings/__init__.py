"""
Django settings selector for Ferremas Frontend.

This module automatically imports the appropriate settings based on the 
DJANGO_ENVIRONMENT environment variable.

Environment options:
- development (default)
- production
- testing
"""

import os

# Get the environment from environment variable, default to development
ENVIRONMENT = os.getenv('DJANGO_ENVIRONMENT', 'development').lower()

if ENVIRONMENT == 'production':
    from .production import *
elif ENVIRONMENT == 'testing':
    from .testing import *
else:
    from .development import *

# Make the current environment available
CURRENT_ENVIRONMENT = ENVIRONMENT