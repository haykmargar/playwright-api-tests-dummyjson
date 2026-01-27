import { test, expect } from '@playwright/test';
import { ProductsController } from '@controllers/ProductsController';
import { ProductsResponse, ProductsResponseSchema, ErrorResponseSchema } from '@types/product';
import { HttpStatus } from '@constants/httpStatus';

test.describe('DummyJSON Products API', () => {
  let api: ProductsController;

  test.beforeEach(async ({ request }) => {
    api = new ProductsController(request);
  });

  test.describe('Positive Scenarios', { tag: '@positive' }, () => {
    test('should fetch all products with sorting', { tag: '@smoke' }, async () => {
      const response = await api.getAllProducts({
        limit: 5,
        sortBy: 'title',
        order: 'desc'
      });
      expect(response.status()).toBe(HttpStatus.OK);

      const body: ProductsResponse = await response.json();
      expect(body.products).toHaveLength(5);

      const titles = body.products.map((p) => p.title);
      const sortedTitles = [...titles].sort((a, b) => b.localeCompare(a));
      expect(titles).toEqual(sortedTitles);
    });

    test('should fetch product categories', async () => {
      const response = await api.getProductCategories();
      expect(response.status()).toBe(HttpStatus.OK);

      const categories = await response.json();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toHaveProperty('slug');
      expect(categories[0]).toHaveProperty('name');
      expect(categories[0]).toHaveProperty('url');
    });

    test('should fetch product category list', async () => {
      const response = await api.getProductCategoryList();
      expect(response.status()).toBe(HttpStatus.OK);

      const categoryList = await response.json();
      expect(Array.isArray(categoryList)).toBe(true);
      expect(typeof categoryList[0]).toBe('string');
    });

    test('should fetch products by category', async () => {
      const category = 'smartphones';
      const response = await api.getProductsByCategory(category);
      expect(response.status()).toBe(HttpStatus.OK);

      const body: ProductsResponse = await response.json();
      expect(body.products.length).toBeGreaterThan(0);
      body.products.forEach((product) => {
        expect(product.category).toBe(category);
      });
    });

    test('should search products with pagination and selection', { tag: '@smoke' }, async () => {
      const query = 'phone';
      const response = await api.searchProducts(query, {
        limit: 2,
        skip: 1,
        select: 'title,price'
      });
      expect(response.status()).toBe(HttpStatus.OK);

      const body: ProductsResponse = await response.json();
      expect(body.products.length).toBeLessThanOrEqual(2);

      const product = body.products[0];

      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('price');
      expect(Object.keys(product)).not.toContain('description');
      expect(Object.keys(product)).not.toContain('stock');
    });

    test('should add a new product', { tag: '@smoke' }, async () => {
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
      expect(response.ok()).toBeTruthy(); // DummyJSON returns 200 for add, not 201

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
      expect(response.ok()).toBeTruthy(); // DummyJSON returns 200 for update

      const product = await response.json();
      expect(product.id).toBe(productId);
      expect(product.title).toBe(updateData.title);
    });

    test('should delete a product', async () => {
      const productId = 111;
      const response = await api.deleteProduct(productId);
      expect(response.ok()).toBeTruthy(); // DummyJSON returns 200 for delete

      const result = await response.json();
      expect(result.id).toBe(productId);
      expect(result.isDeleted).toBe(true);
      expect(result).toHaveProperty('deletedOn');
    });
  });

  test.describe('Negative Scenarios', { tag: '@negative' }, () => {
    test('should return 404 for non-existent product ID', async () => {
      const nonExistentId = 999999;
      const response = await api.getProductById(nonExistentId);

      expect(response.status()).toBe(HttpStatus.NOT_FOUND);

      const body = await response.json();

      ErrorResponseSchema.parse(body);
      expect(body.message).toContain(`Product with id '${nonExistentId}' not found`);
    });

    test(`should return ${HttpStatus.NOT_FOUND} for product ID 0`, async () => {
      const zeroId = 0;
      const response = await api.getProductById(zeroId);

      expect(response.status()).toBe(HttpStatus.NOT_FOUND);

      const body = await response.json();
      ErrorResponseSchema.parse(body);
      expect(body.message).toContain(`Product with id '${zeroId}' not found`);
    });

    test(`should return ${HttpStatus.NOT_FOUND} for product ID -1`, async () => {
      const negativeId = -1;
      const response = await api.getProductById(negativeId);

      expect(response.status()).toBe(HttpStatus.NOT_FOUND);

      const body = await response.json();
      ErrorResponseSchema.parse(body);
      expect(body.message).toContain(`Product with id '${negativeId}' not found`);
    });

    test('should handle invalid ID format (String instead of Number)', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.getProductById('invalid-id' as any);

      expect(response.status()).toBe(HttpStatus.NOT_FOUND);

      const body = await response.json();
      ErrorResponseSchema.parse(body);
    });

    test('should return safe response when searching with SQL Injection characters', async () => {
      const maliciousQuery = "' OR 1=1 --";
      const response = await api.searchProducts(maliciousQuery);

      expect(response.status()).not.toBe(HttpStatus.INTERNAL_SERVER_ERROR);

      const body = await response.json();
      ProductsResponseSchema.parse(body);
    });

    test('should fail gracefully when updating with invalid data types', async () => {
      const invalidPayload = {
        price: 'This should be a number'
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.updateProduct(1, invalidPayload as any);

      expect(response.status()).toBe(HttpStatus.BAD_REQUEST);

      const body = await response.json();
      ErrorResponseSchema.parse(body);
    });

    test(`should return ${HttpStatus.NOT_FOUND} when updating a non-existent product`, async () => {
      const nonExistentId = 999999;
      const updateData = { title: 'Non Existent Update' };
      const response = await api.updateProduct(nonExistentId, updateData);

      expect(response.status()).toBe(HttpStatus.NOT_FOUND);

      const body = await response.json();
      ErrorResponseSchema.parse(body);
      expect(body.message).toContain(`Product with id '${nonExistentId}' not found`);
    });

    test(`should return ${HttpStatus.NOT_FOUND} when deleting a non-existent product`, async () => {
      const nonExistentId = 999999;
      const response = await api.deleteProduct(nonExistentId);

      expect(response.status()).toBe(HttpStatus.NOT_FOUND);

      const body = await response.json();
      ErrorResponseSchema.parse(body);
      expect(body.message).toContain(`Product with id '${nonExistentId}' not found`);
    });
  });
});
