# CEMEX GDL · Rol de Turnos

Página que arma la propuesta semanal del rol, la deja aprobar y la sube a TimeBlock con el Bot TimeBlock.

## Cómo está organizado

| Archivo | Qué tiene | Cuándo lo editas |
|---|---|---|
| `index.html` | La estructura de la página: encabezado, pestañas, textos fijos | Para cambiar textos, títulos o el orden de las secciones |
| `css/estilos.css` | Colores, letras y medidas | Para cambiar cómo se ve |
| `js/app.js` | La lógica: rotación, propuesta, alertas, cobertura, aprobación, envío | Para cambiar reglas (mínimos por turno, rotación, quién cubre el domingo) |
| `js/bot.js` | El Bot TimeBlock que corre dentro de TimeBlock | Si TimeBlock cambia sus botones o pantallas |
| `js/datos.js` | Colaboradores y lo capturado por día | Para agregar o quitar personas, o cargar una semana nueva |
| `img/cemex-logo.png` | Logo | Si cambia el logo |
| `construir.py` | Junta todo en un solo HTML para publicar | No hace falta tocarlo |

## Editar y ver el cambio

1. Abre la carpeta `rol-de-turnos` en Visual Studio Code (Archivo › Abrir carpeta).
2. Abre `index.html` en Chrome (doble clic). Funciona así, sin instalar nada.
3. Cambia lo que necesites, guarda (Ctrl+S) y recarga la página en Chrome (F5). El cambio se ve al instante.

Si instalas la extensión **Live Server** en VS Code (clic derecho en `index.html` › Open with Live Server), la página se recarga sola cada vez que guardas.

## Generar el archivo para publicar

En la terminal de VS Code (Ver › Terminal), dentro de la carpeta `rol-de-turnos`:

```
python construir.py
```

Crea en `dist/`:
- `CEMEX_GDL_Rol_de_Turnos.html`: la página completa en un solo archivo, lista para subir o compartir.
- `Bot_TimeBlock_favorito.txt`: el código del bot para pegarlo como dirección de un favorito.

Para publicar como página web, sube la carpeta completa (`index.html`, `css`, `js`, `img`) o solo el archivo de `dist`. Las dos formas funcionan igual.

## Cosas a cuidar

- **Si cambias `js/bot.js`**, el favorito viejo no se actualiza solo: bórralo y vuelve a arrastrar **Bot TimeBlock** desde la pestaña "Enviar a TimeBlock". Sube el número de versión del título del bot (`versión 7`) para saber cuál tienes.
- **Nombres de turno en TimeBlock** (`T01 EO 07:00-15:00`, etc.) y los motivos de justificante (`[VAC] Vacaciones`, etc.) están en `js/app.js`, en `TBT` y `JUS`. Tienen que quedar escritos exactamente como en TimeBlock.
- **Mínimos por turno** están en `js/app.js`, en `MINS` (lunes a sábado) y `MSUN` (domingo).
- **Rotación por área** está en `js/app.js`, en `ROT3`, `ROT4` y `R4_AREAS` (Envase y Mantenimiento rotan en 4 semanas con agregado).
- La página necesita internet para las letras y para exportar a Excel.
- Los cambios y la aprobación que se hacen en la página duran mientras está abierta; todavía no se guardan.
