import { RouteObject } from 'react-router-dom';
import RootLayout, { RequireAdmin, RequireAuth, RequireCartNotEmpty } from '../layouts/RootLayout';
import Home from '../pages/Home';
import Product from '../pages/Product';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import OrderDetail from '../pages/OrderDetail';
import AdminDashboard from '../pages/Admin/Dashboard';
import AdminProducts from '../pages/Admin/Products';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AdminOrders from '../pages/Admin/Orders';
import AdminOrderDetail from '../pages/Admin/OrderDetail';
import NewAddress from '../pages/Addresses/NewAddress';
import ListAddresses from '../pages/Addresses/ListAddresses';
import AdminBanners from '../pages/Admin/AdminBanners';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'product/:slug', element: <Product /> },
      { path: 'cart', element: <Cart /> },
      {
        path: 'checkout',
        element: (
          <RequireAuth>
            <RequireCartNotEmpty>
              <Checkout />
            </RequireCartNotEmpty>
          </RequireAuth>
        ),
      },
      {
        path: 'orders',
        element: (
          <RequireAuth>
            <Orders />
          </RequireAuth>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <RequireAuth>
            <OrderDetail />
          </RequireAuth>
        ),
      },

      // Admin
      {
        path: 'admin',
        element: (
          <RequireAuth>
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          </RequireAuth>
        ),
      },
      {
        path: 'admin/products',
        element: (
          <RequireAuth>
            <RequireAdmin>
              <AdminProducts />
            </RequireAdmin>
          </RequireAuth>
        ),
      },
      {
        path: 'admin/banners',
        element: (
          <RequireAuth>
            <RequireAdmin>
              <AdminBanners />
            </RequireAdmin>
          </RequireAuth>
        ),
      },
      {
        path: 'admin/orders',
        element: (
          <RequireAuth>
            <RequireAdmin>
              <AdminOrders />
            </RequireAdmin>
          </RequireAuth>
        ),
      },
      {
        path: 'admin/orders/:id',
        element: (
          <RequireAuth>
            <RequireAdmin>
              <AdminOrderDetail />
            </RequireAdmin>
          </RequireAuth>
        ),
      },

      // Address book
      {
        path: 'addresses',
        element: (
          <RequireAuth>
            <ListAddresses />
          </RequireAuth>
        ),
      },
      {
        path: 'addresses/new',
        element: (
          <RequireAuth>
            <NewAddress />
          </RequireAuth>
        ),
      },

      // Auth
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
];

export default routes;
