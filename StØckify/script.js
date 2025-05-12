// DOM Elements
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const cartBtn = document.getElementById('cart-btn');
const sellProductBtn = document.getElementById('sell-product-btn');

const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const sellModal = document.getElementById('sell-modal');
const cartModal = document.getElementById('cart-modal');
const reviewModal = document.getElementById('review-modal');

const closeLogin = document.getElementById('close-login');
const closeSignup = document.getElementById('close-signup');
const closeSell = document.getElementById('close-sell');
const closeCart = document.getElementById('close-cart');
const closeReview = document.getElementById('close-review');

const cancelLogin = document.getElementById('cancel-login');
const cancelSignup = document.getElementById('cancel-signup');
const cancelSell = document.getElementById('cancel-sell');
const continueShopping = document.getElementById('continue-shopping');
const cancelReview = document.getElementById('cancel-review');

const categoryLinks = document.querySelectorAll('.category-list a');
const productCards = document.querySelectorAll('.product-card');
const addToCartBtns = document.querySelectorAll('.add-to-cart');
const favoriteBtns = document.querySelectorAll('.favorite-btn');

// State
let cart = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentProductForReview = null;

// Initialize
function init() {
    updateCartCount();
    updateFavorites();
    document.querySelector('.category-list a[data-category="all"]').click();
}

// Event Listeners
loginBtn.addEventListener('click', () => loginModal.style.display = 'flex');
signupBtn.addEventListener('click', () => signupModal.style.display = 'flex');
cartBtn.addEventListener('click', () => {
    updateCartDisplay();
    cartModal.style.display = 'flex';
});
sellProductBtn.addEventListener('click', () => sellModal.style.display = 'flex');

closeLogin.addEventListener('click', () => loginModal.style.display = 'none');
closeSignup.addEventListener('click', () => signupModal.style.display = 'none');
closeSell.addEventListener('click', () => sellModal.style.display = 'none');
closeCart.addEventListener('click', () => cartModal.style.display = 'none');
closeReview.addEventListener('click', () => reviewModal.style.display = 'none');

cancelLogin.addEventListener('click', () => loginModal.style.display = 'none');
cancelSignup.addEventListener('click', () => signupModal.style.display = 'none');
cancelSell.addEventListener('click', () => sellModal.style.display = 'none');
continueShopping.addEventListener('click', () => cartModal.style.display = 'none');
cancelReview.addEventListener('click', () => reviewModal.style.display = 'none');

// Category filtering
categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.getAttribute('data-category');
        
        // Update active state
        categoryLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        productCards.forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Add to cart functionality
addToCartBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const productCard = btn.closest('.product-card');
        const productName = productCard.querySelector('.product-name').textContent;
        const productPrice = productCard.querySelector('.product-price').textContent;
        
        // Add to cart
        cart.push({
            name: productName,
            price: productPrice
        });
        
        // Update cart button
        updateCartCount();
        
        // Show confirmation
        showToast(`${productName} added to cart!`);
    });
});

// Favorite functionality
favoriteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const productCard = btn.closest('.product-card');
        const productName = productCard.querySelector('.product-name').textContent;
        
        btn.classList.toggle('active');
        
        if (btn.classList.contains('active')) {
            favorites.push(productName);
            showToast(`${productName} added to favorites!`);
        } else {
            favorites = favorites.filter(name => name !== productName);
            showToast(`${productName} removed from favorites!`);
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
    });
});

// Review functionality
productCards.forEach(card => {
    card.addEventListener('click', (e) => {
        // Don't open review if clicking on favorite button or add to cart
        if (e.target.closest('.favorite-btn') || e.target.closest('.add-to-cart')) {
            return;
        }
        
        const productName = card.querySelector('.product-name').textContent;
        currentProductForReview = productName;
        reviewModal.style.display = 'flex';
    });
});

// Rating stars interaction
const stars = document.querySelectorAll('.rating-stars i');
stars.forEach(star => {
    star.addEventListener('click', () => {
        const rating = parseInt(star.getAttribute('data-rating'));
        document.getElementById('review-rating').value = rating;
        
        stars.forEach((s, index) => {
            if (index < rating) {
                s.classList.add('active');
                s.classList.remove('far');
                s.classList.add('fas');
            } else {
                s.classList.remove('active');
                s.classList.add('far');
                s.classList.remove('fas');
            }
        });
    });
    
    star.addEventListener('mouseover', () => {
        const rating = parseInt(star.getAttribute('data-rating'));
        
        stars.forEach((s, index) => {
            if (index < rating) {
                s.classList.add('hover');
            } else {
                s.classList.remove('hover');
            }
        });
    });
    
    star.addEventListener('mouseout', () => {
        stars.forEach(s => s.classList.remove('hover'));
    });
});

// Update cart count display
function updateCartCount() {
    cartBtn.textContent = `Cart (${cart.length})`;
}

// Update favorites display
function updateFavorites() {
    favoriteBtns.forEach(btn => {
        const productCard = btn.closest('.product-card');
        const productName = productCard.querySelector('.product-name').textContent;
        
        if (favorites.includes(productName)) {
            btn.classList.add('active');
        }
    });
}

// Update cart display in modal
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        checkoutBtn.disabled = true;
    } else {
        let html = '<ul style="list-style: none; margin-bottom: 20px;">';
        cart.forEach(item => {
            html += `
                <li style="padding: 10px 0; border-bottom: 1px solid #eee;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>${item.name}</span>
                        <span>${item.price}</span>
                    </div>
                </li>
            `;
        });
        html += '</ul>';
        
        // Calculate total
        const total = cart.reduce((sum, item) => {
            return sum + parseInt(item.price.replace(/[^\d]/g, ''), 10);
        }, 0);
        
        html += `<div style="text-align: right; font-weight: bold; margin-top: 10px;">Total: ₱${total.toLocaleString()}</div>`;
        
        cartItems.innerHTML = html;
        checkoutBtn.disabled = false;
    }
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

// Form submissions
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Login functionality would be implemented here');
    loginModal.style.display = 'none';
});

document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Signup functionality would be implemented here');
    signupModal.style.display = 'none';
});

document.getElementById('sell-form').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Product listing functionality would be implemented here');
    sellModal.style.display = 'none';
});

document.getElementById('review-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const rating = document.getElementById('review-rating').value;
    const comment = document.getElementById('review-comment').value;
    
    showToast(`Thank you for your ${rating}-star review for ${currentProductForReview}!`);
    reviewModal.style.display = 'none';
    
    // Reset form
    document.getElementById('review-form').reset();
    stars.forEach(star => {
        star.classList.remove('active');
        star.classList.add('far');
        star.classList.remove('fas');
    });
});

document.getElementById('checkout').addEventListener('click', () => {
    showToast('Checkout functionality would be implemented here');
    cart = [];
    updateCartCount();
    cartModal.style.display = 'none';
});

// Initialize the app
init();