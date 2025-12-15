import React from "react";
import { motion } from "framer-motion";
import { theme } from "../../constants";

/**
 * Reusable Button component with consistent styling
 */
const Button = ({
  children,
  onClick,
  variant = "primary", // primary, secondary, outline
  size = "md", // sm, md, lg
  icon: Icon,
  iconPosition = "right",
  href,
  className = "",
  disabled = false,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-8 py-4 text-base",
    lg: "px-10 py-5 text-lg",
  };
  
  const variantStyles = {
    primary: `bg-[${theme.primary}] text-white hover:shadow-lg hover:-translate-y-0.5`,
    secondary: `bg-[${theme.lighter}] text-[${theme.primary}] hover:shadow-md`,
    outline: `border-2 border-[${theme.primary}] text-[${theme.primary}] bg-transparent hover:shadow-md`,
  };
  
  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  
  const content = (
    <>
      {Icon && iconPosition === "left" && <Icon className="w-5 h-5" />}
      {children}
      {Icon && iconPosition === "right" && (
        <motion.div
          whileHover={{ x: 3 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
      )}
    </>
  );
  
  if (href) {
    return (
      <a
        href={href}
        className={combinedClassName}
        style={{
          backgroundColor: variant === "primary" ? theme.primary : variant === "secondary" ? theme.lighter : "transparent",
          color: variant === "outline" ? theme.primary : variant === "secondary" ? theme.primary : theme.white,
          borderColor: variant === "outline" ? theme.primary : "transparent",
        }}
        {...props}
      >
        {content}
      </a>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className={combinedClassName}
      disabled={disabled}
      style={{
        backgroundColor: variant === "primary" ? theme.primary : variant === "secondary" ? theme.lighter : "transparent",
        color: variant === "outline" ? theme.primary : variant === "secondary" ? theme.primary : theme.white,
        borderColor: variant === "outline" ? theme.primary : "transparent",
      }}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
