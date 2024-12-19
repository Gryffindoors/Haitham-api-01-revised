// Select the dropdown menu element
const categoriesDropdown = document.getElementById('categories');

// Function to fetch and populate categories
function menuCategories() {
    // Fetch categories from the API
    fetch('https://fakestoreapi.com/products/categories')
        .then(response => response.json()) // Parse JSON response
        .then(categories => {
            // Sort categories alphabetically
            categories.sort((a, b) => a.localeCompare(b)); // Sorts alphabetically

            // Loop through categories and add them to the dropdown
            categories.forEach(category => {
                const li = document.createElement('li');
                li.innerHTML = `<a class="dropdown-item text-capitalize" href="#${category}">${category}</a>`;
                categoriesDropdown.appendChild(li);

                // Add a divider after each category
                const divider = document.createElement('li');
                divider.innerHTML = `<hr class="dropdown-divider">`;
                categoriesDropdown.appendChild(divider);
            });
        });
}

// Call the function to populate categories
menuCategories();

// Select the elements
const categoryTitle = document.getElementById('categoryTitle'); // Category title
// Select the container for all products
const singleProductContainer = document.getElementById('singleProduct'); // Product container

// Function to fetch all categories and their products
function fetchAllCategories() {
    // Fetch the list of categories
    fetch('https://fakestoreapi.com/products/categories')
        .then(response => response.json()) // Parse JSON response
        .then(categories => {
            // Sort categories alphabetically
            categories.sort((a, b) => a.localeCompare(b)); // Sorts alphabetically

            // For each category, fetch and display its products
            categories.forEach(category => {
                fetchProductsByCategory(category);
            });
        });
}

// Function to fetch and display products for a single category
function fetchProductsByCategory(category) {
    fetch(`https://fakestoreapi.com/products/category/${category}`)
        .then(response => response.json()) // Parse JSON response
        .then(products => {
            // Step 1: Create a category title
            const categoryTitleHTML = `
                <h2 class="category my-5 text-center text-uppercase" id="${category}">${category}</h2>
            `;
            singleProductContainer.innerHTML += categoryTitleHTML;

            // Step 2: Populate product cards for this category
            let productCardsHTML = '<div class="row">';
            products.forEach(product => {
                productCardsHTML += `
                <div class="col-md-6 col-sm-12 col-lg-3 p-3 mx-auto">
                    <div class="d-flex flex-column card product-card">
                        <h3 class="product card-title p-3 fs-4">${product.title}</h3>
                        <img src="${product.image}" loading="lazy" alt="${product.title}" class="image-display mx-auto rounded-3 my-1">
                        <p class="text mx-2"><strong class="title">Price:</strong> $${product.price}</p>
                        <p class="text mx-2"><strong class="title">Rating:</strong> ${product.rating.rate} <small>(${product.rating.count} reviews)</small></p>
                        <p class="text mx-2"><strong class="title">Description:</strong> ${product.description}</p>
                    </div>
                </div>`;
            });
            productCardsHTML += '</div>'; // Close the row

            // Step 3: Append product cards to the container
            singleProductContainer.innerHTML += productCardsHTML;
        });
}

// Fetch all categories and their products on page load
fetchAllCategories();
