import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function ForgetPassword() {
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
        <form className="logForm col-lg-2 col-10 text-center z-2">
          <h4 className="mb-4">password reset</h4>
          <div className="inputContainer">
            <label className="d-block pb-2" htmlFor="email">
              <strong>email address</strong>
            </label>
            <input type="email" id="email" />
          </div>
          <button className="logBtn my-3 d-block mx-auto">
            reset password
          </button>
          <div>
            <Link to={"/login"}>login</Link>
          </div>
        </form>
      </div>
    </>
  );
}
