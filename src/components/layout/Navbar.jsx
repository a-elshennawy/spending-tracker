import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("error logging out:", err);
    }
  }

  return (
    <>
      <nav className="container-fluid m-0">
        {currentUser ? (
          <>
            {location.pathname === "/transactions" && (
              <button className="toHomeBtn">
                <Link to={"/"}>home</Link>
              </button>
            )}
            <button className="logoutBtn" onClick={handleLogout}>
              sign out
            </button>
          </>
        ) : (
          <button className="logInBtn">
            <Link to={"/login"}>login</Link>
          </button>
        )}
      </nav>
    </>
  );
}
