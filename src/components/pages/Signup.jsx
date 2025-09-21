import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      const userCredential = await signup(email, password);

      const user = userCredential.user;

      await setDoc(doc(db, "wallets", user.uid), {
        balance: 0,
        currency: "EGP",
        email: user.email,
        transactions: [],
      });

      navigate("/");
    } catch (error) {
      console.error("failed to sign up:", error.message);
      setError("Failed to create an account.");
    }

    setLoading(false);
  }

  return (
    <>
      <button className="toHomeBtn z-2">
        <Link to={"/"}>home</Link>
      </button>
      <div className="container-fluid m-0 row justify-content-center align-items-center">
        <form
          onSubmit={handleSubmit}
          className="logForm col-lg-2 col-10 text-center z-2 m-0"
        >
          {error && <div className="alert alert-danger">{error}</div>}
          <h4 className="mb-4">sign up</h4>
          <div className="inputContainer">
            <label className="d-block pb-2" htmlFor="email">
              <strong>email address</strong>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="inputContainer">
            <label className="d-block pb-2" htmlFor="password">
              <strong>password</strong>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="logBtn my-3 d-block mx-auto"
            disabled={loading}
            type="submit"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
          <div>
            <Link to={"/login"}>already have an account ?</Link>
          </div>
        </form>
      </div>
    </>
  );
}
