"""Arma la versión de un solo archivo para publicar.

Uso:  python construir.py
Resultado:
  dist/CEMEX_GDL_Rol_de_Turnos.html   (todo en un archivo: estilos, logo, datos y código)
  dist/Bot_TimeBlock_favorito.txt     (código para pegar como dirección de un favorito)
Solo usa Python 3, sin instalar nada.
"""
import base64, os, re, urllib.parse

AQUI = os.path.dirname(os.path.abspath(__file__))
def leer(r): return open(os.path.join(AQUI, r), encoding="utf-8").read()
def seguro(js): return js.replace("</script", "<\\/script")

html = leer("index.html")
html = html.replace('<link rel="stylesheet" href="css/estilos.css">', "<style>\n" + leer("css/estilos.css") + "</style>")
logo = base64.b64encode(open(os.path.join(AQUI, "img/cemex-logo.png"), "rb").read()).decode()
html = html.replace('src="img/cemex-logo.png"', 'src="data:image/png;base64,' + logo + '"')
for js in ("js/datos.js", "js/bot.js", "js/app.js"):
    etiqueta = '<script src="%s"></script>' % js
    if etiqueta not in html:
        raise SystemExit("No encontré %s en index.html" % etiqueta)
    html = html.replace(etiqueta, "<script>\n" + seguro(leer(js)) + "\n</script>")

os.makedirs(os.path.join(AQUI, "dist"), exist_ok=True)
open(os.path.join(AQUI, "dist/CEMEX_GDL_Rol_de_Turnos.html"), "w", encoding="utf-8").write(html)

bot = leer("js/bot.js")
ini = bot.index("window.BOT_TIMEBLOCK=function(){") + len("window.BOT_TIMEBLOCK=function(){")
fin = bot.rindex("};")
favorito = "javascript:" + urllib.parse.quote("(function(){" + bot[ini:fin] + "})()", safe="")
open(os.path.join(AQUI, "dist/Bot_TimeBlock_favorito.txt"), "w", encoding="utf-8").write(favorito)
print("Listo: dist/CEMEX_GDL_Rol_de_Turnos.html y dist/Bot_TimeBlock_favorito.txt")
