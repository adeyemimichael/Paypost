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
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden';
  
  const variants = {
    primary: 'bg-movement-500 hover:bg-movement-600 text-white focus:ring-movement-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 shadow-md hover:shadow-lg',
    outline: 'border-2 border-movement-500 text-movement-500 hover:bg-movement-500 hover:text-white focus:ring-movement-500 shadow-md hover:shadow-lg',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 shadow-lg hover:shadow-xl',
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
      whileHover={!disabled && !loading ? { 
        scale: 1.02,
        y: -2,
      } : {}}
      whileTap={!disabled && !loading ? { 
        scale: 0.98,
        y: 0,
      } : {}}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Shimmer effect for primary buttons */}
      {variant === 'primary' && !disabled && !loading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}
      
      {loading ? (
        <div className="flex items-center justify-center">
          <motion.div 
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;