package com.syra.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventAttendee;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import com.syra.config.CalendarIntegrationException;
import com.syra.config.GoogleCalendarProperties;
import com.syra.models.Agendamento;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Base64;
import java.util.Collections;
import java.util.List;

@Service
public class GoogleCalendarService {

    private static final String APPLICATION_NAME = "Syra Agenda";

    private final GoogleCalendarProperties properties;
    private Calendar calendarClient;

    public GoogleCalendarService(GoogleCalendarProperties properties) {
        this.properties = properties;
    }

    public boolean isEnabled() {
        return properties.isEnabled()
                && StringUtils.hasText(properties.getCalendarId())
                && StringUtils.hasText(properties.getCredentialsBase64());
    }

    public String createOrUpdateEvent(Agendamento agendamento) {
        if (!isEnabled()) return null;

        try {
            Calendar client = getClient();
            Event event = buildEvent(agendamento);
            String calendarId = properties.getCalendarId();

            if (StringUtils.hasText(agendamento.getGoogleEventId())) {
                Event updated = client.events()
                        .update(calendarId, agendamento.getGoogleEventId(), event)
                        .setSendUpdates(properties.getSendUpdates())
                        .execute();
                return updated.getId();
            }

            Event created = client.events()
                    .insert(calendarId, event)
                    .setSendUpdates(properties.getSendUpdates())
                    .execute();
            return created.getId();
        } catch (Exception ex) {
            throw new CalendarIntegrationException("Falha ao sincronizar com o Google Agenda.", ex);
        }
    }

    public void cancelEventIfPresent(Agendamento agendamento) {
        if (!isEnabled() || !StringUtils.hasText(agendamento.getGoogleEventId())) return;

        try {
            getClient().events()
                    .delete(properties.getCalendarId(), agendamento.getGoogleEventId())
                    .setSendUpdates(properties.getSendUpdates())
                    .execute();
        } catch (Exception ex) {
            throw new CalendarIntegrationException("Falha ao cancelar evento no Google Agenda.", ex);
        }
    }

    private Calendar getClient() throws Exception {
        if (calendarClient != null) return calendarClient;

        byte[] decoded = Base64.getDecoder().decode(properties.getCredentialsBase64().trim());
        GoogleCredentials credentials = GoogleCredentials
                .fromStream(new ByteArrayInputStream(decoded))
                .createScoped(Collections.singleton(CalendarScopes.CALENDAR));

        calendarClient = new Calendar.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName(APPLICATION_NAME)
                .build();

        return calendarClient;
    }

    private Event buildEvent(Agendamento agendamento) {
        String serviceName = agendamento.getServico() != null ? agendamento.getServico().getNome() : "Atendimento";
        String clientName = agendamento.getUsuario() != null ? agendamento.getUsuario().getNome() : "Cliente";
        String phone = agendamento.getUsuario() != null ? agendamento.getUsuario().getTelefone() : null;

        String status = String.valueOf(agendamento.getStatus() == null ? "PENDENTE" : agendamento.getStatus()).toUpperCase();
        String summary = "Syra - " + status + " - " + serviceName + " - " + clientName;
        String description = "Cliente: " + clientName + "\n" +
                "Servico: " + serviceName + "\n" +
                (StringUtils.hasText(phone) ? "Telefone: " + phone + "\n" : "");

        Event event = new Event()
                .setSummary(summary)
                .setDescription(description)
                .setStart(toEventDateTime(agendamento.getDataHoraInicio()))
                .setEnd(toEventDateTime(agendamento.getDataHoraFim()));

        if (StringUtils.hasText(properties.getOwnerEmail())) {
            EventAttendee owner = new EventAttendee().setEmail(properties.getOwnerEmail());
            event.setAttendees(List.of(owner));
        }

        return event;
    }

    private EventDateTime toEventDateTime(LocalDateTime value) {
        ZonedDateTime zoned = value.atZone(ZoneId.of(properties.getTimeZone()));
        DateTime dateTime = new DateTime(zoned.toInstant().toEpochMilli());
        return new EventDateTime().setDateTime(dateTime).setTimeZone(properties.getTimeZone());
    }
}
