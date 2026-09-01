import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const EMAIL_PATTERN = /^[a-zA-Z][a-zA-Z0-9._-]*@(gmail\.com|mail\.com)$/;

function getPasswordChecks(password) {
  return {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;/'`~]/.test(password),
  };
}

function isStrongPassword(password) {
  const checks = getPasswordChecks(password);
  return checks.length && checks.letter && checks.number && checks.special;
}

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const passwordChecks = getPasswordChecks(password);
  const passwordStrong = isStrongPassword(password);

  function validateEmail(value) {
    if (!value.trim()) {
      return "Email is required.";
    }
    if (!EMAIL_PATTERN.test(value.trim())) {
      return "Use your name followed by @gmail.com or @mail.com (e.g. priya@gmail.com).";
    }
    return "";
  }

  function validatePassword(value) {
    if (!value) {
      return "Password is required.";
    }
    if (!isStrongPassword(value)) {
      return "Password must include letters, numbers, and a special character.";
    }
    return "";
  }

  function handleSignIn(e) {
    e.preventDefault();
    setSubmitted(true);

    const emailMsg = validateEmail(email);
    const passwordMsg = validatePassword(password);

    setEmailError(emailMsg);
    setPasswordError(passwordMsg);

    if (emailMsg || passwordMsg) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const storedUser = storedUsers.find(
      (user) => user.email.toLowerCase() === normalizedEmail
    );

    if (!storedUser) {
      setEmailError("No account found with this email. Please create an account first.");
      return;
    }

    if (storedUser.password !== password) {
      setPasswordError("Incorrect password for this account.");
      return;
    }

    const userName = normalizedEmail.split("@")[0];
    const baseUserName = userName.replace(/[^a-zA-Z]/g, "") || "User";
    const savedUserId =
      storedUser.userId || `${baseUserName.charAt(0).toUpperCase()}${baseUserName.slice(1)}${String(Math.floor(Math.random() * 9000) + 1000)}`;

    if (!storedUser.userId) {
      const updatedUsers = JSON.parse(localStorage.getItem("users") || "[]").map((user) =>
        user.email.toLowerCase() === normalizedEmail
          ? { ...user, userId: savedUserId }
          : user
      );
      localStorage.setItem("users", JSON.stringify(updatedUsers));
    }

    sessionStorage.setItem("streamweaver_user", userName);
    sessionStorage.setItem("streamweaver_user_id", storedUser.userId || savedUserId);
    navigate("/dashboard");
  }

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

      <form className="login-card" onSubmit={handleSignIn} noValidate>
        <h2>Welcome Back</h2>
        <p>Sign in to continue</p>

        <label className="input-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="yourname@mail.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (submitted) setEmailError(validateEmail(e.target.value));
          }}
          className={emailError ? "input-error" : ""}
          autoComplete="email"
        />
        {emailError && <p className="field-error">{emailError}</p>}

        <label className="input-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter a strong password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (submitted) setPasswordError(validatePassword(e.target.value));
          }}
          className={passwordError ? "input-error" : ""}
          autoComplete="current-password"
        />
        {passwordError && <p className="field-error">{passwordError}</p>}

        <ul className="password-rules">
          <li className={passwordChecks.length ? "met" : ""}>
            At least 8 characters
          </li>
          <li className={passwordChecks.letter ? "met" : ""}>
            Contains a letter
          </li>
          <li className={passwordChecks.number ? "met" : ""}>
            Contains a number
          </li>
          <li className={passwordChecks.special ? "met" : ""}>
            Contains a special character (!@#$...)
          </li>
        </ul>

        {password && (
          <p className={`password-strength ${passwordStrong ? "strong" : "weak"}`}>
            {passwordStrong ? "Strong password" : "Password is not strong enough"}
          </p>
        )}

        <button
          type="submit"
          disabled={!email.trim() || !password || !passwordStrong}
        >
          Sign In
          
        </button>

        <p>
          Don't have an account? {" "}
          <button type="button" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;
