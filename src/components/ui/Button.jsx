export function Button({ children, loading = false, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {loading ? "Cargando..." : children}
    </button>
  );
}
export default Button;
