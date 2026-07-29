package com.ruteapp.ruteapp.dto.entrada;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class UsuarioAdminEntrada {
    @NotBlank(message = "El nombre es obligatorio") private String nombre;
    @NotBlank(message = "El correo es obligatorio") @Email(message = "El correo no es válido") private String correo;
    @Pattern(regexp = "^$|^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$", message = "La contraseña debe tener 8 caracteres, una mayúscula, un número y un carácter especial") private String password;
    @Pattern(regexp = "^$|^(?:\\+?52)?\\d{10}$|^\\+[1-9]\\d{7,14}$", message = "El teléfono debe tener 10 dígitos mexicanos o usar formato internacional") private String telefono;
    @NotNull(message = "El rol es obligatorio") private Long rolId;
    @NotNull(message = "El estado es obligatorio") private Boolean activo;

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public Long getRolId() { return rolId; }
    public void setRolId(Long rolId) { this.rolId = rolId; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
