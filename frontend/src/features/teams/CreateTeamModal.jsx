import { MapPin, Shield } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { errorMessages } from "../../api/errors";
import Button from "../../components/Button";
import FormAlert from "../../components/FormAlert";
import Modal from "../../components/Modal";
import TextField from "../../components/TextField";
import { useCreateTeam } from "./hooks";

const EMPTY = { name: "", location: "", primary_color: "#0b3d24" };

export default function CreateTeamModal({ open, onClose }) {
  const navigate = useNavigate();
  const createTeam = useCreateTeam();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleClose() {
    setForm(EMPTY);
    setErrors({});
    onClose();
  }

  function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    createTeam.mutate(form, {
      onSuccess: (team) => {
        handleClose();
        navigate(`/teams/${team.id}`);
      },
      onError: (error) => setErrors(errorMessages(error)),
    });
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create a team">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormAlert message={errors.form} attempt={0} />
        <TextField
          label="Team name"
          name="name"
          icon={Shield}
          placeholder="Friday FC"
          required
          autoFocus
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />
        <TextField
          label="Area or home ground (optional)"
          name="location"
          icon={MapPin}
          placeholder="Bashundhara, Dhaka"
          value={form.location}
          onChange={handleChange}
          error={errors.location}
        />
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Team colour</span>
          <span className="flex items-center gap-3">
            <input
              type="color"
              name="primary_color"
              value={form.primary_color}
              onChange={handleChange}
              className="h-11 w-16 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
            />
            <span className="font-mono text-sm text-slate-500">{form.primary_color.toUpperCase()}</span>
          </span>
          {errors.primary_color && <span className="mt-1.5 block text-sm text-red-600">{errors.primary_color}</span>}
        </label>
        <Button type="submit" loading={createTeam.isPending}>
          Create team
        </Button>
      </form>
    </Modal>
  );
}