import { forwardRef } from "react";

const Card = forwardRef(function Card({ children, className = "" }, ref) {
  return (
    <div ref={ref} className={`bg-surface border border-border rounded-xl2 p-6 ${className}`}>
      {children}
    </div>
  );
});

export default Card;
