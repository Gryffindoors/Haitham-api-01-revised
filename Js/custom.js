// Select the dropdown menu and other elements
const categoriesDropdown = document.getElementById('categories');
const singleProductContainer = document.getElementById('singleProduct');

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

// Function to fetch and populate categories in the dropdown
function menuCategories() {
    fetch('https://fakestoreapi.com/products/categories')
        .then(response => response.json())
        .then(categories => {
            categories.sort((a, b) => a.localeCompare(b)); // Sort categories alphabetically
            categories.forEach(category => {
                const li = document.createElement('li');
                li.innerHTML = `<a class="dropdown-item text-capitalize" href="#${category}">${category}</a>`;
                categoriesDropdown.appendChild(li);

                // Add a divider after each category
                const divider = document.createElement('li');
                divider.innerHTML = `<hr class="dropdown-divider">`;
                categoriesDropdown.appendChild(divider);
            });
        })
        .catch(error => console.error('Error fetching categories:', error));
}

// Function to fetch all categories and their products
function fetchAllCategories() {
    fetch('https://fakestoreapi.com/products/categories')
        .then(response => response.json())
        .then(categories => {
            categories.sort((a, b) => a.localeCompare(b)); // Sort categories alphabetically
            categories.forEach(category => {
                fetchProductsByCategory(category);
            });
        })
        .catch(error => console.error('Error fetching categories:', error));
}

// Function to fetch and display products by category
function fetchProductsByCategory(category) {
    fetch(`https://fakestoreapi.com/products/category/${category}`)
        .then(response => response.json())
        .then(products => {
            products.sort((a, b) => b.rating.rate - a.rating.rate); // Sort by rating

            // Step 1: Create a category title
            const categoryTitleHTML = `
                <h2 class="category my-5 text-center text-uppercase" id="${category}">${category}</h2>
            `;
            singleProductContainer.innerHTML += categoryTitleHTML;

            // Step 2: Populate product cards for this category
            let productCardsHTML = '<div class="row">';
            products.forEach((product, index) => {
                // Highlight the highest-rated product
                const highlightBadge = index === 0 
                    ? `<span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2">Top Rated</span>` 
                    : '';

                productCardsHTML += `
                <div class="col-md-6 col-sm-12 col-lg-3 p-3 mx-auto position-relative">
                    <div class="d-flex flex-column card product-card">
                        ${highlightBadge}
                        <a href="product.html?id=${product.id}" target="_blank" class="text-decoration-none text-dark">
                            <h3 class="product card-title p-3 fs-4">${product.title.slice(0, 20)}</h3>
                        </a>
                        <img src="${product.image}" loading="lazy" alt="${product.title.slice(0, 20)}" class="image-display mx-auto rounded-3 my-1">
                        <div class="d-flex align-items-center justify-content-between">
                            <p class="text mx-2"><strong class="title">Price:</strong> $${product.price}</p>
                            <button type="button" class="btn btn-primary bg-transparent border-0 add-to-cart" data-id="${product.id}" data-title="${product.title}" data-price="${product.price}">
                                <i class="fa-solid fa-cart-plus text-dark"></i>
                            </button>
                        </div>
                        <p class="text mx-2"><strong class="title">Rating:</strong> ${product.rating.rate} <small>(${product.rating.count} reviews)</small></p>
                        <p class="text mx-2"><strong class="title">Description:</strong> ${product.description.slice(0, 20)}</p>
                        <button type="button" class="btn btn-success mx-auto quick-view mb-5" data-title="${product.title}" data-description="${product.description}" data-image="${product.image}">Quick View</button>
                    </div>
                </div>`;
            });
            productCardsHTML += '</div>'; // Close the row

            singleProductContainer.innerHTML += productCardsHTML;

            // Add event listeners for Quick View and Add to Cart buttons
            addQuickViewListeners();
            addToCartListeners();
        })
        .catch(error => console.error(`Error fetching products for ${category}:`, error));
}

// Function to add Quick View button listeners
function addQuickViewListeners() {
    const quickViewButtons = document.querySelectorAll('.quick-view');
    quickViewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const title = button.dataset.title;
            const description = button.dataset.description;
            const image = button.dataset.image;
            showQuickView(title, description, image);
        });
    });
}

// Function to display the Quick View modal
function showQuickView(title, description, image) {
    const quickViewContainer = document.createElement('div');
    quickViewContainer.classList.add('quick-view-modal', 'position-fixed', 'top-0', 'start-0', 'w-100', 'h-100', 'd-flex', 'align-items-center', 'justify-content-center');
    quickViewContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    quickViewContainer.style.zIndex = '1050';

    quickViewContainer.innerHTML = `
        <div class="card text-dark bg-light p-4 rounded-3" style="width: 90%; max-width: 600px; overflow-y: auto; max-height: 90%;">
            <img src="${image}" class="card-img-top mb-3 rounded main-product" alt="${title}">
            <div class="card-body text-center">
                <h3 class="card-title">${title}</h3>
                <p class="card-text">${description}</p>
                <button type="button" class="btn btn-danger close-modal">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(quickViewContainer);

    quickViewContainer.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(quickViewContainer);
    });

    quickViewContainer.addEventListener('click', (event) => {
        if (event.target === quickViewContainer) {
            document.body.removeChild(quickViewContainer);
        }
    });
}

// Function to add "Add to Cart" button listeners
function addToCartListeners() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.id;
            const productTitle = button.dataset.title;
            const productPrice = parseFloat(button.dataset.price);
            addToCart(productId, productTitle, productPrice);
        });
    });
}

// Add product to cart
function addToCart(productId, productTitle, productPrice) {
    let cart = getFromLocalStorage('cart');
    const existingProduct = cart.find(item => item.id === productId);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ id: productId, title: productTitle, price: productPrice, quantity: 1 });
    }
    saveToLocalStorage('cart', cart);
    updateCartBadge();
    alert('Product added to cart!');
}

// Initialize the main page
document.addEventListener('DOMContentLoaded', () => {
    menuCategories();
    fetchAllCategories();
    updateCartBadge();
});
