package com.ruteapp.ruteapp.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import org.junit.jupiter.api.Test;

class TelefonoUtilTests {

    @Test
    void normalizaVariantesDeTelefonoMexicanoParaWhatsApp() {
        assertEquals("+5219511234567", TelefonoUtil.normalizar("951 123 4567"));
        assertEquals("+5219511234567", TelefonoUtil.normalizar("+52 951 123 4567"));
        assertEquals("+5219511234567", TelefonoUtil.normalizar("+5219511234567"));
    }

    @Test
    void generaVariantesParaEncontrarTelefonosGuardadosPreviamente() {
        assertEquals(
                List.of("+5219511234567", "+529511234567", "529511234567", "9511234567"),
                TelefonoUtil.variantesBusqueda("9511234567")
        );
    }
}
