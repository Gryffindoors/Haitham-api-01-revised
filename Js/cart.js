// Helper functions for localStorage
function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Function to render the cart
function renderCart() {
    const cart = getFromLocalStorage('cart');
    const cartContainer = document.getElementById('cartContainer');
    const cartTotalElement = document.getElementById('cartTotal');
    cartContainer.innerHTML = ''; // Clear previous content

    let total = 0;

    cart.forEach(item => {
        // Fetch product details by ID (you might have to modify this if your API structure changes)
        fetch(`https://fakestoreapi.com/products/${item.id}`)
            .then(response => response.json())
            .then(product => {
                const subtotal = product.price * item.quantity;
                total += subtotal;

                const cartItemHTML = `
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title text-center">${product.title}</h5>
                                <p class="card-text"><strong>Price:</strong> $${product.price}</p>
                                <p class="card-text"><strong>Quantity:</strong> 
                                    <input type="number" value="${item.quantity}" min="1" class="cart-quantity" data-id="${item.id}">
                                </p>
                                <p class="card-text"><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
                                <button class="btn btn-danger remove-item" data-id="${item.id}">Remove</button>
                            </div>
                        </div>
                    </div>
                `;

                cartContainer.innerHTML += cartItemHTML;

                // Update total
                cartTotalElement.textContent = total.toFixed(2);

                // Add event listeners for quantity changes and removal
                addCartEventListeners();
            });
    });
}

// Update quantity or remove item
function addCartEventListeners() {
    const quantityInputs = document.querySelectorAll('.cart-quantity');
    const removeButtons = document.querySelectorAll('.remove-item');

    quantityInputs.forEach(input => {
        input.addEventListener('change', event => {
            const id = parseInt(event.target.dataset.id, 10);
            const quantity = parseInt(event.target.value, 10);

            const cart = getFromLocalStorage('cart');
            const item = cart.find(i => i.id === id);
            if (item) {
                item.quantity = quantity;
                saveToLocalStorage('cart', cart);
                renderCart();
            }
        });
    });

    removeButtons.forEach(button => {
        button.addEventListener('click', event => {
            const id = parseInt(event.target.dataset.id, 10);
            let cart = getFromLocalStorage('cart');
            cart = cart.filter(item => item.id !== id);
            saveToLocalStorage('cart', cart);
            renderCart();
        });
    });
}

// Initialize cart rendering
document.addEventListener('DOMContentLoaded', renderCart);
