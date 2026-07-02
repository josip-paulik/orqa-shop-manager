import { type FormEvent, useState } from "react";
import { EnvelopeSimple, Lock } from "@phosphor-icons/react";
import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import "./LoginPage.css";

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<void>;
};

function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <img src="/Orqa-logo.png" alt="Orqa Logo" />
        <h1 className="auth-title">Login</h1>
        <span className="muted">
          Use your email and password to continue. Contact your administrator
          for your credentials.
        </span>

        <hr className="divider" />

        <div className="input-container">
          <label className="field" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            icon={EnvelopeSimple}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div className="input-container">
          <label className="field" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            type="password"
            icon={Lock}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
            required
            autoComplete="current-password"
            placeholder="Enter password"
          />
        </div>

        <Button buttonStyle="Primary" type="submit" isLoading={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </main>
  );
}

export default LoginPage;
