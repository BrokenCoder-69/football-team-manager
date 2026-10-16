// Django sends errors like {"email": ["Already exists."]} or {"detail": "..."}.
// This turns them into {email: "Already exists."} or {form: "..."}
// so each message can be shown next to the right input.
export function errorMessages(error) {
  if (!error.response) {
    return { form: "Can't reach the server. Is Django running?" };
  }
  if (error.response.status >= 500) {
    return { form: "Server error. Check the Django terminal for details." };
  }

  const data = error.response.data;
  if (data && typeof data === "object") {
    const messages = {};
    for (const [field, value] of Object.entries(data)) {
      const key = field === "detail" || field === "non_field_errors" ? "form" : field;
      messages[key] = Array.isArray(value) ? value.join(" ") : String(value);
    }
    return messages;
  }
  return { form: "Something went wrong. Please try again." };
}