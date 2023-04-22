import { useState } from "react";
import FirebaseAuthService from "../FirebaseAuthService";

function LoginForm({ existingUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    // In order to prevent the default behaviour of HTML, Javascript,
    // i.e. to submit this to server
    event.preventDefault();

    // This try catch is a Javascript best practice for handling the response, of asynchronous requests and promises
    // We don't need to handle the specific response of this function because of how Firebase auth package works.
    // If this successfully goes through, it's going to set the user in the state,
    // which is then going to trigger the onchange of the state, is going to then trigger the set user in the app.js,
    // which will then pass down the user as a property of existing user to this component.
    try {
      await FirebaseAuthService.loginUser(username, password);
      setUsername("");
      setPassword("");
    } catch (error) {
      alert(error.message);
    }
  }

  function handleLogout() {
    FirebaseAuthService.logoutUser();
  }

  async function handleSendResetPasswordEmail() {
    if (!username) {
      alert("Missing username!");
      return;
    }

    try {
      await FirebaseAuthService.sendPasswordResetEmail(username);
    } catch (error) {
      alert(error.message);
    }
  }

  // async function handleLoginWithGoogle() {
  //   try {
  //     await FirebaseAuthService.loginWithGoogle();
  //   } catch (error) {
  //     alert(error.message);
  //   }
  // }

  return (
    <div className="login-form-container">
      {/* conditional statment with 2 cases when user is loggedin or not */}
      {existingUser ? (
        <div className="row">
          <h3>Welcome, {existingUser.email}</h3>
          <button
            // Always a good practice to define the type as button if it's not meant to submit the form.
            type="button"
            className="primary-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="login-form">
          <label className="input-label login-label">
            Username (email):
            <input
              type="email"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-text"
            />
          </label>

          <label className="input-label login-label">
            Password:
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-text"
            />
          </label>
          <div className="button-box">
            <button className="primary-button">Login</button>
            <button
              type="button"
              onClick={handleSendResetPasswordEmail}
              className="primary-button"
            >
              Reset Password
            </button>

            {/* <button
              type="button"
              onClick={handleLoginWithGoogle}
              className="primary-button"
            >
              Login with Google
            </button> */}
          </div>
        </form>
      )}
    </div>
  );
}

export default LoginForm;
