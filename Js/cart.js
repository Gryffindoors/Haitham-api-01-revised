// Helper functions for localStorage
function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Function 1: Load cart from localStorage and initialize rendering
function loadMemory() {
    const cart = getFromLocalStorage('cart');
    renderCart(cart);
}

// Function 2: Render the cart (Read operation)
function renderCart(cart) {
    const cartContainer = document.getElementById('cartContainer');
    const cartTotalElement = document.getElementById('cartTotal');
    cartContainer.innerHTML = ''; // Clear previous content

    let total = 0; // Initialize total

    // Create an array of fetch promises
    const fetchPromises = cart.map(item => {
        return fetch(`https://fakestoreapi.com/products/${item.id}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(product => {
                const subtotal = product.price * item.quantity;
                total += subtotal;

                const cartItemHTML = `
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title text-center">${product.title}</h5>
                                <p class="card-text"><strong>Price:</strong> $${product.price}</p>
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
                    </div>
                `;

                cartContainer.innerHTML += cartItemHTML;
            })
            .catch(error => console.error('Error fetching product:', error));
    });

    // Wait for all fetch promises to resolve
    Promise.all(fetchPromises).then(() => {
        cartTotalElement.textContent = total.toFixed(2); // Update total after all items processed
    });
}

// Function 3: Update item quantity (Update operation)
function updateItemQuantity(id, quantity) {
    const cart = getFromLocalStorage('cart');
    const item = cart.find(i => i.id === id); // Assuming id is a string in cart

    if (item) {
        console.log(`Updating quantity for item ID: ${id} to ${quantity}`);
        item.quantity = quantity;
        saveToLocalStorage('cart', cart); // Save updated cart immediately
    }
    renderCart(cart); // Re-render the cart
}

// Function 4: Delete item from cart (Delete operation)
function deleteItem(id) {
    let cart = getFromLocalStorage('cart');
    console.log(`Deleting item ID: ${id}`);
    cart = cart.filter(item => item.id !== id); // Assuming id is a string in cart
    saveToLocalStorage('cart', cart); // Save updated cart immediately
    renderCart(cart); // Re-render the cart
}

// Function 5: Add event listeners for update and delete buttons
document.addEventListener('click', function(event) {
    if (event.target.matches('.update-btn')) {
        const id = event.target.getAttribute('data-id');
        const quantityInput = document.querySelector(`.cart-quantity[data-id="${id}"]`);
        if (!quantityInput) {
            console.error(`Input field not found for item ID: ${id}`);
            return;
        }
        const quantity = parseInt(quantityInput.value, 10);
        console.log(`Update button clicked for item ID: ${id}, new quantity: ${quantity}`);
        updateItemQuantity(id, quantity);
    }

    if (event.target.matches('.remove-item')) {
        const id = event.target.getAttribute('data-id');
        console.log(`Delete button clicked for item ID: ${id}`);
        deleteItem(id);
    }
});

// Initialize cart rendering
document.addEventListener('DOMContentLoaded', loadMemory);