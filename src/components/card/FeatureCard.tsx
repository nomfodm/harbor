import { FadeIn } from '../fade/FadeIn';
import { Card } from '../ui/card/Card';
import styles from './FeatureCard.module.css';

interface FeatureCardProps {
  icon: string;
  title: string;
  desc: string;
  delay: number;
}

export function FeatureCard({ icon, title, desc, delay }: FeatureCardProps) {
  return (
    <FadeIn delay={delay}>
      <Card className={styles.card}>
        <div className={styles.icon}>{icon}</div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.desc}>{desc}</p>
      </Card>
    </FadeIn>
  );
}
