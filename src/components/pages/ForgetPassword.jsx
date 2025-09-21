import { Link } from "react-router-dom";

export default function ForgetPassword() {
  return (
    <>
      <button className="toHomeBtn z-2">
        <Link to={"/"}>home</Link>
      </button>
      <div className="container-fluid m-0 row justify-content-center align-items-center">
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
