package com.ruteapp.ruteapp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;

@Service
public class ServicioCorreo {

    private static final Logger LOGGER = LoggerFactory.getLogger(ServicioCorreo.class);

    private final JavaMailSender mailSender;
    private final boolean habilitado;
    private final String remitente;
    private final String frontendUrl;
    private final String invitationUrl;

    public ServicioCorreo(
            JavaMailSender mailSender,
            @Value("${app.mail.enabled}") boolean habilitado,
            @Value("${app.mail.from}") String remitente,
            @Value("${app.frontend-url}") String frontendUrl,
            @Value("${app.invitation-url}") String invitationUrl) { 
        this.mailSender = mailSender;
        this.habilitado = habilitado;
        this.remitente = remitente;
        this.frontendUrl = frontendUrl;
        this.invitationUrl = invitationUrl; 
    }

    public void enviarBienvenida(Usuario usuario) {
        enviar(
                usuario.getCorreo(),
                "Bienvenido a RuteApp",
                "Hola " + usuario.getNombre() + ",\n\n"
                        + "Tu cuenta fue creada correctamente. Ya puedes iniciar sesión y organizar tus viajes.\n\n"
                        + frontendUrl + "/login\n\n"
                        + "Equipo RuteApp"
        );
    }

    public void enviarRecuperacion(Usuario usuario, String token) {
        String enlace = frontendUrl + "/restablecer-contrasena?token=" + token;

        enviar(
                usuario.getCorreo(),
                "Recupera tu contraseña de RuteApp",
                "Hola " + usuario.getNombre() + ",\n\n"
                        + "Recibimos una solicitud para cambiar tu contraseña. "
                        + "Abre el siguiente enlace; será válido durante 30 minutos y solo puede usarse una vez:\n\n"
                        + enlace + "\n\n"
                        + "Si no solicitaste este cambio, ignora este mensaje.\n\n"
                        + "Equipo RuteApp"
        );
    }

    public void enviarInvitacion(Usuario invitado, Viaje viaje) {
        enviar(
                invitado.getCorreo(),
                "Invitación al viaje " + viaje.getNombre(),
                "Hola " + invitado.getNombre() + ",\n\n"
                        + viaje.getOrganizador().getNombre()
                        + " te invitó al viaje \""
                        + viaje.getNombre()
                        + "\". Ingresa a RuteApp para aceptar o rechazar la invitación:\n\n"
                        + invitationUrl + "\n\n"
                        + "Equipo RuteApp"
        );
    }

    private void enviar(String destinatario, String asunto, String contenido) {
        if (!habilitado) {
            LOGGER.info("Envío de correo deshabilitado; asunto: {}", asunto);
            return;
        }

        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setFrom(remitente);
        mensaje.setTo(destinatario);
        mensaje.setSubject(asunto);
        mensaje.setText(contenido);

        try {
            mailSender.send(mensaje);
        } catch (MailException ex) {
            LOGGER.error("No fue posible enviar el correo con asunto: {}", asunto, ex);
        }
    }
}
