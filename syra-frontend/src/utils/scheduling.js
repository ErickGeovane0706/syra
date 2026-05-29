export const DAY_ORDER = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export const DAY_LABELS = {
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

const DAY_INDEX_TO_KEY = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

export function formatDay(day) {
  return DAY_LABELS[day] || day || 'Dia não informado';
}

export function toDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDayKeyFromDate(dateString) {
  if (!dateString) return '';

  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return DAY_INDEX_TO_KEY[date.getDay()] || '';
}

export function combineDateAndTime(dateString, timeString) {
  return `${dateString}T${String(timeString).slice(0, 5)}:00`;
}

export function formatTime(timeString) {
  return String(timeString || '').slice(0, 5) || '--:--';
}

export function createDefaultWeeklySchedule() {
  return DAY_ORDER.reduce((accumulator, day) => {
    accumulator[day] = {
      id: null,
      diaDaSemana: day,
      trabalhaNesseDia: day !== 'SUNDAY',
      horaAbertura: '08:00',
      horaFechamento: '18:00',
      horaInicioAlmoco: '12:00',
      horaFimAlmoco: '13:00',
    };
    return accumulator;
  }, {});
}

export function buildWeeklyScheduleDraft(schedules = []) {
  const base = createDefaultWeeklySchedule();

  schedules.forEach((schedule) => {
    if (!schedule?.diaDaSemana) return;

    base[schedule.diaDaSemana] = {
      ...base[schedule.diaDaSemana],
      ...schedule,
      horaAbertura: formatTime(schedule.horaAbertura || base[schedule.diaDaSemana].horaAbertura),
      horaFechamento: formatTime(schedule.horaFechamento || base[schedule.diaDaSemana].horaFechamento),
      horaInicioAlmoco: schedule.horaInicioAlmoco ? formatTime(schedule.horaInicioAlmoco) : '',
      horaFimAlmoco: schedule.horaFimAlmoco ? formatTime(schedule.horaFimAlmoco) : '',
    };
  });

  return base;
}

function timeToMinutes(timeString) {
  if (!timeString) return null;
  const [hours, minutes] = String(timeString).slice(0, 5).split(':').map(Number);
  return (hours * 60) + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function parseLocalDateTime(value) {
  if (!value) return null;

  const [datePart, timePart = '00:00:00'] = String(value).split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours = 0, minutes = 0, seconds = 0] = timePart.split(':').map(Number);

  return new Date(year, month - 1, day, hours, minutes, seconds);
}

function buildWindows(schedule) {
  if (!schedule?.trabalhaNesseDia) return [];

  const start = timeToMinutes(schedule.horaAbertura);
  const end = timeToMinutes(schedule.horaFechamento);

  if (start == null || end == null || end <= start) return [];

  const lunchStart = timeToMinutes(schedule.horaInicioAlmoco);
  const lunchEnd = timeToMinutes(schedule.horaFimAlmoco);

  if (
    lunchStart == null ||
    lunchEnd == null ||
    lunchEnd <= lunchStart ||
    lunchStart <= start ||
    lunchEnd >= end
  ) {
    return [{ start, end }];
  }

  return [
    { start, end: lunchStart },
    { start: lunchEnd, end },
  ];
}

function isBlockingAppointment(appointment) {
  const status = String(appointment?.status || '').toUpperCase();
  return !status.includes('CANCEL');
}

function extractAppointmentRange(appointment, dateString) {
  if (!isBlockingAppointment(appointment)) return null;

  const startRaw = appointment?.dataHoraInicio || appointment?.inicio || appointment?.dataInicio || appointment?.dataHora;
  if (!startRaw) return null;

  const startDate = parseLocalDateTime(startRaw);
  if (!startDate) return null;

  if (toDateInputValue(startDate) !== dateString) return null;

  const endRaw = appointment?.dataHoraFim || appointment?.fim || appointment?.dataFim;
  const duration = Number(
    appointment?.duracaoMinutos || appointment?.servico?.duracaoMinutos || appointment?.servicoDuracaoMinutos || 0,
  );

  const endDate = endRaw
    ? parseLocalDateTime(endRaw)
    : new Date(startDate.getTime() + (duration > 0 ? duration : 60) * 60 * 1000);

  return {
    start: startDate.getHours() * 60 + startDate.getMinutes(),
    end: endDate.getHours() * 60 + endDate.getMinutes(),
  };
}

function overlaps(candidate, blocked) {
  return candidate.start < blocked.end && candidate.end > blocked.start;
}

export function buildAvailableSlots({
  date,
  schedule,
  serviceDuration,
  appointments = [],
  stepMinutes = 15,
}) {
  if (!date || !schedule?.trabalhaNesseDia || !serviceDuration) return [];

  const duration = Number(serviceDuration);
  if (!Number.isFinite(duration) || duration <= 0) return [];

  const windows = buildWindows(schedule);
  const blockedRanges = appointments
    .map((appointment) => extractAppointmentRange(appointment, date))
    .filter(Boolean);

  const slots = [];

  windows.forEach((window) => {
    for (let start = window.start; start + duration <= window.end; start += stepMinutes) {
      const candidate = { start, end: start + duration };
      const hasConflict = blockedRanges.some((blocked) => overlaps(candidate, blocked));

      if (!hasConflict) {
        const time = minutesToTime(start);
        slots.push({
          time,
          value: combineDateAndTime(date, time),
          label: `${time} · termina às ${minutesToTime(start + duration)}`,
        });
      }
    }
  });

  return slots;
}

