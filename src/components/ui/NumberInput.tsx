"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    onChange: (e: { target: { name: string; value: string } }) => void;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
    ({ value, onChange, name, ...props }, ref) => {
        // Values passed in should be raw strings/numbers (e.g. "1000")
        // We format them for display (e.g. "1,000")

        const format = (val: string | number | undefined) => {
            if (!val) return "";
            const num = Number(val);
            if (isNaN(num)) return val.toString();
            return num.toLocaleString();
        };

        const [displayValue, setDisplayValue] = React.useState(format(value as string));

        React.useEffect(() => {
            setDisplayValue(format(value as string));
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            // Allow only numbers and commas
            const rawValue = val.replace(/,/g, "");

            if (rawValue === "" || /^-?\d*$/.test(rawValue)) {
                setDisplayValue(val);
                // Propagate raw value to parent
                onChange({
                    target: {
                        name: name || "",
                        value: rawValue
                    }
                });
            }
        };

        const handleBlur = () => {
            // Re-format on blur to ensure clean "1,000" look even if user typed craziness
            // But actually, useEffect already handles this if parent state updates.
            // If parent doesn't update (invalid), we might want to revert?
            // For now, rely on parent updating 'value' prop which triggers useEffect.
        };

        return (
            <Input
                {...props}
                ref={ref}
                type="text"
                name={name}
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`text-right ${props.className || ""}`}
            />
        );
    }
);

NumberInput.displayName = "NumberInput";
