import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  return (
    <div className="login-page">
      <div className="overlay"></div>

      <div className="left-section">
        <h1>StreamWeaver</h1>
        <h2>Streamline. Weave. Deliver.</h2>
        <p>
          Real-time streaming platform with secure authentication,
          analytics and seamless content delivery.
        </p>
      </div>

      <div className="login-card">
        <h2>Welcome Back</h2>
        <p>Sign in to continue</p>

        <input
          type="email"
          placeholder="Enter your email"
        />

        <input
          type="password"
          placeholder="Enter your password"
        />

        <button type="button" onClick={() => navigate("/dashboard")}>
          Sign In
        </button>
      </div>
    </div>
  );
}

export default Login;