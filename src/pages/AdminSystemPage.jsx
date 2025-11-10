import { useState } from "react";
import Header from "../components/ui/Header";
import { Settings, Filter, Calendar, Info, Tag } from "lucide-react";
import PalabrasProhibidasSection from "../components/admin/PalabrasProhibidasSection";
import DiasExpiracionSection from "../components/admin/DiasExpiracionSection";
import CategoriasSection from "../components/admin/CategoriasSection";

/**
 * Página de configuración del sistema
 * Permite a los administradores gestionar:
 * - Palabras prohibidas
 * - Días de expiración de productos
 */
export default function AdminSystemPage() {
  const [activeTab, setActiveTab] = useState("palabras");

  const tabs = [
    {
      id: "palabras",
      name: "Palabras Prohibidas",
      icon: Filter,
      description: "Gestiona el filtro de contenido",
    },
    {
      id: "expiracion",
      name: "Expiración de Productos",
      icon: Calendar,
      description: "Configura días de expiración",
    },
    {
      id: "categorias",
      name: "Categorías",
      icon: Tag,
      description: "Gestiona categorías de productos",
    },
    {
      id: "info",
      name: "Información",
      icon: Info,
      description: "Información del sistema",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-50">
                Configuración del Sistema
              </h1>
              <p className="text-slate-400 mt-1">
                Administra la configuración global de la plataforma
              </p>
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-xl shadow-xl overflow-hidden">
          {/* Tabs Header */}
          <div className="border-b border-slate-800">
            <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group relative min-w-0 flex-1 overflow-hidden py-4 px-6 text-center font-medium text-sm
                      hover:bg-slate-800/40 transition-all duration-200
                      ${
                        isActive
                          ? "text-blue-400 border-b-2 border-blue-400 bg-slate-800/20"
                          : "text-slate-400 border-b-2 border-transparent hover:text-slate-300"
                      }
                    `}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon
                        className={`h-5 w-5 ${
                          isActive ? "text-blue-400" : "text-slate-500"
                        }`}
                      />
                      <span className="hidden sm:inline">{tab.name}</span>
                      <span className="sm:hidden">{tab.name.split(" ")[0]}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "palabras" && <PalabrasProhibidasSection />}
            {activeTab === "expiracion" && <DiasExpiracionSection />}
            {activeTab === "categorias" && <CategoriasSection />}
            {activeTab === "info" && <SystemInfoSection />}
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Sección de información del sistema
 */
function SystemInfoSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-50 mb-4">
          Información del Sistema
        </h2>
        <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6 space-y-4">
          <InfoItem
            label="Versión del Sistema"
            value="1.0.0"
            description="Versión actual de la plataforma"
          />
          <InfoItem
            label="Módulos Configurables"
            value="3"
            description="Palabras Prohibidas, Días de Expiración, Categorías"
          />
          <InfoItem
            label="Estado del Sistema"
            value="Operativo"
            badge="success"
          />
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
          <Info className="h-5 w-5" />
          Acerca de esta sección
        </h3>
        <div className="text-slate-300 space-y-2 text-sm">
          <p>
            Esta página permite a los administradores gestionar configuraciones
            críticas del sistema que afectan el comportamiento de toda la plataforma.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <strong>Palabras Prohibidas:</strong> Filtra contenido inapropiado en
              descripciones de productos y mensajes
            </li>
            <li>
              <strong>Días de Expiración:</strong> Define cuándo los productos se
              marcan como vencidos
            </li>
            <li>
              <strong>Categorías:</strong> Gestiona las categorías de productos disponibles
              en el sistema
            </li>
          </ul>
          <p className="mt-4 text-yellow-400/80">
            ⚠️ Los cambios realizados aquí se aplican inmediatamente a toda la
            plataforma.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, description, badge }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-700/50 last:border-0">
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        {description && (
          <p className="text-slate-500 text-xs mt-1">{description}</p>
        )}
      </div>
      <div>
        {badge === "success" ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-900/40 text-green-300 border border-green-700/40">
            {value}
          </span>
        ) : (
          <span className="text-slate-50 font-semibold">{value}</span>
        )}
      </div>
    </div>
  );
}
