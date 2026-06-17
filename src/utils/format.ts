export const formatNumber = (num: number, decimals = 0): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(decimals);
};

export const formatFullNumber = (num: number): string => {
  return new Intl.NumberFormat('zh-CN').format(Math.round(num));
};

export const formatPercent = (num: number, decimals = 1): string => {
  return (num * 100).toFixed(decimals) + '%';
};

export const formatPercentRaw = (num: number, decimals = 1): string => {
  return num.toFixed(decimals) + '%';
};

export const formatTrend = (trend: number): { label: string; positive: boolean; neutral: boolean } => {
  if (trend === 0) {
    return { label: '0%', positive: false, neutral: true };
  }
  const isPositive = trend > 0;
  return {
    label: (isPositive ? '+' : '') + formatPercentRaw(trend, 1),
    positive: isPositive,
    neutral: false,
  };
};

export const formatShortId = (id: string, chars = 8): string => {
  return id.substring(0, chars) + '...';
};
