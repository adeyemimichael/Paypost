import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  onClick,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden';
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const cardClasses = `${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`.trim();

  const CardComponent = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileHover: { y: -2 },
    whileTap: { scale: 0.98 },
  } : {};

  return (
    <CardComponent
      className={cardClasses}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

export default Card;