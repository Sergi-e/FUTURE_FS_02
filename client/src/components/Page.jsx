import { motion } from "framer-motion";

/**
 * Shared page shell — fade + slide on route change.
 * @param {object} props
 * @param {import("react").ReactNode} props.children
 * @param {string} [props.className]
 */
export default function Page({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
