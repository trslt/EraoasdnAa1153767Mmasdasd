import React, { useCallback, useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

interface FileWithPreview extends File {
    preview?: string;
}

interface FileUploaderProps {
    maxFiles?: number;
    acceptedFileTypes?: string[];
    onFilesChange?: (files: File[]) => void,
    defaultImageUrl?: string;
}

export default function YoupiterFileUploader({
    maxFiles = 10,
    acceptedFileTypes = ['image/*', '.csv', '.xls', '.xlsx', '.docx'],
    onFilesChange,
    defaultImageUrl
}: FileUploaderProps) {

    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [defaultImageLoaded, setDefaultImageLoaded] = useState<boolean>(defaultImageUrl ? true : false);

    // Inizializza con l'immagine di default se fornita
    useEffect(() => {

        console.log(defaultImageLoaded, defaultImageUrl);
        if (defaultImageUrl && files.length === 0 && defaultImageLoaded) {

            console.log("ci entro qui?")
            // Crea un oggetto "dummy" che simula un file con preview
            const dummyFile = new File([""], "default-image.jpg", {
                type: "image/jpeg",
            }) as FileWithPreview;

            // Aggiungi l'URL dell'immagine predefinita come preview
            dummyFile.preview = defaultImageUrl;

            setFiles([dummyFile]);
        }
    }, [defaultImageUrl, defaultImageLoaded]);

    const handleFileChange = useCallback((newFiles: FileList | null) => {
        if (!newFiles) return;

        if (defaultImageLoaded) {
            setDefaultImageLoaded(false);
        }

        const filesArray = Array.from(newFiles);
        const updatedFiles = filesArray.slice(0, maxFiles - files.length).map(file => {
            if (file.type.startsWith('image/')) {
                return Object.assign(file, {
                    preview: URL.createObjectURL(file)
                });
            }
            return file;
        });

        setFiles(prev => {
            const prevRealFiles = defaultImageLoaded ? [] : prev;
            const combined = [...prevRealFiles, ...updatedFiles];
            const final = combined.slice(0, maxFiles);
            onFilesChange?.(final);
            return final;
        });
    }, [files.length, maxFiles, onFilesChange, defaultImageLoaded]);

    const removeFile = useCallback((fileToRemove: FileWithPreview) => {

        if (fileToRemove.preview === defaultImageUrl) {
            setDefaultImageLoaded(false);
        }

        setFiles(prev => {
            const updated = prev.filter(f => f !== fileToRemove);
            // Filtra i file reali per la callback (escludendo l'immagine di default)
            const realFiles = updated.filter(f => f.preview !== defaultImageUrl);
            onFilesChange?.(realFiles);
            return updated;
        });

        if (fileToRemove.preview) {
            URL.revokeObjectURL(fileToRemove.preview);
        }
    }, [onFilesChange]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const { files } = e.dataTransfer;
        handleFileChange(files);
    }, [handleFileChange]);

    const renderPreview = (file: FileWithPreview) => {
        if (file.preview) {
            return (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={() => removeFile(file)}
                        className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                        <X className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            );
        }

        return (
            <div className="relative flex items-center w-24 h-24 rounded-lg bg-gray-100 p-2">
                <span className="text-xs text-gray-600 break-all">{file.name}</span>
                <button
                    onClick={() => removeFile(file)}
                    className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                    <X className="w-4 h-4 text-gray-600" />
                </button>
            </div>
        );
    };

    const hasReachedLimit = files.length >= maxFiles;

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-4 mb-4">
                {files.map((file, index) => (
                    <div key={`${file.name}-${index}`}>
                        {renderPreview(file)}
                    </div>
                ))}
            </div>

            {!hasReachedLimit && (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                        }`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        multiple
                        accept={acceptedFileTypes.join(',')}
                        onChange={(e) => handleFileChange(e.target.files)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    <div className="flex flex-col items-center">
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">
                            Drop your files here or{' '}
                            <span className="text-blue-500">browse</span>
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            {acceptedFileTypes.join(', ')}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            Add up to {maxFiles} {maxFiles === 1 ? 'file' : 'files'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};