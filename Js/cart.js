// Helper functions for localStorage
const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

const getFromLocalStorage = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

// Main cart operations object
const cartManager = {
    loadCart() {
        let cart = getFromLocalStorage('cart');
        cart = cart.sort((a, b) => a.id - b.id); // Sort cart by ID
        this.renderCart(cart);
    },

    renderCart(cart) {
        const cartContainer = document.getElementById('cartContainer');
        const cartTotalElement = document.getElementById('cartTotal');
        cartContainer.innerHTML = ''; // Clear previous content

        let total = 0; // Initialize total amount

        const fetchPromises = cart.map(item => {
            return fetch(`https://fakestoreapi.com/products/${item.id}`)
                .then(response => {
                    if (!response.ok) throw new Error('Failed to fetch product data.');
                    return response.json();
                })
                .then(product => {
                    const subtotal = product.price * item.quantity;
                    total += subtotal;

                    cartContainer.innerHTML += `
                        <div class="col-md-6 col-lg-4 mb-4">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title text-center">${product.title}</h5>
                                    <p class="card-text"><strong>Price:</strong> $${product.price.toFixed(2)}</p>
                                    <div class="d-flex align-items-baseline justify-content-around">
                                        <p class="card-text"><strong>Quantity:</strong>
                                            <input type="number" value="${item.quantity}" min="1" class="cart-quantity" data-id="${item.id}">
                                        </p>
                                        <button class="btn btn-success update-btn" data-id="${item.id}">Update</button>
                                    </div>
                                    <p class="card-text"><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
                                    <button class="btn btn-danger remove-item" data-id="${item.id}">Remove</button>
                                </div>
                            </div>
                        </div>`;
                })
                .catch(error => console.error('Error fetching product:', error));
        });

        Promise.all(fetchPromises).then(() => {
            cartTotalElement.textContent = `$${total.toFixed(2)}`;
            this.addEventListenersToCart(); // Attach dynamic event listeners
        });
    },

    updateItemQuantity(id, quantity) {
        const cart = getFromLocalStorage('cart');
        const item = cart.find(i => i.id === id);

        if (item) {
            item.quantity = quantity; // Update the quantity
            saveToLocalStorage('cart', cart); // Save changes
            this.renderCart(cart); // Re-render the cart
        } else {
            console.error(`Item with ID: ${id} not found.`);
        }
    },

    deleteItem(id) {
        let cart = getFromLocalStorage('cart');
        cart = cart.filter(item => item.id !== id); // Remove the item
        saveToLocalStorage('cart', cart); // Save changes
        this.renderCart(cart); // Re-render the cart
    },

    addEventListenersToCart() {
        document.querySelectorAll('.update-btn').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                const quantityInput = document.querySelector(`.cart-quantity[data-id="${id}"]`);

                if (!quantityInput) {
                    console.error(`Input field not found for item ID: ${id}`);
                    return;
                }

                const quantity = parseInt(quantityInput.value, 10);
                if (quantity > 0) {
                    this.updateItemQuantity(id, quantity);
                } else {
                    alert('Quantity must be at least 1.');
                }
            });
        });

        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                this.deleteItem(id);
            });
        });
    }
};

// Initialize cart on DOM load
document.addEventListener('DOMContentLoaded', () => cartManager.loadCart());
