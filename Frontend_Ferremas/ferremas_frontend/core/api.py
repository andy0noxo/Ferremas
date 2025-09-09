import requests
import logging
from django.conf import settings
from django.contrib import messages

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

def api_request(method, endpoint, request, **kwargs):
    """
    Helper para consumir la API del backend con autenticación JWT.
    method: 'get', 'post', 'put', 'delete'
    endpoint: ruta relativa (ej: '/productos')
    request: objeto request de Django
    kwargs: params, json, data, etc.
    """
    url = settings.BACKEND_URL.rstrip('/') + endpoint
    headers = kwargs.pop('headers', {})
    headers.update({
        'Origin': f'http://localhost:{request.META.get("SERVER_PORT", "8000")}',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    })
    
    token = request.session.get('token')
    if token:
        headers['Authorization'] = f'Bearer {token}'

    try:
        logger.debug(f"Making {method.upper()} request to {url}")
        logger.debug(f"Request headers: {headers}")
        if 'json' in kwargs:
            logger.debug(f"Request body: {kwargs['json']}")

        response = requests.request(method, url, headers=headers, timeout=10, **kwargs)
        
        logger.debug(f"Response status: {response.status_code}")
        logger.debug(f"Response headers: {dict(response.headers)}")
        logger.debug(f"Response body: {response.text}")
        
        if response.status_code == 401:
            logger.warning(f"Unauthorized access attempt to {endpoint}")
            request.session.flush()
            messages.error(request, 'Sesión expirada. Inicie sesión nuevamente.')
        elif 400 <= response.status_code < 500:
            try:
                error_data = response.json()
                error_msg = error_data.get('message', None)
                if error_msg:
                    messages.error(request, error_msg)
                    logger.error(f"API client error: {error_msg}")
            except ValueError:
                messages.error(request, 'Error en la solicitud')
                logger.error(f"API client error: {response.text}")
        elif response.status_code >= 500:
            messages.error(request, 'Error en el servidor. Por favor, intente más tarde.')
            logger.error(f"API server error: {response.text}")
            
        return response

    except requests.ConnectionError as e:
        logger.error(f"Connection error accessing {url}: {str(e)}")
        messages.error(request, 'No se pudo conectar con el servidor. Verifique que el backend esté corriendo.')
        return None
    except requests.Timeout as e:
        logger.error(f"Timeout error accessing {url}: {str(e)}")
        messages.error(request, 'La solicitud al servidor ha tardado demasiado. Por favor, intente nuevamente.')
        return None
    except Exception as e:
        logger.error(f"Unexpected error accessing {url}", exc_info=True)
        messages.error(request, 'Ha ocurrido un error inesperado. Por favor, intente más tarde.')
        return None
