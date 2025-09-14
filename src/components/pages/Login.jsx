import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(email, password);
      navigate("/");
    } catch (err) {
      console.error("failed to login: " + err.message);
    }

    setLoading(false);
  }

  return (
    <>
      <button className="toHomeBtn z-2">
        <Link to={"/"}>home</Link>
      </button>
      <div className="container-fluid m-0 row justify-content-center align-items-center">
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(circle at top center, rgba(163, 163, 163, 0.64), transparent 70%)",
            zIndex: 1,
          }}
        />
        <form
          onSubmit={handleSubmit}
          className="logForm col-lg-2 col-10 text-center z-2"
        >
          <h4 className="mb-4">log in</h4>
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
            {loading ? "Logging in..." : "Login"}
          </button>
          <div className="mb-2">
            <Link to={"/password-reset"}>forgot password ?</Link>
          </div>
          <div>
            <Link to={"/signup"}>no account ?</Link>
          </div>
        </form>
      </div>
    </>
  );
}
