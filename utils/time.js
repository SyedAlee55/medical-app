export const GLOBAL_TIMEZONE = 'Asia/Karachi' // Standard global time for the application (Pakistan/Rawalpindi)

export function formatGlobalDate(dateInput) {
  if (!dateInput) return ''
  return new Date(dateInput).toLocaleDateString('en-US', {
    timeZone: GLOBAL_TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatGlobalTime(dateInput) {
  if (!dateInput) return ''
  return new Date(dateInput).toLocaleTimeString('en-US', {
    timeZone: GLOBAL_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatGlobalDateTime(dateInput) {
  if (!dateInput) return ''
  return new Date(dateInput).toLocaleString('en-US', {
    timeZone: GLOBAL_TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getGlobalDate() {
    // Returns a Date object adjusted to represent the current time in the global timezone
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: GLOBAL_TIMEZONE }));
}

export function localDateTimeToUTC(dateTimeString) {
  if (!dateTimeString) return null;
  // dateTimeString is from datetime-local like "2026-05-26T03:00" or similar
  const [datePart, timePart] = dateTimeString.split('T');
  if (!datePart || !timePart) return new Date(dateTimeString).toISOString();

  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  // Construct a date in system local time
  const date = new Date(year, month - 1, day, hour, minute);

  // Convert to target timezone string
  const tzString = date.toLocaleString('en-US', { timeZone: GLOBAL_TIMEZONE });
  const tzDate = new Date(tzString);

  // Math: UTC time = System Local Time + (System Local Time - Target Time)
  const diff = date.getTime() - tzDate.getTime();
  
  return new Date(date.getTime() + diff).toISOString();
}

export function getGlobalDateTimeLocalString(d = new Date()) {
  const tzString = d.toLocaleString('en-US', { timeZone: GLOBAL_TIMEZONE });
  const localDate = new Date(tzString);
  const Y = localDate.getFullYear();
  const M = String(localDate.getMonth() + 1).padStart(2, '0');
  const D = String(localDate.getDate()).padStart(2, '0');
  const H = String(localDate.getHours()).padStart(2, '0');
  const Min = String(localDate.getMinutes()).padStart(2, '0');
  return `${Y}-${M}-${D}T${H}:${Min}`;
}
