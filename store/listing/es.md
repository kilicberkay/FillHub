# Chrome Web Store listing: FillHub (Español)

**Name:** FillHub

**Summary (132 characters max):**
Rellena formularios web con datos falsos realistas y coherentes en 15 idiomas. Modo seguro, deshacer y sin recopilar datos.

## Description

FillHub rellena formularios web con datos falsos realistas y coherentes, para que desarrolladores y testers puedan probar flujos de registro, compra y entrada de datos sin escribir valores de prueba a mano ni usar datos reales de personas.

Destacados

- 15 idiomas y 15 perfiles de país. Los nombres, direcciones, números de teléfono, nombres de empresa y números de identidad siguen el formato de cada país.
- Personas coherentes. Cada relleno crea una sola persona, así que el nombre, los apellidos, el correo, el campo «repite el correo», el nombre de usuario y el teléfono coinciden entre sí.
- Detección inteligente de campos. Se combinan etiquetas, nombres, pistas de autocompletado y tipos de entrada, de modo que un campo con la etiqueta «Cep telefonu» o «Soyadınız» recibe el valor correcto.
- Modo PII Safe (activado por defecto). Los identificadores personales usan valores de prueba evidentes: correos de example.com, teléfonos de marcador de posición y números de identidad de prueba que nunca están pensados para uso real.
- Perfiles de identidad. Use una persona aleatoria nueva en cada relleno o mantenga una persona fija. Un perfil puede fijar nombre, apellidos, correo, teléfono y contraseña, así que puede guardar una cuenta de prueba fija.
- Reglas personalizadas. Asigne un selector CSS a un tipo de dato cuando la detección integrada no reconoce un campo. Las reglas se editan en la página de ajustes.
- Las casillas de consentimiento (términos, privacidad, KVKK) se marcan; las casillas de marketing permanecen sin marcar.
- Los campos de texto reciben frases de ejemplo en el idioma del país, recortadas a la longitud máxima del campo.
- Los campos de archivo reciben un archivo pequeño generado que coincide con el tipo aceptado.
- El envío automático opcional (desactivado por defecto) pulsa el botón de envío real del formulario rellenado. Nunca se pulsan botones destructivos como Cancelar o Eliminar, y los sitios pueden excluirse.
- Los captchas nunca se pulsan ni se resuelven. Un captcha visible se marca, lo completa usted mismo y el formulario no se envía automáticamente.
- Modo caos para pruebas tipo fuzz con valores inusuales.
- Deshacer restaura el formulario al estado que tenía antes del último relleno.
- Copia de seguridad de los ajustes en un archivo JSON local e informe de diagnóstico que solo contiene recuentos.
- Funciona en iframes del mismo origen, lee las etiquetas en el idioma de la página y mantiene los valores sincronizados con frameworks de JavaScript. Los iframes de otro origen quedan fuera del permiso activeTab y no se tocan.

Cómo usarlo

1. Abra una página con un formulario.
2. Pulse Ctrl+Shift+F (Command+Shift+F en macOS) o haga clic en el icono de FillHub de la barra de herramientas. El formulario se rellena al momento.
3. Pulse Ctrl+Shift+U para deshacer.
4. Pulse Ctrl+Shift+Y para el modo caos (valores inusuales para pruebas tipo fuzz).

Los atajos se pueden cambiar en chrome://extensions/shortcuts. Haga clic derecho en un solo campo y elija «Rellenar este campo» para rellenar solo ese campo.

Privacidad

FillHub no recopila datos. Los ajustes permanecen en su navegador. La extensión no envía nada al autor ni a terceros. Consulte la política de privacidad: https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md

Código abierto

FillHub es gratuito y de código abierto bajo la licencia MIT. Código fuente, incidencias y contribuciones: https://github.com/kilicberkay/FillHub

Apoyo

FillHub es gratuito. Si le ayuda en su trabajo, puede apoyar el desarrollo a través de GitHub Sponsors: https://github.com/sponsors/kilicberkay

Uso responsable

FillHub es para pruebas y desarrollo. Los números de identidad generados pueden superar las reglas públicas de suma de control, así que no use los datos generados para aplicaciones reales, compras ni declaraciones de identidad.
