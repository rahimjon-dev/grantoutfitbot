import { db } from '../services/supabase.js';

export const productController = {
  async getCategories(req, res) {
    try {
      const categories = await db.getCategories();
      res.json({ success: true, data: categories });
    } catch (err) {
      console.error('Error in getCategories:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getProducts(req, res) {
    try {
      const { category, search, sort, featured, limit, offset } = req.query;
      const products = await db.getProducts({
        categorySlug: category,
        search,
        sort,
        isFeatured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0
      });
      res.json({ success: true, data: products, count: products.length });
    } catch (err) {
      console.error('Error in getProducts:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await db.getProductById(id);
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      res.json({ success: true, data: product });
    } catch (err) {
      console.error('Error in getProductById:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
