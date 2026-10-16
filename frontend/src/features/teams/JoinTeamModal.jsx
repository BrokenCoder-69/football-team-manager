import { CircleCheck, KeyRound } from "lucide-react";
import { useState } from "react";
import { errorMessages } from "../../api/errors";
import Button from "../../components/Button";
import FormAlert from "../../components/FormAlert";
import Modal from "../../components/Modal";
import TextField from "../../components/TextField";
import { useJoinTeam } from "./hooks";

export default function JoinTeamModal({ open, onClose }) {
  const join = useJoinTeam();
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({});

  function handleClose() {
    setCode("");
    setErrors({});
    join.reset();
    onClose();
  }

  function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    join.mutate(code, { onError: (error) => setErrors(errorMessages(error)) });
  }

  return (
    <Modal open={open} onClose={handleClose} title={join.isSuccess ? "Request sent" : "Join a team"}>
      {join.isSuccess ? (
        <div className="text-center">
          <CircleCheck className="mx-auto size-14 text-pitch-600" />
          <p className="mt-4 text-slate-700">
            You asked to join <strong>{join.data.team.name}</strong>.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            A captain or admin needs to approve you. The team appears here once they do.
          </p>
          <div className="mt-6">
            <Button onClick={handleClose} showArrow={false}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormAlert message={errors.form} attempt={0} />
          <TextField
            label="Invite code"
            icon={KeyRound}
            placeholder="K7PX2QMA"
            maxLength={8}
            autoFocus
            autoComplete="off"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            error={errors.invite_code}
            style={{ letterSpacing: "0.3em", fontFamily: "ui-monospace, monospace" }}
            hint="Ask your captain for the 8-character code."
          />
          <Button type="submit" loading={join.isPending}>
            Send join request
          </Button>
        </form>
      )}
    </Modal>
  );
}