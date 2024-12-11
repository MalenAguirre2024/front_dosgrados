import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { useDropzone } from '../hooks/useDropzone';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  acceptedFileTypes?: string[];
}

export function FileUpload({ onFileUpload, acceptedFileTypes = ['.zip'] }: FileUploadProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        // Subir el archivo al backend
        const response = await fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          onFileUpload(file); // Notificar al parent que el archivo fue subido
        } else {
          console.error('Error uploading file');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.join(','),
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-lg p-8
        flex flex-col items-center justify-center
        transition-colors cursor-pointer
        ${isDragActive 
          ? 'border-dosgrados-navy bg-blue-50' 
          : 'border-gray-300 hover:border-dosgrados-navy'
        }
      `}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 text-dosgrados-navy mb-4" />
      <p className="text-lg text-dosgrados-navy">
        {isDragActive
          ? "Drop your file here"
          : "Arrastra tu carpeta aquí o haz click para seleccionar la carpeta"
        }
      </p>
      <p className="text-sm text-dosgrados-gray mt-2">
        Archivos soportados: {acceptedFileTypes.join(', ')}
      </p>
    </div>
  );
}
