import { formatDay, formatTime } from '../utils/scheduling';

export default function ScheduleCard({ schedule }) {
  const isWorking = Boolean(schedule.trabalhaNesseDia);

  return (
    <article className="card schedule-card">
      <h3>{formatDay(schedule.diaDaSemana)}</h3>
      {isWorking ? (
        <>
          <p>
            {formatTime(schedule.horaAbertura)} às {formatTime(schedule.horaFechamento)}
          </p>
          {schedule.horaInicioAlmoco && schedule.horaFimAlmoco ? (
            <small>
              Intervalo: {formatTime(schedule.horaInicioAlmoco)} às {formatTime(schedule.horaFimAlmoco)}
            </small>
          ) : (
            <small>Sem intervalo cadastrado</small>
          )}
        </>
      ) : (
        <p>Fechado neste dia</p>
      )}
    </article>
  );
}
