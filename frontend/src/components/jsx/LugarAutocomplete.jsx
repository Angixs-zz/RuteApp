import { useEffect, useId, useRef, useState } from 'react';
import api from '../../service/api';

const MINIMO_CARACTERES = 3;

export default function LugarAutocomplete({
  label,
  placeholder,
  value,
  onSelectLugar,
  required = false,
  error,
}) {
  const inputId = useId();
  const wrapperRef = useRef(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState('');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMostrarDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (terminoBusqueda.length < MINIMO_CARACTERES) {
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setCargando(true);
      setErrorBusqueda('');

      try {
        const response = await api.get('/lugares/autocompletar', {
          params: { texto: terminoBusqueda },
          signal: controller.signal,
        });
        const resultados = Array.isArray(response.data) ? response.data : [];
        setSugerencias(resultados);
        setMostrarDropdown(true);
      } catch (err) {
        if (err.code !== 'ERR_CANCELED') {
          setSugerencias([]);
          setMostrarDropdown(true);
          setErrorBusqueda('No fue posible consultar lugares. Intenta nuevamente.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [terminoBusqueda]);

  const handleInputChange = (event) => {
    const texto = event.target.value;
    onSelectLugar(texto, null);

    if (texto.trim().length >= MINIMO_CARACTERES) {
      setTerminoBusqueda(texto.trim());
      return;
    }

    setTerminoBusqueda('');
    setSugerencias([]);
    setMostrarDropdown(false);
    setCargando(false);
    setErrorBusqueda('');
  };

  const seleccionarSugerencia = (sugerencia) => {
    const textoSeleccionado = sugerencia.direccionFormateada || sugerencia.nombre;
    setTerminoBusqueda('');
    setSugerencias([]);
    setMostrarDropdown(false);
    onSelectLugar(textoSeleccionado, sugerencia);
  };

  const mensajeAyuda = error || errorBusqueda;

  return (
    <div className={`field place-autocomplete${error ? ' error' : ''}`} ref={wrapperRef}>
      <label htmlFor={inputId}>{label}</label>
      <div className="place-input-wrap">
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => sugerencias.length > 0 && setMostrarDropdown(true)}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={mostrarDropdown}
          aria-controls={`${inputId}-sugerencias`}
          aria-invalid={Boolean(error)}
          aria-describedby={mensajeAyuda ? `${inputId}-ayuda` : undefined}
        />
        {cargando && <span className="place-loading">Buscando...</span>}
      </div>

      {mostrarDropdown && (
        <ul className="place-suggestions" id={`${inputId}-sugerencias`} role="listbox">
          {sugerencias.map((sugerencia) => (
            <li key={sugerencia.placeId} role="option" aria-selected="false">
              <button type="button" onClick={() => seleccionarSugerencia(sugerencia)}>
                <strong>{sugerencia.nombre || sugerencia.ciudad}</strong>
                <span>{sugerencia.direccionFormateada}</span>
              </button>
            </li>
          ))}
          {!cargando && sugerencias.length === 0 && !errorBusqueda && (
            <li className="place-empty">No se encontraron ciudades.</li>
          )}
        </ul>
      )}

      {mensajeAyuda && <span className="error-text" id={`${inputId}-ayuda`}>{mensajeAyuda}</span>}
    </div>
  );
}
