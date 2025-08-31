import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productsRoutes from './products.routes.js';
import ordersRoutes from './orders.routes.js';
import addressesRoutes from './addresses.routes.js';
import adminRoutes from './admin.routes.js';
import adminOrders from './admin.orders.js';
import adminProducts from './admin.products.js';
import adminCategories from './admin.categories.js';
import categoriesRouter from './categories.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/addresses', addressesRoutes);

router.use('/admin', adminRoutes);
router.use('/admin', adminOrders);
router.use('/admin', adminProducts);
router.use('/admin', adminCategories);

router.use(categoriesRouter);

export default router;
