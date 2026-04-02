import React, { memo, useRef } from "react";
import { Camera, Image as ImageIcon, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadModuleProps {
  value: string;
  onChange: (v: string) => void;
}

export const ImageUploadModule = memo(({ value, onChange }: ImageUploadModuleProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
           <Camera className="h-3.5 w-3.5 text-blue-600/70" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Texture Projection</span>
        </div>
        {value && (
          <button onClick={() => onChange("")} className="h-7 w-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div 
        onClick={() => !value && fileInputRef.current?.click()}
        className={cn(
          "relative h-48 rounded-[2rem] border-2 border-dashed transition-all duration-700 flex flex-col items-center justify-center overflow-hidden group cursor-pointer",
          value 
            ? "border-blue-600/20 bg-blue-50/5" 
            : "border-slate-100 bg-slate-50/30 hover:border-blue-200 hover:bg-blue-50/10"
        )}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        
        {value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
               <div className="bg-white/90 p-3 rounded-2xl shadow-xl">
                  <Upload className="h-5 w-5 text-blue-600" />
               </div>
               <p className="mt-3 text-[9px] font-black text-white uppercase tracking-widest drop-shadow-md">Remap Texture</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="h-16 w-16 rounded-[1.5rem] bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 group-hover:shadow-xl transition-all duration-500">
                <ImageIcon className="h-7 w-7 text-slate-200 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="text-center">
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">Upload Graphism</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Supports PNG, JPG, JPEG (Max 5MB)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
