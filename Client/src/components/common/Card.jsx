import React from "react";
import { motion } from "framer-motion";
import { theme } from "../../constants";

/**
 * Reusable Card component for consistent card styling
 */
const Card = ({
  children,
  className = "",
  hover = true,
  padding = "lg",
  variant = "default", // default, gradient, bordered
  ...props
}) => {
  const baseStyles = "rounded-2xl transition-all duration-300";
  
  const paddingStyles = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-12",
  };
  
  const hoverStyles = hover
    ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    : "";
  
  const variantStyles = {
    default: `bg-white border border-[${theme.light}]`,
    gradient: "",
    bordered: `bg-transparent border-2 border-[${theme.primary}]`,
  };
  
  const combinedClassName = `${baseStyles} ${paddingStyles[padding]} ${hoverStyles} ${variantStyles[variant]} ${className}`;
  
  if (variant === "gradient") {
    return (
      <motion.div
        className={combinedClassName}
        style={{
          background: theme.gradients.primarySubtle,
        }}
        whileHover={hover ? { y: -4 } : {}}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <motion.div
      className={combinedClassName}
      style={{
        backgroundColor: variant === "default" ? theme.white : "transparent",
        borderColor: variant === "bordered" ? theme.primary : theme.light,
      }}
      whileHover={hover ? { y: -4 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
