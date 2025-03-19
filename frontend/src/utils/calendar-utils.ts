import Event from "@/types/event";
import ical from "ical-generator";

export const downloadICalFile = (event: Event): void => {
  const calendar = ical({
    name: event.title,
    timezone: "Europe/London",
  });

  calendar.createEvent({
    start: new Date(event.startTime),
    end: new Date(event.endTime),
    summary: event.title,
    description: event.description,
    location: event.location,
    url: window.location.href,
  });

  const blob = new Blob([calendar.toString()], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateGoogleCalendarUrl = (event: Event): string => {
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);

  const formatForGoogleCalendar = (date: Date): string => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const startFormatted = formatForGoogleCalendar(startDate);
  const endFormatted = formatForGoogleCalendar(endDate);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${startFormatted}/${endFormatted}`,
    details: event.description || "",
    location: event.location || "",
    ctz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const openGoogleCalendar = (event: Event): void => {
  const url = generateGoogleCalendarUrl(event);
  window.open(url, "_blank");
};
