// Helper functions for Local Storage
function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Update Cart Badge with Total Items
function updateCartBadge() {
    const cart = getFromLocalStorage('cart');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.querySelector('.badge');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
    }
}

// Get product ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id'), 10); // Ensure productId is a number

// Render product details
function renderProductDetails() {
    fetch(`https://fakestoreapi.com/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            const productDetailsContainer = document.getElementById('productDetails');
            const productHTML = `
                <div class="col-md-6">
                    <img src="${product.image}" class="img-fluid rounded" alt="${product.title}">
                </div>
                <div class="col-md-6">
                    <h1>${product.title}</h1>
                    <p><strong>Price:</strong> $${product.price}</p>
                    <p><strong>Rating:</strong> ${product.rating.rate} (${product.rating.count} reviews)</p>
                    <p>${product.description}</p>
                    <div class="d-flex align-items-center">
                        <label for="quantity" class="me-2"><strong>Quantity:</strong></label>
                        <input type="number" id="quantity" value="1" min="1" class="form-control w-25">
                    </div>
                    <button class="btn btn-primary mt-3" id="addToCart" data-id="${product.id}" data-title="${product.title}" data-price="${product.price}">Add to Cart</button>
                </div>
            `;
            productDetailsContainer.innerHTML = productHTML;

            // Add event listener to "Add to Cart" button
            document.getElementById('addToCart').addEventListener('click', () => {
                const quantityInput = document.getElementById('quantity');
                const quantity = parseInt(quantityInput.value, 10);

                if (isNaN(quantity) || quantity <= 0) {
                    alert('Please enter a valid quantity greater than 0.');
                    return;
                }

                addToCart(product.id, product.title, product.price, quantity);
            });
        })
        .catch(error => console.error('Error fetching product details:', error));
}

// Add product to cart
function addToCart(productId, productTitle, productPrice, quantity) {
    let cart = getFromLocalStorage('cart');
    productId = parseInt(productId, 10); // Ensure ID is a number

    const existingProduct = cart.find(item => item.id === productId);
    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        cart.push({ id: productId, title: productTitle, price: productPrice, quantity });
    }

    saveToLocalStorage('cart', cart);
    updateCartBadge();
    showToast('Product added to cart successfully!');
}

// Function to display a toast
function showToast(message) {
    const toastContainer = document.createElement('div');
    toastContainer.classList.add('toast', 'align-items-center', 'text-bg-success', 'border-0', 'position-fixed', 'bottom-0', 'end-0', 'm-3');
    toastContainer.style.zIndex = '1050';

    toastContainer.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    document.body.appendChild(toastContainer);

    const toast = new bootstrap.Toast(toastContainer);
    toast.show();

    toastContainer.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toastContainer);
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    renderProductDetails();
    updateCartBadge();
});
