package com.ruteapp.ruteapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.twilio.Twilio;

import jakarta.annotation.PostConstruct;

@Component
public class TwilioConfig {

    private final String accountSid;
    private final String authToken;
    private final String whatsappFrom;

    public TwilioConfig(
            @Value("${TWILIO_ACCOUNT_SID:${twilio.account-sid:}}") String accountSid,
            @Value("${TWILIO_AUTH_TOKEN:${twilio.auth-token:}}") String authToken,
            @Value("${TWILIO_WHATSAPP_FROM:${twilio.whatsapp-from:}}") String whatsappFrom) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.whatsappFrom = whatsappFrom;
    }

    @PostConstruct
    void inicializar() {
        if (estaConfigurado()) {
            Twilio.init(accountSid, authToken);
        }
    }

    public boolean estaConfigurado() {
        return !accountSid.isBlank()
                && !authToken.isBlank()
                && !whatsappFrom.isBlank();
    }

    public String getWhatsappFrom() {
        return whatsappFrom;
    }
}
