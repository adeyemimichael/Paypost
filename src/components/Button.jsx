import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-movement-500 hover:bg-movement-600 text-white focus:ring-movement-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
    outline: 'border-2 border-movement-500 text-movement-500 hover:bg-movement-500 hover:text-white focus:ring-movement-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  
  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${disabled || loading ? disabledClasses : ''}
    ${className}
  `.trim();

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;