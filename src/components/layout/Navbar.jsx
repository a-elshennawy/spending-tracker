import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { IoMdLogIn, IoMdLogOut } from "react-icons/io";
import { FcHome } from "react-icons/fc";

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
      <nav
        className={
          !currentUser || location.pathname !== "/transactions"
            ? "startNav"
            : ""
        }
      >
        {currentUser ? (
          <>
            {location.pathname === "/transactions" && (
              <button className="navHomeBtn">
                <Link to={"/"}>
                  <FcHome size={24} />
                </Link>
              </button>
            )}
            <button className="logoutBtn" onClick={handleLogout}>
              <IoMdLogOut size={24} />
            </button>
          </>
        ) : (
          <button className="logInBtn">
            <Link to={"/login"}>
              <IoMdLogIn size={24} />
            </Link>
          </button>
        )}
      </nav>
    </>
  );
}
