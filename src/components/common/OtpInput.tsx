import { useRef } from "react";

interface Props {
  length?: number;
  onChange: (otp: string) => void;
}

export default function OtpInput({ length = 6, onChange }: Props) {
  const inputs = useRef<HTMLInputElement[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    if (inputs.current[index]) {
      inputs.current[index].value = value;
    }

    if (value && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    const otp = inputs.current.map((i) => i?.value || "").join("");
    onChange(otp);
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          ref={(el) => {
            if (el) inputs.current[index] = el;
          }}
          className="w-10 h-10 border text-center text-lg"
          onChange={(e) => handleChange(e.target.value, index)}
        />
      ))}
    </div>
  );
}