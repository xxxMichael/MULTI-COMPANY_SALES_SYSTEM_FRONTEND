import { useState } from "react";
import { createModerator } from "../api/auth";

export default function AdminCreateModeratorPage() {
  const [form, setForm] = useState({
    nombre: "", apellido: "", cedula: "", correo: "",
    contrasena: "", telefono: "", direccion: "", genero: ""
  });
  const [msg, setMsg] = useState("");

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const { data } = await createModerator(form);
      setMsg(data?.message || "Moderador creado y código enviado.");
    } catch (err) {
      const text = typeof err.response?.data === "string"
        ? err.response.data
        : err.response?.data?.message;
      setMsg(text || "Error al crear moderador");
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 480, margin: "40px auto" }}>
      <h2>Nuevo moderador</h2>
      <input placeholder="Nombre" value={form.nombre} onChange={update("nombre")} />
      <input placeholder="Apellido" value={form.apellido} onChange={update("apellido")} />
      <input placeholder="Cédula" value={form.cedula} onChange={update("cedula")} />
      <input placeholder="Correo" value={form.correo} onChange={update("correo")} />
      <input placeholder="Contraseña" type="password" value={form.contrasena} onChange={update("contrasena")} />
      <input placeholder="Teléfono" value={form.telefono} onChange={update("telefono")} />
      <input placeholder="Dirección" value={form.direccion} onChange={update("direccion")} />
      <input placeholder="Género (F/M/X)" value={form.genero} onChange={update("genero")} />
      <button type="submit">Crear</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
