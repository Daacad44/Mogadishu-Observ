import { useEffect, useRef, useState, type ReactNode } from "react";

interface InViewProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** Distance before the element enters the viewport to start loading. */
  rootMargin?: string;
  className?: string;
}

/**
 * Renders `children` only once the wrapper scrolls near the viewport. Useful to
 * defer heavy, below-the-fold sections (e.g. chart libraries) so they don't
 * block the initial page load.
 */
export function InView({ children, fallback = null, rootMargin = "200px", className }: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : fallback}
    </div>
  );
}
