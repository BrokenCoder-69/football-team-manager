import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import TextField from "./TextField";

export default function PasswordField(props) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      icon={Lock}
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      }
    />
  );
}