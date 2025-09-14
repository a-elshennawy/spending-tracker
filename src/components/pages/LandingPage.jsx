import { Link } from "react-router-dom";
import Home from "./Home";
import { useAuth } from "../contexts/AuthContext";

export default function LandingPage() {
  const { currentUser } = useAuth();

  return (
    <>
      {currentUser ? (
        <Home />
      ) : (
        <>
          <div className="bgLayer"></div>
          <section className="container-fluid m-0 landingPage">
            <div className="innerDev text-center row justify-content-center align-items-center">
              <div className="text col-12">
                <h1>deposite, withdraw, track</h1>
                <h3>as simple as that...</h3>
              </div>
              <div className="action col-12">
                <button className="signUpBtn">
                  <Link to={"/signup"}>start now!</Link>
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
