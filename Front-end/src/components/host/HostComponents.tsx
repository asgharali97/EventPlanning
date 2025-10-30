import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
      <h2 className="satoshi-bold text-xl text-[var(--foreground)] mb-6">
        {title}
      </h2>
      {children}
    </div>
  );
}

interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
}

export function FormLabel({ children, required }: FormLabelProps) {
  return (
    <label className="satoshi-medium text-sm text-[var(--foreground)] block mb-2">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

interface FormDescriptionProps {
  children: React.ReactNode;
}

export function FormDescription({ children }: FormDescriptionProps) {
  return (
    <p className="satoshi-regular text-xs text-[var(--muted-foreground)] mt-1">
      {children}
    </p>
  );
}

interface ErrorMessageProps {
  message?: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  return (
    <p className="satoshi-regular text-xs text-red-500 mt-1">
      {message}
    </p>
  );
}

interface ImageUploadProps {
  preview: string | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  isUploading?: boolean;
  error?: string;
}

export function ImageUpload({
  preview,
  onFileSelect,
  onRemove,
  isUploading,
  error,
}: ImageUploadProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div>
      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <>
                <Loader2 className="w-10 h-10 text-[var(--muted-foreground)] animate-spin mb-3" />
                <p className="satoshi-medium text-sm text-[var(--muted-foreground)]">
                  Processing...
                </p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-[var(--muted-foreground)] mb-3" />
                <p className="satoshi-medium text-sm text-[var(--foreground)] mb-1">
                  Click to select cover image
                </p>
                <p className="satoshi-regular text-xs text-[var(--muted-foreground)]">
                  PNG, JPG up to 5MB
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
            disabled={isUploading}
          />
        </label>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      {error && <ErrorMessage message={error} />}
    </div>
  );
}

// Page Header
interface PageHeaderProps {
  title: string;
  description: string;
  onBack?: () => void;
}

export function PageHeader({ title, description, onBack }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 -ml-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
      )}
      <h1 className="clash-bold text-3xl md:text-4xl text-[var(--foreground)] mb-2">
        {title}
      </h1>
      <p className="satoshi-regular text-base text-[var(--muted-foreground)]">
        {description}
      </p>
    </div>
  );
}