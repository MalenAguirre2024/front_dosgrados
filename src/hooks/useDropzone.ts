import { useCallback, useState } from 'react';

interface DropzoneOptions {
  onDrop: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}

export function useDropzone({ onDrop, accept, multiple = false }: DropzoneOptions) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDropHandler = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (!multiple && files.length > 1) {
      files.splice(1);
    }
    
    if (accept) {
      const acceptedTypes = accept.split(',');
      const validFiles = files.filter(file =>
        acceptedTypes.some(type => 
          file.name.toLowerCase().endsWith(type.trim().toLowerCase())
        )
      );
      onDrop(validFiles);
    } else {
      onDrop(files);
    }
  }, [onDrop, accept, multiple]);

  const onClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept || '';
    input.multiple = multiple;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      onDrop(files);
    };
    input.click();
  }, [onDrop, accept, multiple]);

  return {
    getRootProps: () => ({
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop: onDropHandler,
      onClick,
    }),
    getInputProps: () => ({
      accept,
      multiple,
      type: 'file',
      style: { display: 'none' },
    }),
    isDragActive,
  };
}