import LayoutDefault from "../pages/Layout/LayoutDefault";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AboutUs from "../pages/About us";
import Contact from "../pages/Contact";
import Logout from "../pages/Logout";
import User from "../pages/User";
import Cart from "../pages/Cart";

import LayoutDefaultAdmin from "../Admin/Layout/LayoutDefaultAdmin";
import UserAccounts from "../Admin/Page/UserAccounts";
import CategoryManagement from "../Admin/Page/CategoryManagement";
import ProductList from "../pages/Product/ProductList";
import ProductDetail from "../pages/Product/ProductDetail";
import ProductManagement from "../Admin/Page/ProductManagement";
import Profile from "../Admin/Layout/LayoutDefaultAdmin/Profile";
import Analytics from "../Admin/Page/Analytics";
import CouponManagement from "../Admin/Page/CouponManagement";
import InvoiceManagement from "../Admin/Page/InvoiceManagement";
import Checkout from "../pages/Checkout";
import SearchPage from "../pages/SearchPage";


export const routes = [
  {
    path: "/",
    element: <LayoutDefault />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "about-us",
        element: <AboutUs />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "logout",
        element: <Logout />,
      },
      {
        path: "category/:categoryId",
        element: <ProductList />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "user",
        element: <User />,
      },
      {
        path: "product/:id",
        element: <ProductDetail />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "checkout",
        element: <Checkout />,
      },
    ],
  },

  {
    path: "/admin",
    element: <LayoutDefaultAdmin />,
    children: [
      {
        index: true,
        element: <Analytics />,
      },
      {
        path: "user-accounts",
        element: <UserAccounts />,
      },
      {
        path: "category-management",
        element: <CategoryManagement />,
      },
      {
        path: "product-management",
        element: <ProductManagement />,
      },
      {
        path: "coupon-management",
        element: <CouponManagement />,
      },
      {
        path: "invoice-management",
        element: <InvoiceManagement />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
];
