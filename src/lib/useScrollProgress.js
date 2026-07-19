import { useEffect, useState } from "react";

// Devuelve el progreso de scroll de la página, de 0 (arriba del todo) a 1 (abajo del todo).
// Usa requestAnimationFrame para no recalcular en cada pixel de scroll.
export function useScrollProgress() {
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    let ticking = false;

    const calcular = () => {
      const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
      const actual = alturaTotal > 0 ? window.scrollY / alturaTotal : 0;
      setProgreso(Math.min(1, Math.max(0, actual)));
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(calcular);
        ticking = true;
      }
    };

    calcular();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return progreso;
}
