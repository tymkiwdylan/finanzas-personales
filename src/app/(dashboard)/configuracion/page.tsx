'use client';

import { Layout } from '@/components/layout/Layout';
import { useBudget } from '@/context/BudgetContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Currency } from '@/types';
import { Download, Upload, RefreshCw } from 'lucide-react';

export default function Configuracion() {
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sky-800 mb-6">Configuración</h1>
        
        <SettingsForm />
      </div>
    </Layout>
  );
}

function SettingsForm() {
  const { 
    selectedCurrency, 
    exchangeRate, 
    setSelectedCurrency, 
    updateExchangeRate, 
    exportData, 
    importData 
  } = useBudget();
  
  const [formData, setFormData] = useState({
    defaultCurrency: selectedCurrency,
    exchangeRate: exchangeRate.toString()
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Update form when context values change
    setFormData({
      defaultCurrency: selectedCurrency,
      exchangeRate: exchangeRate.toString()
    });
  }, [selectedCurrency, exchangeRate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Clear saved message when form is modified
    if (savedMessage) {
      setSavedMessage('');
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.exchangeRate) {
      newErrors.exchangeRate = 'El tipo de cambio es requerido';
    } else if (isNaN(Number(formData.exchangeRate)) || Number(formData.exchangeRate) <= 0) {
      newErrors.exchangeRate = 'El tipo de cambio debe ser un número positivo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Update currency settings
      setSelectedCurrency(formData.defaultCurrency as Currency);
      updateExchangeRate(Number(formData.exchangeRate));
      
      // Show success message
      setSavedMessage('Configuración guardada correctamente');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSavedMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrors({
        form: 'Error al guardar la configuración'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and click it to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzas-personales-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleImport = async () => {
    if (!importFile) {
      setErrors({
        import: 'Por favor selecciona un archivo para importar'
      });
      return;
    }
    
    try {
      const text = await importFile.text();
      const data = JSON.parse(text);
      importData(data);
      
      // Show success message
      setSavedMessage('Datos importados correctamente');
      
      // Reset file input and message after 3 seconds
      setImportFile(null);
      const fileInput = document.getElementById('importFile') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      setTimeout(() => {
        setSavedMessage('');
        router.push('/'); // Redirect to home page
      }, 3000);
    } catch (error) {
      console.error('Error importing data:', error);
      setErrors({
        import: 'Error al importar los datos. Asegúrate de que el archivo tenga el formato correcto.'
      });
    }
  };
  
  const handleUpdateRate = async () => {
    setIsUpdatingRate(true);
    
    try {
      // Fetch latest rate from API and update it
      const response = await fetch('https://dolarapi.com/v1/dolares/blue');
      const data = await response.json();
      const newRate = data.venta; // Use "venta" (selling) rate
      
      // Update state and form
      updateExchangeRate(newRate);
      setFormData({
        ...formData,
        exchangeRate: newRate.toString()
      });
      
      // Show success message
      setSavedMessage('Tipo de cambio actualizado correctamente');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSavedMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      setErrors({
        exchangeRate: 'Error al obtener el tipo de cambio actual'
      });
    } finally {
      setIsUpdatingRate(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuración General</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Default Currency */}
              <div>
                <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda predeterminada
                </label>
                <select
                  id="defaultCurrency"
                  name="defaultCurrency"
                  value={formData.defaultCurrency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="ARS">Peso Argentino (ARS)</option>
                  <option value="USD">Dólar Estadounidense (USD)</option>
                </select>
              </div>

              {/* Exchange Rate */}
              <div>
                <label htmlFor="exchangeRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de cambio (USD a ARS)
                </label>
                <div className="flex">
                  <input
                    type="number"
                    id="exchangeRate"
                    name="exchangeRate"
                    value={formData.exchangeRate}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`flex-1 px-3 py-2 border ${errors.exchangeRate ? 'border-red-500' : 'border-gray-300'} rounded-l-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
                    placeholder="0.00"
                  />
                  <button
                    type="button"
                    onClick={handleUpdateRate}
                    disabled={isUpdatingRate}
                    className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-200 flex items-center justify-center"
                  >
                    {isUpdatingRate ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.exchangeRate && <p className="mt-1 text-sm text-red-600">{errors.exchangeRate}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  Este valor se usa para convertir entre USD y ARS
                </p>
              </div>

              {/* Error and Save button */}
              {errors.form && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {errors.form}
                </div>
              )}
              
              {savedMessage && (
                <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
                  {savedMessage}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center"
                >
                  {isSaving && <span className="animate-spin mr-2">⟳</span>}
                  Guardar Configuración
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Data Management */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestión de Datos</h2>
          
          <div className="space-y-6">
            {/* Export Data */}
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="font-medium text-gray-800 mb-2">Exportar Datos</h3>
              <p className="text-sm text-gray-600 mb-3">
                Exporta todos tus datos financieros en formato JSON para hacer una copia de seguridad.
              </p>
              <button
                onClick={handleExport}
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Datos
              </button>
            </div>
            
            {/* Import Data */}
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="font-medium text-gray-800 mb-2">Importar Datos</h3>
              <p className="text-sm text-gray-600 mb-3">
                Importa datos financieros previamente exportados. Esto reemplazará todos tus datos actuales.
              </p>
              
              <div className="mb-3">
                <input
                  type="file"
                  id="importFile"
                  accept=".json"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
                {errors.import && <p className="mt-1 text-sm text-red-600">{errors.import}</p>}
              </div>
              
              <button
                onClick={handleImport}
                disabled={!importFile}
                className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  !importFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
                } flex items-center justify-center`}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Datos
              </button>
            </div>
            
            <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md text-sm">
              <strong>Nota:</strong> La importación reemplazará todos tus datos actuales. Asegúrate de hacer una exportación antes de importar nuevos datos.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
