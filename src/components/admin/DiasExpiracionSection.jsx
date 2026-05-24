import { useState, useEffect } from "react";
import {
  obtenerDiasExpiracion,
  actualizarDiasExpiracion,
} from "../../api/configuracion";
import { Calendar, Save, Loader2, AlertCircle, Clock } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useNotifications } from "../../hooks/useNotifications";

export default function DiasExpiracionSection() {
  const [dias, setDias] = useState(30);
  const [diasOriginal, setDiasOriginal] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { notify } = useNotifications();

  useEffect(() => {
    cargarDias();
  }, []);

  const cargarDias = async () => {
    setLoading(true);
    try {
      const data = await obtenerDiasExpiracion();
      setDias(data.dias);
      setDiasOriginal(data.dias);
    } catch (error) {
      notify.error("Error al cargar configuración");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const guardarCambios = async (e) => {
    e.preventDefault();

    if (dias < 1) {
      notify.warning("Los días deben ser al menos 1");
      return;
    }

    setSaving(true);
    try {
      const data = await actualizarDiasExpiracion(dias);
      setDiasOriginal(data.dias);
      notify.success(`Días de expiración actualizados a ${data.dias} días correctamente`);
    } catch (error) {
      notify.error(
        error.response?.data?.mensaje || "Error al actualizar configuración"
      );
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDias(diasOriginal);
  };

  const hasChanges = dias !== diasOriginal;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3 text-slate-400">
          Cargando configuración...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-slate-50 mb-2">
          Días de Expiración de Productos
        </h2>
        <p className="text-slate-400 text-sm">
          Configura cuántos días deben pasar para que un producto se considere
          expirado
        </p>
      </div>

      {/* Información actual */}
      <div className="bg-gradient-to-br from-blue-900/20 to-violet-900/20 border border-blue-800/40 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Configuración actual</p>
              <p className="text-3xl font-bold text-slate-50">{diasOriginal} días</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs mb-1">Estado</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-900/40 text-green-300 border border-green-700/40">
              <Clock className="h-3.5 w-3.5" />
              Activo
            </span>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={guardarCambios} className="space-y-6">
        <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6 space-y-4">
          <div>
            <label
              htmlFor="dias"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Número de días
            </label>
            <Input
              type="number"
              id="dias"
              min="1"
              max="365"
              value={dias}
              onChange={(e) => setDias(parseInt(e.target.value) || 1)}
              disabled={saving}
              className="text-lg font-semibold"
            />
            <p className="mt-2 text-xs text-slate-500">
              Valor permitido: 1 - 365 días
            </p>
          </div>

          {/* Visualización de cambio */}
          {hasChanges && (
            <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-300">
                    Hay cambios sin guardar
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    <span className="line-through">{diasOriginal} días</span> →{" "}
                    <span className="font-semibold text-yellow-300">
                      {dias} días
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving || !hasChanges}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
            {hasChanges && (
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Ejemplos */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">
          Ejemplos de expiración
        </h3>
        <div className="space-y-3">
          <ExampleItem
            dias={dias}
            label="Producto publicado hoy"
            expira={new Date(Date.now() + dias * 24 * 60 * 60 * 1000)}
          />
          <ExampleItem
            dias={dias}
            label="Producto publicado hace 7 días"
            expira={new Date(Date.now() + (dias - 7) * 24 * 60 * 60 * 1000)}
          />
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-300 mb-2">
          💡 Información
        </h3>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>
            • Los productos se marcan como expirados después del número de días
            configurado
          </li>
          <li>• Los cambios se aplican inmediatamente a todos los productos</li>
          <li>
            • Los productos expirados pueden ser renovados por sus propietarios
          </li>
          <li>• El valor predeterminado es 30 días</li>
        </ul>
      </div>
    </div>
  );
}

function ExampleItem({ dias, label, expira }) {
  const fechaFormateada = expira.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const diasRestantes = Math.ceil(
    (expira.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <div className="text-right">
        <p className="text-sm font-medium text-slate-200">{fechaFormateada}</p>
        <p className="text-xs text-slate-500">
          {diasRestantes > 0
            ? `En ${diasRestantes} días`
            : diasRestantes === 0
            ? "Hoy"
            : `Hace ${Math.abs(diasRestantes)} días`}
        </p>
      </div>
    </div>
  );
}
