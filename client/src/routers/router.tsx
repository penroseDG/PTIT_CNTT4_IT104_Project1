import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import SignIn from "../components/forms/SignIn";
import SignUp from "../components/forms/SignUp";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,                
    children: [
      { index: true, element: <SignIn /> },  
      { path: "signin", element: <SignIn /> },
      { path: "signup", element: <SignUp /> },
    ],
  },
  { path: "*", element: <div>404 - Not found</div> },
]);

export default router;
