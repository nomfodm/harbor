import type { CSSProperties } from "react";
import type { HeroVariant } from "../../types";
import styles from "./HeroBg.module.css";

interface HeroBgProps {
  variant?: HeroVariant;
}

export function HeroBg({ variant = "cosmic" }: HeroBgProps) {
  const orbs = [
    {
      left: "5%",
      top: "15%",
      size: 600,
      col: "rgba(37,195,232,0.09)",
      dur: 14,
      del: 0,
    },
    {
      left: "60%",
      top: "60%",
      size: 500,
      col: "rgba(86,37,232,0.13)",
      dur: 17,
      del: 4,
    },
    {
      left: "75%",
      top: "5%",
      size: 350,
      col: "rgba(39,43,242,0.08)",
      dur: 12,
      del: 8,
    },
  ];

  return (
    <div className={styles.root} data-variant={variant}>
      {orbs.map((orb, index) => (
        <div
          key={index}
          className={styles.orb}
          style={
            {
              "--orb-left": orb.left,
              "--orb-top": orb.top,
              "--orb-size": `${orb.size}px`,
              "--orb-color": orb.col,
              "--orb-blur": `${orb.size * 0.45}px`,
              "--orb-duration": `${orb.dur}s`,
              "--orb-delay": `${orb.del}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
