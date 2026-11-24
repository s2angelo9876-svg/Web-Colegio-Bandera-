"""Optional browser checks against an isolated database started by bin/dev test."""
import os
import shutil
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

origin, state = sys.argv[1:]
credentials = dict(line.split("=", 1) for line in (Path(state) / "credentials").read_text().splitlines())

with sync_playwright() as playwright:
    binary = os.getenv("COLEGIO_CHROMIUM") or shutil.which("chromium")
    browser = playwright.chromium.launch(executable_path=binary, args=["--no-sandbox"])
    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.goto(origin)
    expect(page.get_by_role("main")).to_have_count(1)
    expect(page.get_by_role("button", name="Menú")).to_have_attribute("aria-expanded", "false")
    expect(page.get_by_role("link", name="Buscar", exact=True)).to_be_visible()
    page.get_by_role("button", name="Menú").press("Enter")
    page.get_by_role("navigation", name="Principal").get_by_text("Noticias").focus()
    page.keyboard.press("Escape")
    expect(page.get_by_role("button", name="Menú")).to_be_focused()

    for width in (390, 1201, 1440):
        page.set_viewport_size({"width": width, "height": 900})
        page.goto(origin)
        hero = page.locator("main .hero")
        assert hero.evaluate("element => element.offsetWidth === window.innerWidth")
        photo = hero.locator(".hero-visual").bounding_box()
        copy = hero.locator(".hero-copy").bounding_box()
        assert photo and copy
        assert abs(photo["y"] - copy["y"]) < 1
        primary = page.get_by_role("navigation", name="Principal")
        if width == 390:
            page.get_by_role("button", name="Menú").press("Enter")
        institution = primary.locator("summary").filter(has_text="Institución")
        institution.press("Enter")
        for name in ("Equipo directivo", "Docentes", "Administrativos"):
            expect(primary.get_by_role("link", name=name, exact=True)).to_be_visible()
        primary.get_by_role("link", name="Equipo directivo").focus()
        page.keyboard.press("Escape")
        expect(institution).to_be_focused()
        expect(primary.get_by_role("link", name="Equipo directivo")).to_be_hidden()
        primary.locator("summary").filter(has_text="Recursos").press("Enter")
        expect(primary.get_by_role("link", name="Galería", exact=True)).to_be_visible()
        expect(primary.get_by_role("link", name="Documentos institucionales", exact=True)).to_be_visible()
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
        primary.get_by_role("link", name="Mesa de Partes", exact=True).click()
        expect(page.get_by_role("heading", name="Mesa de Partes", exact=True)).to_be_visible()
        download_fut = page.get_by_role("link", name="Descargar FUT", exact=True)
        expect(download_fut).to_be_visible()
        if width == 390:
            with page.expect_download() as download:
                download_fut.click()
            assert download.value.suggested_filename == "fut-solicitud-referencial.pdf"

    page.set_viewport_size({"width": 320, "height": 568})
    page.goto(origin + "/mesa-partes")
    button = page.get_by_role("link", name="Descargar FUT", exact=True).bounding_box()
    assert button and button["y"] + button["height"] <= 568
    page.get_by_role("link", name="Buscar", exact=True).click()
    page.get_by_role("searchbox").fill("Formulario Único de Trámite")
    page.get_by_role("button", name="Buscar").click()
    expect(page.get_by_role("link", name="Descargar FUT")).to_be_visible()

    page.set_viewport_size({"width": 390, "height": 844})
    early = browser.new_page(viewport={"width": 390, "height": 844}, color_scheme="light")
    early.route("**/site.js", lambda route: route.abort())
    early.goto(origin)
    early.evaluate("localStorage.setItem('colegio-theme', 'dark')")
    early.reload()
    expect(early.locator("html")).to_have_attribute("data-theme", "dark")
    expect(early.locator('meta[name="color-scheme"]')).to_have_attribute("content", "dark")
    primary = early.get_by_role("navigation", name="Principal")
    menu = early.get_by_role("button", name="Menú")
    expect(primary).to_be_hidden()
    for destination in ("Eventos", "Noticias"):
        menu.press("Enter")
        primary.get_by_role("link", name=destination, exact=True).click()
        expect(early.get_by_role("heading", name=destination, exact=True)).to_be_visible()
        expect(early.locator("html")).to_have_attribute("data-theme", "dark")
        expect(primary).to_be_hidden()
    early.close()

    navigation = browser.new_page(reduced_motion="no-preference")
    navigation.add_init_script("""addEventListener('pagereveal', ({viewTransition}) => {
        const root = document.documentElement;
        if (viewTransition) {
            viewTransition.ready.then(
                () => { root.dataset.reveal = 'animated'; },
                () => { root.dataset.reveal = 'skipped'; }
            );
        } else {
            root.dataset.reveal = 'instant';
        }
    })""")
    navigation.goto(origin)
    if navigation.evaluate("'onpagereveal' in window"):
        links = navigation.get_by_role("navigation", name="Principal")
        links.get_by_role("link", name="Eventos", exact=True).click()
        expect(navigation.locator("html")).to_have_attribute("data-reveal", "animated")
        navigation.emulate_media(reduced_motion="reduce")
        links.get_by_role("link", name="Noticias", exact=True).click()
        expect(navigation.locator("html")).to_have_attribute("data-reveal", "instant")
        expect(navigation.get_by_role("heading", name="Noticias", exact=True)).to_be_visible()
    navigation.close()

    page.goto(origin + "/admin")
    page.get_by_label("Usuario").fill("admin")
    page.get_by_label("Contraseña").fill(credentials["LOCAL_ADMIN_PASSWORD"])
    page.get_by_role("button", name="Ingresar").click()
    expect(page.get_by_role("heading", name="Panel de contenidos")).to_be_visible()
    assert not page.locator("#modules").evaluate("(node) => node.open")
    page.locator("#modules summary").click()
    page.get_by_role("navigation", name="Módulos").get_by_role("link", name="Noticias").click()
    page.get_by_role("link", name="Nuevo").click()
    page.get_by_label("Título", exact=True).fill("Noticia de navegador")
    page.get_by_label("Identificador de URL").fill("navegador")
    page.get_by_role("textbox", name="Contenido enriquecido").fill("Texto inicial para dar formato")
    page.keyboard.press("Control+a")
    page.get_by_role("button", name="Negrita", exact=True).click()
    page.keyboard.press("Control+a")
    page.get_by_role("button", name="Tachado", exact=True).click()
    page.get_by_role("button", name="Guardar borrador").click()
    expect(page.get_by_role("heading", name="Noticia de navegador")).to_be_visible()
    assert page.locator("main").evaluate("(node) => node.scrollWidth <= node.clientWidth")
    assert page.locator(".editor").evaluate("(node) => node.scrollWidth <= node.clientWidth")
    page.get_by_role("button", name="Publicar borrador guardado").click()
    page.get_by_label("Título", exact=True).fill("Revisión autoguardada")
    expect(page.locator("#save-status")).to_have_text("Borrador guardado.", timeout=10000)

    reader = browser.new_page(java_script_enabled=False, viewport={"width": 390, "height": 844})
    reader.goto(origin + "/noticias/navegador")
    expect(reader.get_by_role("heading", name="Noticia de navegador")).to_be_visible()
    expect(reader.get_by_role("navigation", name="Principal").get_by_role("link", name="Noticias")).to_be_visible()
    reader.locator("#navigation summary").filter(has_text="Institución").press("Enter")
    reader.get_by_role("navigation", name="Principal").get_by_role("link", name="Equipo directivo").click()
    expect(reader.get_by_role("heading", name="Equipo directivo")).to_be_visible()
    reader.goto(origin + "/institucion")
    identity = reader.get_by_role("group", name="Identidad institucional", exact=True)
    choices = identity.get_by_role("radio")
    expect(choices).to_have_count(2)
    expect(choices.first).to_be_checked()
    initial_topic = reader.locator("#" + choices.first.get_attribute("aria-controls"))
    other_topic = reader.locator("#" + choices.last.get_attribute("aria-controls"))
    expect(initial_topic).to_contain_text("Texto enriquecido")
    expect(other_topic).to_be_hidden()
    choices.first.press("ArrowRight")
    expect(choices.last).to_be_checked()
    expect(initial_topic).to_be_hidden()
    expect(other_topic).to_be_visible()
    expect(reader.get_by_role("heading", name="Guía de trámites de prueba")).to_be_visible()
    expect(reader).to_have_url(origin + "/institucion")
    reader.goto(origin + "/docentes")
    teachers = reader.locator(".staff-card")
    teacher = teachers.filter(has_text="Docente primera")
    expect(teacher.get_by_role("heading", name="Docente primera")).to_be_visible()
    expect(teacher.locator(".staff-role")).to_have_text("Comunicación")
    assert teacher.get_by_alt_text("Foto de prueba").evaluate("image => image.decode().then(() => image.naturalWidth)") > 0
    expect(teachers.filter(has_text="Docente segunda").locator(".staff-portrait > .icon")).to_be_visible()
    for width in (320, 390, 768, 1440):
        reader.set_viewport_size({"width": width, "height": 900})
        sizes = teachers.evaluate_all("cards => cards.map(card => [card.offsetWidth, card.offsetHeight])")
        assert len(sizes) == 2 and sizes[0] == sizes[1], (width, sizes)
        assert reader.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
    reader.set_viewport_size({"width": 390, "height": 844})
    reader.goto(origin + "/noticias/navegador")
    assert reader.locator("main").evaluate("(node) => node.scrollWidth <= node.clientWidth")
    expect(reader.locator(".rich b, .rich strong")).to_have_text("Texto inicial para dar formato")
    expect(reader.locator(".rich s")).to_have_text("Texto inicial para dar formato")
    reader.goto(origin + "/buscar")
    reader.get_by_label("Término").fill("navegador")
    reader.get_by_role("button", name="Buscar").click()
    expect(reader.get_by_role("link", name="Noticia de navegador")).to_be_visible()

    reader.goto(origin + "/admin/ingresar")
    reader.get_by_label("Usuario").fill("admin")
    reader.get_by_label("Contraseña").fill(credentials["LOCAL_ADMIN_PASSWORD"])
    reader.get_by_role("button", name="Ingresar").click()
    reader.goto(origin + "/admin/noticias/nuevo")
    reader.get_by_label("Título", exact=True).fill("Borrador sin JavaScript")
    reader.get_by_label("Identificador de URL").fill("borrador-sin-js")
    reader.get_by_label("Contenido", exact=True).fill("<p>Texto de prueba</p>")
    reader.get_by_role("button", name="Guardar borrador").click()
    expect(reader.get_by_role("heading", name="Borrador sin JavaScript")).to_be_visible()
    reader.get_by_role("link", name="Vista previa").click()
    expect(reader.locator(".rich p")).to_have_text("Texto de prueba")

    for width in (320, 390, 768, 1440):
        page.set_viewport_size({"width": width, "height": 900})
        page.goto(origin + "/admin/docentes")
        assert page.locator("main").evaluate("(node) => node.scrollWidth <= node.clientWidth")
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
    def validate_palette():
        contrasts = page.evaluate("""() => {
            const luminance = (color) => {
                const hex = color.trim().slice(1);
                const raw = hex.length === 3 ? Array.from(hex, (part) => part + part).join('') : hex;
                const linear = [0, 2, 4].map((offset) => {
                    const value = parseInt(raw.slice(offset, offset + 2), 16) / 255;
                    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
                });
                return linear[0]*0.2126 + linear[1]*0.7152 + linear[2]*0.0722;
            };
            const style = getComputedStyle(document.documentElement);
            const compare = (first, second) => {
                const values = [luminance(first), luminance(second)].sort((a, b) => b-a);
                return (values[0]+0.05) / (values[1]+0.05);
            };
            const tone = (name) => style.getPropertyValue(name);
            return [
                compare(tone('--ink'),tone('--page')),
                compare(tone('--link'),tone('--surface')),
                compare('#fff',tone('--accent')),
                compare(getComputedStyle(document.querySelector('header')).getPropertyValue('--focus'),tone('--brand')),
                compare(tone('--control-border'),tone('--surface')),
            ];
        }""")
        assert min(contrasts[:3]) >= 4.5 and min(contrasts[3:]) >= 3, contrasts

    page.emulate_media(color_scheme="light")
    validate_palette()
    page.get_by_role("button", name="Alternar modo claro y oscuro").press("Enter")
    expect(page.locator("html")).to_have_attribute("data-theme", "dark")
    page.reload()
    expect(page.locator("html")).to_have_attribute("data-theme", "dark")
    validate_palette()
    page.get_by_role("button", name="Alternar modo claro y oscuro").press("Enter")
    expect(page.locator('meta[name="color-scheme"]')).to_have_attribute("content", "light dark")
    assert page.evaluate("localStorage.getItem('colegio-theme')") is None

    page.goto(origin + "/admin/docentes/reordenar")
    move = page.get_by_role("button", name="Bajar Docente primera")
    move.press("Enter")
    expect(move).to_be_focused()
    expect(page.locator("[data-order-status]")).to_have_text("Posición 2")
    page.get_by_role("button", name="Guardar orden").click()
    expect(page.get_by_role("status").first).to_have_text("Orden guardado.")

    for letter in ("A", "B"):
        page.goto(origin + "/admin/carrusel/nuevo")
        page.get_by_label("Título", exact=True).fill(f"Diapositiva {letter}")
        page.get_by_label("Descripción de la imagen").fill(f"Foto sintética {letter}")
        page.locator('input[name="media"]').set_input_files("public/images/escudo.jpeg")
        page.get_by_role("button", name="Guardar borrador").click()
        page.get_by_role("button", name="Publicar borrador guardado").click()

    page.goto(origin + "/admin/inicio")
    page.get_by_role("link", name="Edición inicio", exact=True).click()
    page.get_by_label("Imagen de portada").select_option("carrusel")
    page.get_by_role("button", name="Guardar borrador").click()
    page.get_by_role("link", name="Vista previa").click()
    expect(page.locator("main .hero").get_by_role("heading", name="Edición inicio")).to_be_visible()
    page.get_by_role("button", name="Diapositiva A").press("Enter")
    expect(page.get_by_role("button", name="Diapositiva A")).to_have_attribute("aria-pressed", "true")
    expect(page.locator("main .hero .hero-image")).to_have_attribute("alt", "Foto sintética A")

    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(origin + "/admin/portal")
    expect(page.get_by_role("heading", name="Diseño y contenido del portal")).to_be_visible()
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
    page.get_by_role("link", name="Menú principal", exact=True).click()
    page.get_by_label("Nombre accesible de la navegación").fill("Prueba sin guardar")
    rejected = []
    def stay_in_editor(dialog):
        rejected.append(dialog.type)
        dialog.dismiss()
    page.once("dialog", stay_in_editor)
    page.get_by_role("link", name="Diseño y contenido del portal", exact=True).click()
    assert rejected == ["beforeunload"]
    expect(page.get_by_label("Nombre accesible de la navegación")).to_have_value("Prueba sin guardar")
    page.get_by_label("Nombre accesible de la navegación").fill("Principal")
    page.get_by_role("button", name="Añadir enlace").click()
    assert page.get_by_role("button", name="Guardar borrador").bounding_box()["y"] < 844
    new_link = page.locator("[data-link-row]").last
    expect(new_link.get_by_label("Texto", exact=True)).to_be_focused()
    new_link.get_by_label("Texto", exact=True).fill("Formulario para familias")
    new_link.get_by_label("Destino").fill("/mesa-partes/fut")
    new_link.get_by_role("button", name="Subir", exact=True).press("Enter")
    active_row = page.locator("[data-link-row]").nth(-2)
    expect(active_row.get_by_label("Texto", exact=True)).to_have_value("Formulario para familias")
    active_row.get_by_role("button", name="Subir", exact=True).press("Enter")
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
    page.get_by_role("button", name="Guardar borrador").click()
    page.get_by_role("link", name="Vista previa").click()
    expect(page.get_by_text("Vista previa del portal", exact=True)).to_be_visible()
    page.get_by_role("button", name="Menú").press("Enter")
    menu_links = page.locator("#navigation .nav-links > a")
    labels = menu_links.all_text_contents()
    assert labels.index("Formulario para familias") < labels.index("Mesa de Partes")
    principal = page.get_by_role("navigation", name="Principal")
    expect(principal.get_by_role("link", name="Formulario para familias")).to_have_attribute("href", "/mesa-partes/fut")
    reader.goto(origin)
    expect(reader.get_by_role("link", name="Formulario para familias", exact=True)).to_have_count(0)
    page.get_by_role("button", name="Menú").click()
    page.get_by_role("link", name="Volver al editor").click()
    page.get_by_role("button", name="Publicar borrador guardado").click()
    reader.reload()
    expect(reader.get_by_role("link", name="Formulario para familias", exact=True)).to_be_visible()

    print("Chromium: diseño adaptable, navegación, edición, publicación y vista previa verificadas.")
