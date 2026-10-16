import { useState } from "react";
import { Link } from "react-router";
import { errorMessages } from "../../api/errors";
import { useAuth } from "../../auth/useAuth";
import Button from "../../components/Button";
import TextField from "../../components/TextField";
import AuthLayout from "../../layouts/AuthLayout";

const EMPTY_FORM = { name: "", email: "", phone: "", password: "" };

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // One handler for every input, using each input's `name`.
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
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join your team in a minute"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</div>
        )}
        <TextField label="Full name" name="name" required value={form.name} onChange={handleChange} error={errors.name} />
        <TextField label="Email" name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} error={errors.email} />
        <TextField label="Phone (optional)" name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} />
        <TextField label="Password" name="password" type="password" autoComplete="new-password" required value={form.password} onChange={handleChange} error={errors.password} />
        <Button type="submit" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}