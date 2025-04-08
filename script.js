import { db } from '../firebase.js';
import { showToast } from './main.js';

// Product Manager Class
class ProductManager {
    constructor() {
        this.products = [];
        this.filters = {
            category: 'all',
            sortBy: 'price_low_to_high',
            priceRange: [0, 100000],
            ratings: 0
        };
    }

    async loadProducts() {
        try {
            const snapshot = await db.collection('products').get();
            this.products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.renderProducts();
        } catch (error) {
            showToast('Failed to load products', 'error');
        }
    }

    renderProducts() {
        const grid = document.querySelector('.product-grid');
        grid.innerHTML = '';

        this.products
            .filter(product => this.applyFilters(product))
            .sort(this.sortProducts())
            .forEach(product => {
                const card = this.createProductCard(product);
                grid.appendChild(card);
            });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                ${product.discount > 0 ? 
                    `<div class="product-badge">${product.discount}% OFF</div>` : ''}
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-details">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    ${this.generateRatingStars(product.rating)}
                </div>
                <div class="product-pricing">
                    <span class="product-price">₹${product.price.toLocaleString()}</span>
                    ${product.originalPrice ? 
                        `<span class="product-original-price">₹${product.originalPrice.toLocaleString()}</span>` : ''}
                    ${product.discount ? 
                        `<span class="product-discount">${product.discount}% off</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="add-to-cart-btn" data-id="${product.id}">
                        Add to Cart
                    </button>
                    <button class="buy-now-btn" data-id="${product.id}">
                        Buy Now
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    generateRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        
        return `
            ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
            ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
            ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
            <span class="rating-count">(${Math.floor(Math.random() * 1000)})</span>
        `;
    }
}

// Initialize Product System
export function initProducts() {
    const productManager = new ProductManager();
    productManager.loadProducts();
}
