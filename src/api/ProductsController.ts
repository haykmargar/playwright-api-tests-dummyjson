import { APIRequestContext, APIResponse } from '@playwright/test';
import { Product } from '@types/product';

export class ProductsController {
    private request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    async getAllProducts(params?: { limit?: number; skip?: number; select?: string; sortBy?: string; order?: 'asc' | 'desc' }): Promise<APIResponse> {
        return this.request.get('/products', { params });
    }

    async getProductById(id: number): Promise<APIResponse> {
        return this.request.get(`/products/${id}`);
    }

    async searchProducts(query: string, params?: { limit?: number; skip?: number; select?: string }): Promise<APIResponse> {
        return this.request.get('/products/search', {
            params: { q: query, ...params }
        });
    }

    async getProductCategories(): Promise<APIResponse> {
        return this.request.get('/products/categories');
    }

    async getProductCategoryList(): Promise<APIResponse> {
        return this.request.get('/products/category-list');
    }

    async getProductsByCategory(category: string, params?: { limit?: number; skip?: number; select?: string; sortBy?: string; order?: 'asc' | 'desc' }): Promise<APIResponse> {
        return this.request.get(`/products/category/${category}`, { params });
    }

    async addProduct(productData: Partial<Product>): Promise<APIResponse> {
        return this.request.post('/products/add', {
            data: productData
        });
    }

    async updateProduct(id: number, productData: Partial<Product>): Promise<APIResponse> {
        return this.request.put(`/products/${id}`, {
            data: productData
        });
    }

    async deleteProduct(id: number): Promise<APIResponse> {
        return this.request.delete(`/products/${id}`);
    }
}