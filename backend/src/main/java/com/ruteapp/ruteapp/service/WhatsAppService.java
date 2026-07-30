package com.ruteapp.ruteapp.service;

import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ruteapp.ruteapp.config.TwilioConfig;
import com.ruteapp.ruteapp.dto.entrada.WhatsAppEntrada;
import com.ruteapp.ruteapp.dto.respuesta.WhatsAppRespuesta;
import com.ruteapp.ruteapp.exception.ComunicacionException;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.util.TelefonoUtil;
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
    //no se sube

    public WhatsAppRespuesta enviar(WhatsAppEntrada entrada) {
        if (!twilioConfig.estaConfigurado()) {
            throw new ComunicacionException(
                    "El servicio de WhatsApp no está configurado");
        }

        String telefono = TelefonoUtil.normalizar(entrada.getTelefono());
        String destinatario = "whatsapp:" + telefono;

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
                    telefono,
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

    public WhatsAppRespuesta enviar(String telefono, String mensaje) {
        WhatsAppEntrada entrada = new WhatsAppEntrada();
        entrada.setTelefono(telefono);
        entrada.setMensaje(mensaje);
        return enviar(entrada);
    }

    public void enviarNotificacion(Usuario usuario, String mensaje) {
        if (usuario.getTelefono() == null || usuario.getTelefono().isBlank()) {
            return;
        }

        try {
            enviar(usuario.getTelefono(), mensaje);
        } catch (ComunicacionException ex) {
            LOGGER.warn(
                    "No se envió la notificación de WhatsApp al usuario {}: {}",
                    usuario.getId(),
                    ex.getMessage()
            );
        }
    }
}
