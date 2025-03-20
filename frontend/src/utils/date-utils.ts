export const formatDate = (
  dateString: string | undefined,
  options?: Intl.DateTimeFormatOptions,
  locale: string = "en-GB",
): string => {
  if (!dateString) return "Date not specified";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, options).format(date);
};

export const formatTime = (dateString: string | undefined): string => {
  if (!dateString) return "Time not specified";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
};

export const getDuration = (startTime: string | undefined, endTime: string | undefined): string => {
  if (!startTime || !endTime) return "Duration not specified";
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);

  if (durationHours < 24) {
    const roundedHours = Math.round(durationHours);
    return roundedHours === 1 ? "1 hour" : `${roundedHours} hours`;
  } else {
    const durationDays = Math.round(durationHours / 24);
    return durationDays === 1 ? "1 day" : `${durationDays} days`;
  }
};
