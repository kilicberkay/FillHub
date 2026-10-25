# Chrome Web Store listing: FillHub (Español)

**Name:** FillHub

**Summary (132 characters max):**
Rellena formularios web con datos falsos realistas y coherentes en 15 idiomas. Modo seguro, deshacer y sin recopilar datos.

## Description

FillHub rellena formularios web con datos falsos realistas y coherentes. Los desarrolladores y testers pueden probar flujos de registro, compra y entrada de datos sin escribir valores de prueba a mano y sin usar datos de personas reales.

Destacados

- 15 idiomas y 15 perfiles de país. Los nombres, direcciones, números de teléfono, nombres de empresa y números de identidad siguen el formato de cada país.
- Datos de persona coherentes. Cada relleno crea una sola persona. Por eso, el nombre, los apellidos, el correo electrónico, el campo «Repetir correo electrónico», el nombre de usuario y el teléfono coinciden entre sí.
- Detección inteligente de campos. FillHub combina la etiqueta, el nombre del campo, las pistas de autocompletado y el tipo de entrada para identificar cada campo. También reconoce etiquetas en otros idiomas. Por ejemplo, un campo en turco con la etiqueta «Cep telefonu» (teléfono móvil) recibe un número de teléfono, y un campo con la etiqueta «Soyadınız» (su apellido) recibe un apellido.
- Modo PII Safe (activado por defecto). Los identificadores personales usan valores de prueba evidentes: direcciones de correo de example.com, números de teléfono de ejemplo y números de identidad de prueba que no están pensados para un uso real.
- Perfiles de identidad. Use una persona aleatoria nueva en cada relleno o mantenga una persona fija. Un perfil puede fijar el nombre, los apellidos, el correo electrónico, el teléfono y la contraseña, de modo que se puede usar la misma cuenta de prueba en cada relleno.
- Reglas personalizadas. Asigne un selector CSS a un tipo de dato cuando la detección integrada no reconozca un campo. Las reglas se editan en la página de ajustes.
- Las casillas de consentimiento (condiciones de uso, política de privacidad y consentimiento KVKK según la ley turca de protección de datos) se marcan. Las casillas de marketing permanecen sin marcar.
- Los campos de texto reciben frases de ejemplo en el idioma del país, recortadas a la longitud máxima del campo.
- Los campos de archivo reciben un pequeño archivo generado que coincide con el tipo de archivo aceptado.
- El envío automático (opcional, desactivado por defecto) pulsa el botón de envío real del formulario rellenado. Los botones destructivos, como Cancelar o Eliminar, nunca se pulsan. Se pueden excluir sitios concretos del envío automático.
- Los captchas nunca se pulsan ni se resuelven. Un captcha visible se resalta con un marco para que usted lo complete. En ese caso, el formulario no se envía automáticamente.
- El modo caos rellena los campos con valores inusuales para pruebas de tipo fuzz.
- La función Deshacer restaura el formulario al estado que tenía antes del último relleno.
- Los ajustes se pueden guardar en un archivo JSON local. El informe de diagnóstico para notificar errores contiene recuentos y ajustes básicos, pero no nombres, valores de campos ni direcciones de sitios.
- Funciona en iframes del mismo origen y mantiene los valores sincronizados con frameworks de JavaScript. Los iframes de otro origen quedan fuera del permiso activeTab y no se rellenan.

Cómo usarlo

1. Abra una página con un formulario.
2. Pulse Ctrl+Shift+F (Command+Shift+F en macOS) o haga clic en el icono de FillHub en la barra de herramientas. El formulario se rellena de inmediato.
3. Pulse Ctrl+Shift+U (Command+Shift+U en macOS) para deshacer el relleno.
4. Pulse Ctrl+Shift+Y (Command+Shift+Y en macOS) para rellenar el formulario en modo caos, con valores inusuales para pruebas de tipo fuzz.

Los atajos se pueden cambiar en chrome://extensions/shortcuts. Para rellenar un solo campo, haga clic derecho en el campo y elija «Rellenar este campo».

Privacidad

FillHub no recopila datos ni realiza solicitudes de red. Los ajustes se guardan solo en su navegador. La extensión no envía nada al autor ni a terceros. Política de privacidad: https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md

Código abierto

FillHub es gratuito y de código abierto bajo la licencia MIT. Código fuente, incidencias y contribuciones: https://github.com/kilicberkay/FillHub

Apoyo

FillHub es gratuito. Si FillHub le resulta útil en su trabajo, puede apoyar su desarrollo a través de GitHub Sponsors: https://github.com/sponsors/kilicberkay

Uso responsable

FillHub está destinado a pruebas y desarrollo. Los números de identidad generados pueden superar las validaciones públicas de dígito de control. No use los datos generados para solicitudes reales, compras ni verificaciones de identidad.
