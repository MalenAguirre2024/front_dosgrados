import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { Button } from './components/Button';
import { DataTable } from './components/DataTable';
import { Download, FileSpreadsheet, Trash2, PlayCircle } from 'lucide-react';
import axios from 'axios';
function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImages, setSelectedImages] = useState<{ [key: string]: boolean }>({});
  const [excelExists, setExcelExists] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    // Llamar al backend para verificar si el Excel existe
    fetch('http://localhost:5000/check-excel')
      .then((response) => response.json())
      .then((data) => {
        console.log('Respuesta del backend:', data); // Verificar datos en consola
        setExcelExists(data.exists); // Actualizar el estado con el valor retornado
      })
      .catch((error) => {
        console.error('Error al verificar el archivo Excel:', error);
        setExcelExists(false); // Asumir que no existe en caso de error
      });
  }, []);
  const checkExcelExists = async () => {
    try {
      const response = await axios.get('http://localhost:5000/check-excel');
      setExcelExists(response.data.exists);
    } catch (error) {
      console.error('Error al revisar el archivo Excel:', error);
    }
  };

  const downloadExcel = async () => {
    try {
      const response = await axios.get('http://localhost:5000/download-excel', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'fauna_data.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error al descargar el archivo Excel:', error);
    }
  };

  const deleteExcel = async () => {
    try {
      const response = await axios.post('http://localhost:5000/delete-excel');
      alert(response.data.message);
      setExcelExists(false); // Actualizar estado
    } catch (error) {
      console.error('Error al eliminar el archivo Excel:', error);
    }
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setMessage('Archivo ZIP subido con éxito.')
    setAnalysisData([]);
  };

  const handleStartAnalysis = async () => {
    if (!uploadedFile) return;
  
    setIsAnalyzing(true);
    setMessage('Cargando análisis...');
  
    try {
      // Llamar al backend para iniciar el análisis
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
      });
  
      if (response.ok) {
        // Una vez que el análisis haya terminado, obtener los datos del Excel
        const dataResponse = await fetch('http://localhost:5000/get-analysis-data');
        if (dataResponse.ok) {
          const result = await dataResponse.json();
          const formattedData = result.map((item: any) => ({
            time: item.time,
            date: item.date,
            temperature: item.temperature,
            scientificName: item.scientific_name,
            commonName: item.common_name,
            animalCount: item.animal_count,
            camera: item.camera,
            registrationDate: item.registration_date,
            imageUrl: item.image_url, // URL de la imagen
          }));
          setAnalysisData(formattedData);
          setMessage('Análisis completado')
          checkExcelExists(); // Verificar existencia del Excel después del análisis

        } else {
          setMessage('Error al obtener los datos del análisis.');
        }
      } else {
        setMessage('Error al iniciar el análisis.');
      }
    } catch (error) {
      setMessage('Error durante el análisis.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleDownloadImages = async () => {
    try {
      const response = await fetch('http://localhost:5000/download-images');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'images.zip'); // Nombre del archivo ZIP
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      }
    } catch (error) {
      console.error('Error al descargar las imágenes:', error);
    }
  };
  const handleImageSelect = (id: string) => {
    setSelectedImages(prev => ({
      ...prev,
      [id]: !prev[id], // Alterna el estado del checkbox
    }));
  };
  const handleDownloadSelectedImages = async () => {
    const selectedImageUrls = analysisData
      .filter(item => selectedImages[item.imageUrl]) // Filtra imágenes seleccionadas
      .map(item => item.imageUrl.split('/').pop()); // Obtiene solo los nombres de archivo
  
    if (selectedImageUrls.length === 0) {
      console.error("No se han seleccionado imágenes.");
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/download-selected-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selected_images: selectedImageUrls }),
      });
  
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'selected_images.zip'); // Nombre del archivo ZIP
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      } else {
        console.error('Error al descargar las imágenes seleccionadas');
      }
    } catch (error) {
      console.error('Error downloading selected images:', error);
    }
  };
  const handleImageClick = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', imageUrl.split('/').pop() || 'image.jpg');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };
  const handleReset = async () => {
    try {
      await fetch('http://localhost:5000/cleanup', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  
    setUploadedFile(null);
    setAnalysisData([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-dosgrados-navy">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8">
            <img
              src="logo.png"
              alt="Dos Grados Capital"
              className="h-16 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">
                Bienvenidos a Dos Grados Capital
              </h1>
              <p className="mt-1 text-gray-200">
                Líderes en análisis inteligente y soluciones
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-dosgrados-navy"> Sube tu archivo</h2>
            {!uploadedFile ? (
              <FileUpload onFileUpload={handleFileUpload} />
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="w-6 h-6 text-dosgrados-navy" />
                  <span className="text-gray-900">{uploadedFile.name}</span>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={handleReset}
                >
                  Eliminar
                </Button>
              </div>
            )}
          </div>
          <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
            <h1 style={{ color: '#4CAF50' }}>Gestión del archivo Excel</h1>
            {excelExists === null ? (
              <p>Cargando...</p>
            ) : excelExists ? (
              <div>
                <p>El archivo Excel está disponible.</p>
                <Button
                  onClick={downloadExcel}
                  variant="primary"
                  size="md"
                  className="mr-2" // Espaciado entre botones
                >
                  Descargar Excel
                </Button>
                <Button
                  onClick={deleteExcel}
                  variant="danger"
                  size="md"
                >
                  Eliminar Excel
                </Button>
              </div>
            ) : (
              <p>No hay un archivo Excel disponible actualmente.</p>
            )}
          </div>          
          {/* Analysis Section */}
          {uploadedFile && (
            <div className="space-y-6">
              <Button
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                icon={<PlayCircle className="w-5 h-5" />}
              >
                {isAnalyzing ? 'Analizando...' : 'Empezar análisis'}
              </Button>

              {analysisData.length > 0 && (
                <div className="space-y-6">
                  <DataTable
                    data={analysisData}
                    columns={[
                      {
                        header: 'Select',
                        accessor: 'select',
                        type: 'custom',
                        render: (row: any) => (
                          <input
                            type="checkbox"
                            onChange={() => handleImageSelect(row.imageUrl)} // Llama a la función de selección
                            checked={!!selectedImages[row.imageUrl]} // Marca como seleccionado según el estado
                          />
                        ),
                      },
                      { header: 'Hora', accessor: 'time', type: 'text' },
                      { header: 'Fecha', accessor: 'date', type: 'text' },
                      { header: 'Temperatura', accessor: 'temperature', type: 'text' },
                      { header: 'Nombre científico', accessor: 'scientificName', type: 'text' },
                      { header: 'Nombre común', accessor: 'commonName', type: 'text' },
                      { header: 'Número de animales', accessor: 'animalCount', type: 'text' },
                      { header: 'Cámara', accessor: 'camera', type: 'text' },
                      { header: 'Fecha de registro', accessor: 'registrationDate', type: 'text' },
                      {
                        header: 'Imagen',
                        accessor: 'imageUrl',
                        type: 'image',
                        render: (row: any) => (
                          <img
                            src={row.imageUrl}
                            alt="Thumbnail"
                            className="w-24 h-24 object-cover cursor-pointer"
                            onClick={() => handleImageClick(row.imageUrl)} // Descarga al hacer clic
                          />
                        ),
                      },
                    ]}
                    selectedImages={selectedImages}
                    onImageSelect={handleImageSelect}
                  />
                  {/* Botones de Descarga */}
                  <div className="flex space-x-4">
                    <Button
                      variant="secondary"
                      icon={<Download className="w-5 h-5" />}
                      onClick={handleDownloadImages} // Llama la función para descargar imágenes
                    >
                      Download Images
                    </Button>
                    <Button
                      variant="secondary"
                      icon={<Download className="w-5 h-5" />}
                      onClick={handleDownloadSelectedImages}
                      disabled={Object.values(selectedImages).every(v => !v)} // Deshabilitado si no hay imágenes seleccionadas
                    >
                      Descargar imágenes seleccionadas
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;