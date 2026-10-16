import { Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { errorMessages } from "../../api/errors";
import { useAuth } from "../../auth/useAuth";
import Button from "../../components/Button";
import FormAlert from "../../components/FormAlert";
import PasswordField from "../../components/PasswordField";
import TextField from "../../components/TextField";
import AuthLayout from "../../layouts/AuthLayout";

const EMPTY_FORM = { name: "", email: "", phone: "", password: "" };

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [attempt, setAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      await register(form);
    } catch (error) {
      setErrors(errorMessages(error));
      setAttempt(attempt + 1);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="New player"
      title="Join the squad"
      subtitle="Create your account, then join your team with an invite code."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-pitch-700 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="stagger space-y-5" noValidate>
        <FormAlert message={errors.form} attempt={attempt} />
        <TextField
          label="Full name"
          name="name"
          icon={User}
          placeholder="Rafi Ahmed"
          autoComplete="name"
          required
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <TextField
          label="Phone (optional)"
          name="phone"
          type="tel"
          icon={Phone}
          placeholder="01XXXXXXXXX"
          autoComplete="tel"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
        />
        <PasswordField
          label="Password"
          name="password"
          placeholder="Create a password"
          autoComplete="new-password"
          hint="At least 8 characters. Not only numbers, not too common."
          required
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Button type="submit" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}