export const smoothSlideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 30 : -30, opacity: 0, scale: 0.98 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -30 : 30, opacity: 0, scale: 0.98 }),
};
