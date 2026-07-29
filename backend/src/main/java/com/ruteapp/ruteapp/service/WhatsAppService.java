package com.ruteapp.ruteapp.service;

import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ruteapp.ruteapp.config.TwilioConfig;
import com.ruteapp.ruteapp.dto.entrada.WhatsAppEntrada;
import com.ruteapp.ruteapp.dto.respuesta.WhatsAppRespuesta;
import com.ruteapp.ruteapp.exception.ComunicacionException;
import com.twilio.exception.ApiException;
import com.twilio.exception.TwilioException;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
public class WhatsAppService {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhatsAppService.class);

    private final TwilioConfig twilioConfig;

    public WhatsAppService(TwilioConfig twilioConfig) {
        this.twilioConfig = twilioConfig;
    }

    public WhatsAppRespuesta enviar(WhatsAppEntrada entrada) {
        if (!twilioConfig.estaConfigurado()) {
            throw new ComunicacionException(
                    "El servicio de WhatsApp no está configurado");
        }

        String destinatario = "whatsapp:" + entrada.getTelefono().trim();

        try {
            Message mensaje = Message.creator(
                    new PhoneNumber(destinatario),
                    new PhoneNumber(twilioConfig.getWhatsappFrom()),
                    entrada.getMensaje().trim()
            ).create();

            String estado = mensaje.getStatus() == null
                    ? "desconocido"
                    : mensaje.getStatus().toString().toLowerCase(Locale.ROOT);

            return new WhatsAppRespuesta(
                    mensaje.getSid(),
                    estado,
                    entrada.getTelefono().trim(),
                    "Mensaje enviado correctamente"
            );
        } catch (ApiException ex) {
            LOGGER.error(
                    "Twilio rechazó el mensaje de WhatsApp. Código: {}",
                    ex.getCode()
            );
            throw new ComunicacionException(
                    "No fue posible enviar el mensaje por WhatsApp. "
                            + "Verifica que el número esté unido al Sandbox y que la conversación siga activa."
            );
        } catch (TwilioException ex) {
            LOGGER.error("No fue posible conectar con Twilio", ex);
            throw new ComunicacionException(
                    "No fue posible conectar con el servicio de WhatsApp"
            );
        }
    }
}
