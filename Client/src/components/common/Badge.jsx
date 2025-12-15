import React from "react";
import { theme } from "../../constants";

/**
 * Reusable Badge component for tags and labels
 */
const Badge = ({
  children,
  variant = "default", // default, primary, success, warning
  size = "md", // sm, md, lg
  className = "",
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-full";
  
  const sizeStyles = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };
  
  const variantStyles = {
    default: `bg-[${theme.lighter}] text-[${theme.primaryMedium}]`,
    primary: `bg-[${theme.primary}] text-white`,
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
  };
  
  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  
  return (
    <span
      className={combinedClassName}
      style={{
        backgroundColor: variant === "default" ? theme.lighter : variant === "primary" ? theme.primary : undefined,
        color: variant === "default" ? theme.primaryMedium : variant === "primary" ? theme.white : undefined,
      }}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
