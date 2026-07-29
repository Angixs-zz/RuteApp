package com.ruteapp.ruteapp.dto.respuesta;

public class WhatsAppRespuesta {

    private final String mensajeSid;
    private final String estado;
    private final String destinatario;
    private final String mensaje;

    public WhatsAppRespuesta(
            String mensajeSid,
            String estado,
            String destinatario,
            String mensaje) {
        this.mensajeSid = mensajeSid;
        this.estado = estado;
        this.destinatario = destinatario;
        this.mensaje = mensaje;
    }

    public String getMensajeSid() {
        return mensajeSid;
    }

    public String getEstado() {
        return estado;
    }

    public String getDestinatario() {
        return destinatario;
    }

    public String getMensaje() {
        return mensaje;
    }
}
