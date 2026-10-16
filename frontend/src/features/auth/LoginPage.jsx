import { Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { errorMessages } from "../../api/errors";
import { useAuth } from "../../auth/useAuth";
import Button from "../../components/Button";
import FormAlert from "../../components/FormAlert";
import PasswordField from "../../components/PasswordField";
import TextField from "../../components/TextField";
import AuthLayout from "../../layouts/AuthLayout";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [attempt, setAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (error) {
      setErrors(errorMessages(error));
      setAttempt(attempt + 1);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Matchday access"
      title="Welcome back"
      subtitle="Log in to see your matches, seats and payments."
      footer={
        <>
          New to the team?{" "}
          <Link to="/register" className="font-semibold text-pitch-700 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="stagger space-y-5" noValidate>
        <FormAlert message={errors.form} attempt={attempt} />
        <TextField
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <PasswordField
          label="Password"
          placeholder="Your password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <Button type="submit" loading={submitting}>
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}