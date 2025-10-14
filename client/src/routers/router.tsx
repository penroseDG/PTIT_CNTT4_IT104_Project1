import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import SignIn from "../components/forms/SignIn";
import SignUp from "../components/forms/SignUp";
import LoginAdmin from "../components/forms/LoginAdmin";
import Admin from "../layout/Admin";
import Dashboard from "../pages/admin/Dashboard";
import Category from "../pages/admin/Category";
import CategoryUser from "../pages/user/CategoryUser";
import Users from "../pages/admin/Users";
import User from "../layout/User";
import Home from "../pages/user/Home";
import History from "../pages/user/History";



const router = createBrowserRouter([

    //User 
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <SignIn />
            },
            {
                path: "signin",
                element: <SignIn />
            },
            {
                path: "signup",
                element: <SignUp />
            },
        ],
    },

    {
        path: "/userhome",
        element: <User />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: "category",
                element: <CategoryUser />
            },
            {
                path: "history",
                element: <History />
            },
        ],
    },
    
    //Admin 

    {
        path: "/admin/login",
        element: <LoginAdmin />
    },
    {
        path: "/admin",
        element: <Admin />,
        children: [
            {
                index: true,
                element: <Dashboard />
            },
            {
                path: "/admin/dashboard",
                element: <Dashboard />,
            },
            {
                path: "/admin/category",
                element: <Category />
            },
            {
                path: "/admin/Users",
                element: <Users />
            },

        ],
    },

    // Error 
    {
        path: "*",
        element: <div>404 - Not found</div>
    },
]);

export default router;  
