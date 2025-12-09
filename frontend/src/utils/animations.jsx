import { motion } from 'framer-motion';

/**
 * ANIMACIONES CON FRAMER MOTION
 * 
 * Componentes y variantes reutilizables para animaciones consistentes
 */

// ============================================
// VARIANTES DE ANIMACIÓN PREDEFINIDAS
// ============================================

export const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

export const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1] // cubic-bezier suave
        }
    }
};

export const fadeInDown = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

export const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

export const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

// Para listas de items con stagger (animación escalonada)
export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

export const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

// ============================================
// COMPONENTES ANIMADOS PREDEFINIDOS
// ============================================

// Contenedor con fade in
export const FadeInContainer = ({ children, className = "", delay = 0 }) => (
    <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ delay }}
        className={className}
    >
        {children}
    </motion.div>
);

// Contenedor con fade in desde abajo
export const FadeInUpContainer = ({ children, className = "", delay = 0 }) => (
    <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay }}
        className={className}
    >
        {children}
    </motion.div>
);

// Lista con animación escalonada
export const StaggerList = ({ children, className = "" }) => (
    <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className={className}
    >
        {children}
    </motion.div>
);

// Item de lista animado
export const StaggerListItem = ({ children, className = "" }) => (
    <motion.div
        variants={staggerItem}
        className={className}
    >
        {children}
    </motion.div>
);

// ============================================
// PROPS DE HOVER REUTILIZABLES
// ============================================

// Hover con scale suave
export const hoverScale = {
    whileHover: { scale: 1.02 },
    transition: { duration: 0.2 }
};

// Hover con scale más pronunciado
export const hoverScaleLarge = {
    whileHover: { scale: 1.05 },
    transition: { duration: 0.2 }
};

// Hover con elevación (shadow)
export const hoverLift = {
    whileHover: { y: -8 },
    transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1]
    }
};

// Tap (click) con scale
export const tapScale = {
    whileTap: { scale: 0.98 },
    transition: { duration: 0.1 }
};

// ============================================
// EJEMPLOS DE USO
// ============================================

/*
// 1. Fade in simple
<FadeInContainer>
  <h1>Título que aparece con fade</h1>
</FadeInContainer>

// 2. Fade in con delay
<FadeInUpContainer delay={0.3}>
  <p>Texto que aparece después</p>
</FadeInUpContainer>

// 3. Lista con stagger
<StaggerList>
  {products.map(product => (
    <StaggerListItem key={product.id}>
      <ProductCard product={product} />
    </StaggerListItem>
  ))}
</StaggerList>

// 4. Card con hover
<motion.div {...hoverLift} {...tapScale}>
  <ProductCard />
</motion.div>

// 5. Botón con animaciones
<motion.button
  {...tapScale}
  whileHover={{ scale: 1.05 }}
  className="btn-primary"
>
  Click me
</motion.button>

// 6. Modal con animación
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
  transition={{ duration: 0.3 }}
>
  <Modal content />
</motion.div>

// 7. Uso manual con variants personalizadas
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
  }}
>
  <Content />
</motion.div>
*/
