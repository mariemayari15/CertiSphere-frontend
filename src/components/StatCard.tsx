import React, { memo } from 'react';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

interface Trend {
  value: number;
  isPositive: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  trend?: Trend;
  className?: string;
}

const StatCard = memo(function StatCard({
  icon,
  value,
  label,
  trend,
  className = '',
}: StatCardProps) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-icon-wrapper">{icon}</div>
      <div className="stat-details">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
      {trend && (
        <div className={`trend-indicator ${trend.isPositive ? 'positive' : 'negative'}`}>
          {trend.isPositive ? <FiArrowUp /> : <FiArrowDown />}
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
  );
});

export default StatCard;
