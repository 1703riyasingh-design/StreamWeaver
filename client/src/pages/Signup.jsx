import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

  const handleSignup = (e) => {
    e.preventDefault();

    const emailMsg = validateEmail(email);
    const passwordMsg = validatePassword(password);

    setEmailError(emailMsg);
    setPasswordError(passwordMsg);

    if (emailMsg || passwordMsg) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const userExists = storedUsers.some(
      (user) => user.email.toLowerCase() === normalizedEmail
    );

    if (userExists) {
      setEmailError("An account with this email already exists.");
      return;
    }

    const updatedUsers = [
      ...storedUsers,
      { email: normalizedEmail, password },
    ];

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.removeItem("user");

    alert("Registration successful!");
    navigate("/");
  };

  const passwordChecks = getPasswordChecks(password);
  const passwordStrong = isStrongPassword(password);

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Create Account</h1>
        <p>Sign up to continue</p>

        <form onSubmit={handleSignup} noValidate>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(validateEmail(e.target.value));
            }}
            className={emailError ? "input-error" : ""}
            required
          />
          {emailError && <p className="field-error">{emailError}</p>}

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(validatePassword(e.target.value));
            }}
            className={passwordError ? "input-error" : ""}
            required
          />
          {passwordError && <p className="field-error">{passwordError}</p>}

          <ul className="password-rules">
            <li className={passwordChecks.length ? "met" : ""}>At least 8 characters</li>
            <li className={passwordChecks.letter ? "met" : ""}>Contains a letter</li>
            <li className={passwordChecks.number ? "met" : ""}>Contains a number</li>
            <li className={passwordChecks.special ? "met" : ""}>Contains a special character (!@#$...)</li>
          </ul>

          {password && (
            <p className={`password-strength ${passwordStrong ? "strong" : "weak"}`}>
              {passwordStrong ? "Strong password" : "Password is not strong enough"}
            </p>
          )}

          <button type="submit" disabled={!email.trim() || !password || !passwordStrong}>
            Sign Up
          </button>
        </form>

        <p>
          Already have an account?{" "}
          <button type="button" onClick={() => navigate("/")}>
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;