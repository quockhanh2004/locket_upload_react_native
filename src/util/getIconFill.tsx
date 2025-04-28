export const getIconFill = (icon: string) => {
  if (icon === 'clock.fill') {
    return '🕒';
  }
  if (icon === 'location.fill') {
    return '📍';
  }
  return icon;
};
