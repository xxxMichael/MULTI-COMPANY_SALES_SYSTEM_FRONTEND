import { useState } from "react";
import { reportsApi, REPORT_REASONS, validateReportData } from "../../api/reports";
import { getAuth } from "../../state/auth";
import { useNotifications } from "../../hooks/useNotifications";
import Button from "./Button";
import Input from "./Input";

export default function ReportProductModal({ product, onClose, onReportSubmitted }) {
  const [formData, setFormData] = useState({
    motivo: '',
    descripcion: '',
    customMotivo: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomMotivo, setShowCustomMotivo] = useState(false);
  const { notify } = useNotifications();
  const auth = getAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleMotivoChange = (value) => {
    handleInputChange('motivo', value);
    
    if (value === 'Otro') {
      setShowCustomMotivo(true);
    } else {
      setShowCustomMotivo(false);
      setFormData(prev => ({ ...prev, customMotivo: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth?.user?.id && !auth?.user?.idUsuario) {
      alert('Debes iniciar sesión para reportar productos');
      return;
    }

    // Preparar datos para validación
    const finalMotivo = formData.motivo === 'Otro' ? formData.customMotivo : formData.motivo;
    const reportData = {
      idProducto: product.idProducto,
      idUsuarioReporta: auth.user.id || auth.user.idUsuario,
      motivo: finalMotivo,
      descripcion: formData.descripcion
    };

    // Validar datos
    const validation = validateReportData(reportData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Validaciones adicionales del frontend
    const frontendErrors = {};
    
    if (formData.motivo === 'Otro' && (!formData.customMotivo || formData.customMotivo.trim() === '')) {
      frontendErrors.customMotivo = 'Debes especificar el motivo';
    }

    if (formData.customMotivo && formData.customMotivo.length > 255) {
      frontendErrors.customMotivo = 'El motivo no puede exceder 255 caracteres';
    }

    if (Object.keys(frontendErrors).length > 0) {
      setErrors(frontendErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await reportsApi.create(reportData);
      
      console.log('✅ Reporte creado exitosamente:', response.data);
      
      // Notificar al componente padre
      if (onReportSubmitted) {
        onReportSubmitted(response.data);
      }

      // Mostrar notificación de éxito
      try {
        notify.success(
          'Tu reporte ha sido enviado exitosamente. Nuestro equipo lo revisará pronto.',
          {
            title: 'Reporte enviado',
            duration: 6000
          }
        );
      } catch (notifyError) {
        console.warn('Error mostrando notificación:', notifyError);
        // Fallback a alert si las notificaciones fallan
        alert('Tu reporte ha sido enviado exitosamente. Nuestro equipo lo revisará pronto.');
      }
      
      // Cerrar modal
      onClose();
      
    } catch (error) {
      console.error('❌ Error al enviar reporte:', error);
      
      const errorMessage = error.response?.data?.mensaje || 
                          error.response?.data?.error || 
                          error.response?.data?.message ||
                          'Error al enviar el reporte. Intenta de nuevo.';
      
      // Si es un error de validación del servidor, mostrar errores específicos
      if (error.response?.status === 400 && error.response?.data?.errores) {
        setErrors(error.response.data.errores);
        try {
          notify.error(
            'Por favor, corrige los errores en el formulario.',
            { title: 'Error de validación' }
          );
        } catch (notifyError) {
          console.warn('Error mostrando notificación:', notifyError);
          alert('Por favor, corrige los errores en el formulario.');
        }
      } else {
        try {
          notify.error(errorMessage, { title: 'Error al enviar reporte' });
        } catch (notifyError) {
          console.warn('Error mostrando notificación:', notifyError);
          alert(errorMessage);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl border border-slate-800/50 bg-slate-900/90 backdrop-blur-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/90 border-b border-slate-800/40 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-50">Reportar Producto</h2>
            <p className="text-slate-300 text-sm mt-1">
              Reportando: <span className="font-medium">{product.nombre}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-slate-100 transition-colors"
            disabled={isSubmitting}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del producto */}
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
            <h3 className="text-lg font-semibold text-slate-50 mb-2">Información del producto</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p><span className="font-medium">Nombre:</span> {product.nombre}</p>
              <p><span className="font-medium">Precio:</span> ${product.precio}</p>
              <p><span className="font-medium">Vendedor:</span> {product.nombreVendedor}</p>
              <p><span className="font-medium">Ubicación:</span> {product.ubicacion}</p>
            </div>
          </div>

          {/* Motivo del reporte */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Motivo del reporte *
            </label>
            <select
              value={formData.motivo}
              onChange={(e) => handleMotivoChange(e.target.value)}
              className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.motivo ? 'border-red-500' : 'border-slate-600'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Selecciona un motivo</option>
              {REPORT_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            {errors.motivo && (
              <p className="text-red-400 text-sm mt-1">{errors.motivo}</p>
            )}
          </div>

          {/* Motivo personalizado */}
          {showCustomMotivo && (
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Especifica el motivo *
              </label>
              <Input
                type="text"
                value={formData.customMotivo}
                onChange={(e) => handleInputChange('customMotivo', e.target.value)}
                placeholder="Escribe el motivo específico..."
                className={errors.customMotivo ? 'border-red-500' : ''}
                disabled={isSubmitting}
                maxLength={255}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.customMotivo && (
                  <p className="text-red-400 text-sm">{errors.customMotivo}</p>
                )}
                <p className="text-slate-400 text-xs ml-auto">
                  {formData.customMotivo.length}/255 caracteres
                </p>
              </div>
            </div>
          )}

          {/* Descripción detallada */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Descripción detallada *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Describe detalladamente el problema con este producto. Incluye cualquier evidencia o información relevante..."
              className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y min-h-[120px] ${
                errors.descripcion ? 'border-red-500' : 'border-slate-600'
              }`}
              disabled={isSubmitting}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.descripcion && (
                <p className="text-red-400 text-sm">{errors.descripcion}</p>
              )}
              <p className="text-slate-400 text-xs ml-auto">
                {formData.descripcion.length}/1000 caracteres
              </p>
            </div>
          </div>

          {/* Información importante */}
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-blue-100 text-sm">
                <p className="font-medium mb-1">Información importante:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Los reportes son revisados por nuestro equipo de moderación</li>
                  <li>Proporciona información detallada y veraz</li>
                  <li>Los reportes falsos pueden resultar en sanciones</li>
                  <li>Recibirás una notificación sobre el estado de tu reporte</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !formData.motivo || !formData.descripcion}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Enviando...
                </div>
              ) : (
                'Enviar Reporte'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}