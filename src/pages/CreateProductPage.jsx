// src/pages/CreateProductPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Trash2, Plus } from "lucide-react";
import Header from "../components/ui/Header";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { productsApi, myProductsApi } from "../api/products";
import { categoriesApi } from "../api/products";
import { getAuth } from "../state/auth";

export default function CreateProductPage() {
  const [categories, setCategories] = useState([]);
  useState(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.getAll();
        setCategories(res.data || []);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    };
    fetchCategories();
  }, []);
  const navigate = useNavigate();
  const auth = getAuth();
  const userId = auth?.user?.id;

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    precio: "",
    ubicacion: "",
    disponibilidad: true,
    tipo: "PRODUCTO",
    idVendedor: userId || 0,
    idCategoria: 1,
  });

  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const totalFiles = files.length + newFiles.length;

    if (totalFiles > 5) {
      setError("Máximo 5 imágenes permitidas");
      return;
    }

    // Validar tamaño (10MB por archivo)
    const invalidFiles = newFiles.filter(
      (file) => file.size > 10 * 1024 * 1024
    );
    if (invalidFiles.length > 0) {
      setError("Algunas imágenes superan el tamaño máximo de 10MB");
      return;
    }

    // Validar formato
    const validFormats = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const invalidFormats = newFiles.filter(
      (file) => !validFormats.includes(file.type)
    );
    if (invalidFormats.length > 0) {
      setError("Solo se permiten formatos JPG, PNG, GIF y WEBP");
      return;
    }

    // Crear previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    setFiles((prev) => [...prev, ...newFiles]);
    setError("");
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Validación
      if (!formData.nombre || !formData.precio || !formData.ubicacion) {
        setError("Por favor completa todos los campos requeridos");
        setLoading(false);
        return;
      }

      // Preparar datos
      const productData = {
        ...formData,
        precio: parseFloat(formData.precio),
        idVendedor: userId,
      };

      let response;
      if (files.length > 0) {
        // Crear con imágenes
        response = await productsApi.createWithPhotos(productData, files);
      } else {
        // Crear sin imágenes
        response = await myProductsApi.create(productData);
      }

      setSuccess(true);

      // Limpiar formulario
      setFormData({
        codigo: "",
        nombre: "",
        descripcion: "",
        precio: "",
        ubicacion: "",
        disponibilidad: true,
        tipo: "PRODUCTO",
        idVendedor: userId || 0,
        idCategoria: 1,
      });
      setFiles([]);
      setPreviewUrls([]);

      // Redireccionar después de 2 segundos
      setTimeout(() => {
        navigate("/my-products");
      }, 2000);
    } catch (err) {
      console.error("Error al crear producto:", err);
      setError(
        err.response?.data?.error ||
          "Error al crear el producto. Por favor intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <Header />

      {/* Decorative background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative container mx-auto px-4 py-8 max-w-3xl">
        {/* Back button */}
        <button
          onClick={() => navigate("/my-products")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-50 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a Mis Productos
        </button>

        {/* Form container */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300 pointer-events-none" />

          <div className="relative rounded-2xl border border-slate-800/50 bg-slate-900/90 backdrop-blur-xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-slate-50 mb-2">
              Crear Nuevo Producto
            </h1>
            <p className="text-slate-400 mb-8">
              Completa los detalles de tu producto o servicio
            </p>

            {/* Mensajes */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                ✓ Producto creado exitosamente. Redirigiendo...
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Imágenes */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">
                  Imágenes (1-5) {files.length === 0 && "*"}
                </label>

                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl border border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {files.length < 5 && (
                  <label className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500/50 bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer transition-all">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-400">
                      {files.length === 0
                        ? "Seleccionar imágenes (requerido)"
                        : `Agregar más imágenes (${files.length}/5)`}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}

                <p className="text-xs text-slate-500">
                  JPG, PNG, GIF o WEBP. Máximo 10MB por imagen.
                </p>
              </div>

              {/* Código (opcional) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Código (opcional)
                </label>
                <Input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  placeholder="Ej: PROD-001"
                />
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre *
                </label>
                <Input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Silla de oficina ergonómica"
                  maxLength={70}
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Describe detalladamente tu producto o servicio..."
                  rows={5}
                  maxLength={255}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Precio y Ubicación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Precio *
                  </label>
                  <Input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0.1"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ubicación *
                  </label>
                  <Input
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    placeholder="Ej: Medellín"
                    maxLength={70}
                    required
                  />
                </div>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tipo *
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                >
                  <option value="PRODUCTO">Producto</option>
                  <option value="SERVICIO">Servicio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Categoría *
                </label>
                <select
                  name="idCategoria"
                  value={formData.idCategoria}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                >
                  {categories.length === 0 && (
                    <option value="" disabled>
                      Cargando categorías...
                    </option>
                  )}
                  {categories.map((cat) => (
                    <option key={cat.idCategoria} value={cat.idCategoria}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Disponibilidad */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <input
                  type="checkbox"
                  id="disponibilidad"
                  name="disponibilidad"
                  checked={formData.disponibilidad}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500/50"
                />
                <label
                  htmlFor="disponibilidad"
                  className="text-sm text-slate-300"
                >
                  Marcar como disponible inmediatamente
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/my-products")}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-medium transition-all"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <Button
                  type="submit"
                  disabled={loading || files.length === 0}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {loading ? "Creando..." : "Crear Producto"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
