import "./App.css";
import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Loader from "./components/reusables/Loader";

const LandingPage = lazy(() => import("./components/pages/LandingPage"));
const Transactions = lazy(() => import("./components/pages/Transactions"));
const Login = lazy(() => import("./components/pages/Login"));
const Signup = lazy(() => import("./components/pages/Signup"));

function App() {
  return (
    <>
      <Router>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<LandingPage />} />
              <Route path="transactions" element={<Transactions />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}

export default App;
