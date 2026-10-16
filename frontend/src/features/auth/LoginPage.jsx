import { useState } from "react";
import { Link } from "react-router";
import { errorMessages } from "../../api/errors";
import { useAuth } from "../../auth/useAuth";
import Button from "../../components/Button";
import TextField from "../../components/TextField";
import AuthLayout from "../../layouts/AuthLayout";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser's default full-page form submit
    setErrors({});
    setSubmitting(true);
    try {
      await login(email, password);
      // No navigate() needed: GuestOnlyRoute redirects once we're logged in.
    } catch (error) {
      setErrors(errorMessages(error));
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your team"
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="font-semibold text-emerald-700 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</div>
        )}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <TextField
          label="Password"
          type="password"
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