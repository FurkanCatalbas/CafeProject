export function Input({ label, value, onChange, type = "text", placeholder = "", required = false }) {
  return (
    <label className="input-group">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );
}
