import React from "react";
import { motion } from "framer-motion";

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center space-x-1"
  >
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-gray-400 rounded-full"
        animate={{
          y: [-4, 4, -4],
          transition: { repeat: Infinity, duration: 0.6, delay: i * 0.1 },
        }}
      />
    ))}
  </motion.div>
);

export default TypingIndicator;
