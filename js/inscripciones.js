/**
 * Maneja el flujo de inscripción a los cursos:
 * - Muestra/oculta el formulario de cada curso.
 * - Valida email y teléfono en el cliente antes de enviar.
 * - Envía la inscripción al backend vía fetch (sin recargar la página).
 * - Muestra mensajes de éxito / error dinámicamente.
 */
(function () {
    "use strict";

    // Regex de validación
    const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Acepta números con espacios, guiones, paréntesis y un + inicial opcional. Entre 7 y 15 dígitos.
    const REGEX_TELEFONO = /^\+?[\d\s\-()]{7,20}$/;

    function contarDigitos(valor) {
        return (valor.match(/\d/g) || []).length;
    }

    function mostrarError(form, campoId, texto) {
        const span = form.querySelector(`[data-error-para="${campoId}"]`);
        if (span) {
            span.textContent = texto;
        }
        const input = form.querySelector(`#${campoId}`);
        if (input) {
            input.classList.toggle("campo__field--invalido", Boolean(texto));
        }
    }

    function limpiarErrores(form) {
        form.querySelectorAll(".campo__error").forEach((span) => (span.textContent = ""));
        form.querySelectorAll(".campo__field").forEach((input) =>
            input.classList.remove("campo__field--invalido")
        );
    }

    function mostrarMensaje(form, texto, tipo) {
        const mensaje = form.querySelector(".mensaje");
        if (!mensaje) return;
        mensaje.textContent = texto;
        mensaje.classList.remove("oculto", "mensaje--exito", "mensaje--error");
        mensaje.classList.add(tipo === "exito" ? "mensaje--exito" : "mensaje--error");
    }

    function validarFormulario(form) {
        limpiarErrores(form);
        let esValido = true;

        const emailInput = form.querySelector('input[name="email"]');
        const telefonoInput = form.querySelector('input[name="telefono"]');

        const email = emailInput.value.trim();
        const telefono = telefonoInput.value.trim();

        if (!email) {
            mostrarError(form, emailInput.id, "El correo electrónico es obligatorio.");
            esValido = false;
        } else if (!REGEX_EMAIL.test(email)) {
            mostrarError(form, emailInput.id, "Ingresa un correo electrónico válido.");
            esValido = false;
        }

        if (!telefono) {
            mostrarError(form, telefonoInput.id, "El número de teléfono es obligatorio.");
            esValido = false;
        } else if (!REGEX_TELEFONO.test(telefono) || contarDigitos(telefono) < 7) {
            mostrarError(
                form,
                telefonoInput.id,
                "Ingresa un teléfono válido (mínimo 7 dígitos, solo números, espacios, guiones o +)."
            );
            esValido = false;
        }

        return esValido ? { email, telefono } : null;
    }

    async function enviarInscripcion(form, datos) {
        const boton = form.querySelector('input[type="submit"]');
        const textoOriginal = boton.value;
        boton.disabled = true;
        boton.value = "Enviando...";

        try {
            const respuesta = await fetch(CONFIG.API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    curso: form.dataset.curso,
                    email: datos.email,
                    telefono: datos.telefono
                })
            });

            const resultado = await respuesta.json().catch(() => ({}));

            if (!respuesta.ok) {
                throw new Error(resultado.error || "No se pudo completar la inscripción.");
            }

            mostrarMensaje(
                form,
                "¡Inscripción registrada con éxito! Te contactaremos pronto.",
                "exito"
            );
            form.reset();
        } catch (error) {
            const esErrorDeRed = error instanceof TypeError;
            mostrarMensaje(
                form,
                esErrorDeRed
                    ? "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución."
                    : error.message,
                "error"
            );
        } finally {
            boton.disabled = false;
            boton.value = textoOriginal;
        }
    }

    function inicializarBotonesToggle() {
        document.querySelectorAll(".curso__boton-inscripcion").forEach((boton) => {
            boton.addEventListener("click", () => {
                const formId = boton.getAttribute("aria-controls");
                const form = document.getElementById(formId);
                if (!form) return;

                const expandido = boton.getAttribute("aria-expanded") === "true";
                form.classList.toggle("oculto", expandido);
                boton.setAttribute("aria-expanded", String(!expandido));
                boton.textContent = expandido ? "Inscribirme a este curso" : "Ocultar formulario";
            });
        });
    }

    function inicializarFormularios() {
        document.querySelectorAll(".formulario-inscripcion").forEach((form) => {
            form.addEventListener("submit", (evento) => {
                evento.preventDefault();
                const datos = validarFormulario(form);
                if (datos) {
                    enviarInscripcion(form, datos);
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        inicializarBotonesToggle();
        inicializarFormularios();
    });
})();
