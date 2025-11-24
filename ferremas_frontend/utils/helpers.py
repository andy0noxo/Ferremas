"""
Common utility functions for Ferremas Frontend.
"""

import re
from typing import Optional, Dict, Any
from decimal import Decimal


def format_currency(amount: float, currency: str = 'CLP') -> str:
    """
    Format amount as currency.
    
    Args:
        amount: The amount to format
        currency: Currency code (default: CLP)
        
    Returns:
        Formatted currency string
    """
    if currency == 'CLP':
        return f"${amount:,.0f}"
    return f"{currency} {amount:,.2f}"


def format_rut(rut: str) -> str:
    """
    Format Chilean RUT with dots and hyphen.
    
    Args:
        rut: Raw RUT string
        
    Returns:
        Formatted RUT (e.g., "12.345.678-9")
    """
    if not rut:
        return ""
    
    # Remove all non-alphanumeric characters
    clean_rut = re.sub(r'[^0-9Kk]', '', rut.upper())
    
    if len(clean_rut) < 2:
        return rut
    
    # Separate verification digit
    body = clean_rut[:-1]
    dv = clean_rut[-1]
    
    # Add dots every 3 digits from right to left
    formatted_body = ""
    for i, digit in enumerate(reversed(body)):
        if i > 0 and i % 3 == 0:
            formatted_body = "." + formatted_body
        formatted_body = digit + formatted_body
    
    return f"{formatted_body}-{dv}"


def validate_rut(rut: str) -> bool:
    """
    Validate Chilean RUT.
    
    Args:
        rut: RUT string to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not rut:
        return False
    
    # Remove formatting
    clean_rut = re.sub(r'[^0-9Kk]', '', rut.upper())
    
    if len(clean_rut) < 2:
        return False
    
    body = clean_rut[:-1]
    dv = clean_rut[-1]
    
    # Calculate verification digit
    multiplier = 2
    total = 0
    
    for digit in reversed(body):
        total += int(digit) * multiplier
        multiplier = multiplier + 1 if multiplier < 7 else 2
    
    remainder = total % 11
    calculated_dv = str(11 - remainder) if remainder > 1 else ('0' if remainder == 1 else 'K')
    
    return dv == calculated_dv


def validate_email(email: str) -> bool:
    """
    Basic email validation.
    
    Args:
        email: Email string to validate
        
    Returns:
        True if valid format, False otherwise
    """
    if not email:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def truncate_text(text: str, max_length: int = 50) -> str:
    """
    Truncate text with ellipsis.
    
    Args:
        text: Text to truncate
        max_length: Maximum length
        
    Returns:
        Truncated text with ellipsis if needed
    """
    if not text:
        return ""
    
    if len(text) <= max_length:
        return text
    
    return text[:max_length - 3] + "..."


def safe_int(value: Any, default: int = 0) -> int:
    """
    Safely convert value to integer.
    
    Args:
        value: Value to convert
        default: Default value if conversion fails
        
    Returns:
        Integer value or default
    """
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


def safe_decimal(value: Any, default: Decimal = Decimal('0')) -> Decimal:
    """
    Safely convert value to Decimal.
    
    Args:
        value: Value to convert
        default: Default value if conversion fails
        
    Returns:
        Decimal value or default
    """
    try:
        return Decimal(str(value))
    except (ValueError, TypeError, decimal.InvalidOperation):
        return default


def get_client_ip(request) -> str:
    """
    Get client IP address from request.
    
    Args:
        request: Django request object
        
    Returns:
        Client IP address
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


def clean_filename(filename: str) -> str:
    """
    Clean filename for safe storage.
    
    Args:
        filename: Original filename
        
    Returns:
        Cleaned filename
    """
    if not filename:
        return "unnamed_file"
    
    # Remove path separators and dangerous characters
    clean_name = re.sub(r'[^\w\-_\.]', '_', filename)
    
    # Remove multiple underscores
    clean_name = re.sub(r'_+', '_', clean_name)
    
    # Remove leading/trailing underscores and dots
    clean_name = clean_name.strip('_.')
    
    return clean_name or "unnamed_file"


def paginate_queryset(queryset, page_number: int, per_page: int = 20) -> Dict[str, Any]:
    """
    Simple pagination for querysets.
    
    Args:
        queryset: Django queryset
        page_number: Current page number (1-based)
        per_page: Items per page
        
    Returns:
        Dict with pagination info and objects
    """
    from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
    
    paginator = Paginator(queryset, per_page)
    
    try:
        page = paginator.page(page_number)
    except PageNotAnInteger:
        page = paginator.page(1)
    except EmptyPage:
        page = paginator.page(paginator.num_pages)
    
    return {
        'objects': page.object_list,
        'page': page,
        'paginator': paginator,
        'has_previous': page.has_previous(),
        'has_next': page.has_next(),
        'previous_page_number': page.previous_page_number() if page.has_previous() else None,
        'next_page_number': page.next_page_number() if page.has_next() else None,
    }