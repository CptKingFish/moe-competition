"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  onBlur?: () => void;
  error?: {
    message: string;
  };
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onBlur,
  error,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onChange(file);
    if (onBlur) {
      onBlur();
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Banner Image</Label>
            <div className="flex items-center">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                onBlur={onBlur}
                className="hidden"
                ref={fileInputRef}
              />
              <Button onClick={handleButtonClick} variant="outline">
                Choose File
              </Button>
              <span className="ml-3 text-sm text-gray-500">
                {value ? value.name : "No file chosen"}
              </span>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error.message}</p>}

          {previewUrl && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Preview:</p>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUpload;
