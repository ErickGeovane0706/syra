package com.syra.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.google.calendar")
public class GoogleCalendarProperties {

    private boolean enabled;
    private String calendarId;
    private String credentialsBase64;
    private String timeZone = "America/Fortaleza";
    private String ownerEmail;
    private String sendUpdates = "all";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getCalendarId() {
        return calendarId;
    }

    public void setCalendarId(String calendarId) {
        this.calendarId = calendarId;
    }

    public String getCredentialsBase64() {
        return credentialsBase64;
    }

    public void setCredentialsBase64(String credentialsBase64) {
        this.credentialsBase64 = credentialsBase64;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public String getSendUpdates() {
        return sendUpdates;
    }

    public void setSendUpdates(String sendUpdates) {
        this.sendUpdates = sendUpdates;
    }
}
