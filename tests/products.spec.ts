import { test, expect } from '@playwright/test';
import { ProductsController } from '@controllers/ProductsController';
import { Product, ProductsResponse } from '@types/product';

test.describe('DummyJSON Products API', () => {
    let api: ProductsController;

    test.beforeEach(async ({ request }) => {
        api = new ProductsController(request);
    });

    test('should fetch all products with sorting', async () => {
        const response = await api.getAllProducts({
            limit: 5,
            sortBy: 'title',
            order: 'desc'
        });
        expect(response.status()).toBe(200);

        const body: ProductsResponse = await response.json();
        expect(body.products).toHaveLength(5);

        const titles = body.products.map(p => p.title);
        const sortedTitles = [...titles].sort((a, b) => b.localeCompare(a));
        expect(titles).toEqual(sortedTitles);
    });

    test('should fetch product categories', async () => {
        const response = await api.getProductCategories();
        expect(response.status()).toBe(200);

        const categories = await response.json();
        expect(Array.isArray(categories)).toBe(true);
        expect(categories.length).toBeGreaterThan(0);
        expect(categories[0]).toHaveProperty('slug');
        expect(categories[0]).toHaveProperty('name');
        expect(categories[0]).toHaveProperty('url');
    });

    test('should fetch product category list', async () => {
        const response = await api.getProductCategoryList();
        expect(response.status()).toBe(200);

        const categoryList = await response.json();
        expect(Array.isArray(categoryList)).toBe(true);
        expect(typeof categoryList[0]).toBe('string');
    });

    test('should fetch products by category', async () => {
        const category = 'smartphones';
        const response = await api.getProductsByCategory(category);
        expect(response.status()).toBe(200);

        const body: ProductsResponse = await response.json();
        expect(body.products.length).toBeGreaterThan(0);
        body.products.forEach(product => {
            expect(product.category).toBe(category);
        });
    });

    test('should search products with pagination and selection', async () => {
        const query = 'phone';
        const response = await api.searchProducts(query, {
            limit: 2,
            skip: 1,
            select: 'title,price'
        });
        expect(response.status()).toBe(200);

        const body: ProductsResponse = await response.json();
        expect(body.products.length).toBeLessThanOrEqual(2);

        const product = body.products[0];

        expect(product).toHaveProperty('title');
        expect(product).toHaveProperty('price');
        expect(Object.keys(product)).not.toContain('description');
        expect(Object.keys(product)).not.toContain('stock');
    });

    test('should add a new product', async () => {
        const productData = {
            title: 'Test Product',
            price: 100,
            stock: 50,
            rating: 4.5,
            images: ['https://example.com/image.jpg'],
            thumbnail: 'https://example.com/thumbnail.jpg',
            description: 'This is a test product',
            brand: 'Test Brand',
            category: 'smartphones'
        };

        const response = await api.addProduct(productData);
        expect(response.ok()).toBeTruthy();

        const product = await response.json();
        expect(product).toHaveProperty('id');
        expect(product.title).toBe(productData.title);
        expect(product.price).toBe(productData.price);
    });

    test('should update a product', async () => {
        const productId = 111;
        const updateData = {
            title: 'Updated Title'
        };

        const response = await api.updateProduct(productId, updateData);
        expect(response.ok()).toBeTruthy();

        const product = await response.json();
        expect(product.id).toBe(productId);
        expect(product.title).toBe(updateData.title);
    });

    test('should delete a product', async () => {
        const productId = 111;
        const response = await api.deleteProduct(productId);
        expect(response.ok()).toBeTruthy();

        const result = await response.json();
        expect(result.id).toBe(productId);
        expect(result.isDeleted).toBe(true);
        expect(result).toHaveProperty('deletedOn');
    });
});