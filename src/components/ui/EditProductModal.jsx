import { useState, useEffect } from "react";
import { X, Upload, Trash2, Save } from "lucide-react";
import { productsApi, myProductsApi, categoriesApi } from "../../api/products";
import Button from "./Button";
import { Input } from "./Input";
export default function EditProductModal({ product, onClose, onSave }) {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    precio: "",
    ubicacion: "",
    disponibilidad: true,
    tipo: "PRODUCTO",
    idVendedor: 0,
    idCategoria: 1,
  });

  const [existingImages, setExistingImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (product) {
      setFormData({
        codigo: product.codigo || "",
        nombre: product.nombre || "",
        descripcion: product.descripcion || "",
        precio: product.precio || "",
        ubicacion: product.ubicacion || "",
        disponibilidad: product.disponibilidad ?? true,
        tipo: product.tipo || "PRODUCTO",
        idVendedor: product.idVendedor || 0,
        idCategoria: product.idCategoria || 1,
      });

      if (product.fotos && product.fotos.length > 0) {
        setExistingImages(product.fotos);
      }
    }
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.getAll();
        setCategories(res.data || []);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    };
    fetchCategories();
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + newFiles.length + files.length;

    if (totalImages > 5) {
      setError("Máximo 5 imágenes permitidas");
      return;
    }
    const invalidFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError("Algunas imágenes superan el tamaño máximo de 10MB");
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    setNewFiles((prev) => [...prev, ...files]);
    setError("");
  };

  const removeExistingImage = (index) => {
    setDeletedImages((prev) => [...prev, existingImages[index]]);
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.nombre || !formData.precio || !formData.ubicacion) {
        setError("Por favor completa todos los campos requeridos");
        setLoading(false);
        return;
      }
      const totalImages = existingImages.length + newFiles.length;
      if (totalImages === 0) {
        setError("Debes tener al menos 1 imagen");
        setLoading(false);
        return;
      }

      // 1. Eliminar imágenes marcadas para borrar
      if (deletedImages.length > 0) {
        for (const img of deletedImages) {
          if (img.idFoto) {
            try {
              await myProductsApi.deletePhoto(img.idFoto);
            } catch (err) {
              console.error("Error al eliminar foto:", err);
            }
          }
        }
      }

      // 2. Subir nuevas fotos (si hay)
      if (newFiles.length > 0) {
        try {
          await myProductsApi.uploadMultiplePhotos(
            product.idProducto,
            newFiles
          );
        } catch (err) {
          console.error("Error al subir nuevas fotos:", err);
          setError("Error al subir nuevas fotos");
          setLoading(false);
          return;
        }
      }

      // 3. Actualizar datos del producto
      let response;
      try {
        response = await myProductsApi.update(product.idProducto, {
          ...formData,
          precio: parseFloat(formData.precio),
          idCategoria: formData.idCategoria,
        });
      } catch (err) {
        console.error("Error al actualizar producto:", err);
        setError(
          err.response?.data?.error || "Error al actualizar el producto"
        );
        setLoading(false);
        return;
      }

      onSave(response.data);
      onClose();
    } catch (err) {
      console.error("Error general al editar producto:", err);
      setError("Error al editar el producto");
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800/50 bg-slate-900/95 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-800/50 bg-slate-900/95 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-slate-50">Editar Producto</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-slate-50 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Imágenes */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              Imágenes (1-5) *
            </label>

            {/* Imágenes existentes */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {existingImages.map((img, index) => (
                  <div key={img.idFoto || index} className="relative group">
                    <img
                      src={productsApi.getImageUrl(img.url)}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl border border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Nuevas imágenes */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Nueva ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl border border-blue-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="absolute top-2 left-2 px-2 py-1 rounded bg-blue-500/90 text-white text-xs">
                      Nueva
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            {existingImages.length + newFiles.length < 5 && (
              <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500/50 bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer transition-all">
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-400">
                  Agregar imágenes ({existingImages.length + newFiles.length}/5)
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
              placeholder="Ej: Silla de oficina"
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
              placeholder="Describe tu producto..."
              rows={4}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
          </div>

          {/* Precio y Ubicación */}
          <div className="grid grid-cols-2 gap-4">
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
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="disponibilidad"
              name="disponibilidad"
              checked={formData.disponibilidad}
              onChange={handleChange}
              className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500/50"
            />
            <label htmlFor="disponibilidad" className="text-sm text-slate-300">
              Producto disponible
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-medium transition-all"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
