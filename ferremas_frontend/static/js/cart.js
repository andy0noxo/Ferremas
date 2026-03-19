
document.addEventListener('DOMContentLoaded', function() {
    // Escuchar clicks en el botón del carrito
    const cartTrigger = document.getElementById('cart-trigger');
    if (cartTrigger) {
        cartTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            openCart();
        });
    }

    // Cerrar modal al hacer click fuera
    const modal = document.getElementById('cart-modal');
    if (modal) {
        window.addEventListener('click', function(e) {
            if (e.target == modal) {
                closeCart();
            }
        });
    }
});

function openCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = 'block';
        fetchCart();
    }
}

function closeCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function fetchCart() {
    fetch('/api/carrito/')
        .then(response => response.json())
        .then(data => renderCart(data))
        .catch(error => console.error('Error fetching cart:', error));
}

function renderCart(data) {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-amount');
    const badge = document.getElementById('cart-count-badge');
    
    if (badge) badge.textContent = data.count;
    if (totalEl) totalEl.textContent = formatCurrency(data.total); // Implement formatCurrency
    
    container.innerHTML = '';
    
    if (data.items.length === 0) {
        container.innerHTML = '<div class="empty-cart-msg">Tu carrito está vacío</div>';
        document.getElementById('cart-checkout-btn').disabled = true;
        return;
    }
    
    document.getElementById('cart-checkout-btn').disabled = false;

    data.items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div class="cart-item-details">
                <strong>${item.nombre}</strong>
                <div>${formatCurrency(item.precio)} x ${item.cantidad}</div>
            </div>
            <div class="cart-item-actions">
                <button class="btn-qty" onclick="updateCartItem('${item.id}', 'add', -1)">-</button>
                <span>${item.cantidad}</span>
                <button class="btn-qty" onclick="updateCartItem('${item.id}', 'add', 1)">+</button>
                <button class="btn-remove" onclick="updateCartItem('${item.id}', 'remove')">×</button>
            </div>
        `;
        container.appendChild(itemEl);
    });
}


function updateCartItem(pid, action, qty) {
    // Si la acción es 'add' con qty negativo (-1), y la cantidad actual es 1, podríamos querer eliminarlo o no hacer nada.
    // La API manejará update si enviamos update.
    
    // Simplificación: usaremos 'add' para +1 y -1.
    // 'remove' para borrar.
    
    const payload = {
        action: action,
        pid: pid,
        qty: qty
    };

    return fetch('/api/carrito/', { // Return promise to allow chaining
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text || response.statusText) });
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'ok') {
            fetchCart(); // Recargar carrito
            return true;
        } else {
            console.error('Error updating cart:', data.message);
            alert('Error al actualizar el carrito: ' + (data.message || 'Desconocido'));
            return false;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error conectando con el servidor. Revise la consola.');
        return false;
    });
}

function addToCart(pid, qty=1) {
    // Buscar todos los botones de ese producto para deshabilitarlos
    const buttons = document.querySelectorAll(`button[onclick*="'${pid}'"]`);
    buttons.forEach(btn => {
        btn.dataset.originalText = btn.innerText;
        btn.innerText = 'Agregando...';
        btn.disabled = true;
    });

    updateCartItem(pid, 'add', qty)
        .then(result => {
             if(result) openCart(); 
        })
        .finally(() => {
            buttons.forEach(btn => {
                if(btn.dataset.originalText) btn.innerText = btn.dataset.originalText;
                btn.disabled = false;
            });
        });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
