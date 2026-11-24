const modules = document.querySelector('#modules');
const narrow = matchMedia('(max-width: 920px)');
function sizeMenu() {
    if (modules) modules.open = !narrow.matches;
}
modules?.addEventListener('keydown', (event) => {
    if (narrow.matches && event.key === 'Escape' && modules.open) {
        modules.open = false;
        modules.querySelector('summary').focus();
    }
});
narrow.addEventListener('change', sizeMenu);
document.addEventListener('click', (event) => {
    if (narrow.matches && modules?.open && !modules.contains(event.target)) modules.open = false;
});
sizeMenu();

function editorLink(value) {
    return typeof value === 'string' && (value.startsWith('https://') ||
        /^(?:\/(?!\/)[^\s\\<>"]*|#[a-zA-Z0-9_-]+)$/.test(value));
}

for (const textarea of document.querySelectorAll('#body, textarea[data-rich]')) {
    const editor = document.createElement('div');
    editor.className = 'rich editable';
    editor.contentEditable = 'true';
    editor.setAttribute('role', 'textbox');
    editor.setAttribute('aria-multiline', 'true');
    if (textarea.hasAttribute('aria-labelledby')) {
        editor.setAttribute('aria-labelledby', textarea.getAttribute('aria-labelledby'));
    } else {
        editor.setAttribute('aria-label', 'Contenido enriquecido');
    }
    if (textarea.hasAttribute('aria-invalid')) {
        editor.setAttribute('aria-invalid', 'true');
        editor.setAttribute('aria-describedby', 'field-error');
    }
    // Assign parsed HTML only after pruning elements and every attribute except safe links.
    const template = document.createElement('template');
    template.innerHTML = textarea.value;
    const fragment = template.content;
    const elements = 'P DIV B STRONG I EM U S STRIKE H2 H3 UL OL LI BLOCKQUOTE CODE PRE SUB SUP BR HR A'.split(' ');
    for (const node of [...fragment.querySelectorAll('*')]) {
        if (!elements.includes(node.tagName)) {
            node.remove();
            continue;
        }
        const href = node.getAttribute('href');
        for (const attribute of [...node.attributes]) node.removeAttribute(attribute.name);
        if (node.tagName === 'A' && editorLink(href)) node.setAttribute('href', href);
    }
    for (const obsolete of fragment.querySelectorAll('strike')) {
        const mark = document.createElement('s');
        mark.append(...obsolete.childNodes);
        obsolete.replaceWith(mark);
    }
    editor.append(fragment);
    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';
    toolbar.setAttribute('aria-label', 'Formato de texto');
    const commands = [
        ['bold', 'Negrita', 'format_bold'], ['italic', 'Cursiva', 'format_italic'],
        ['underline', 'Subrayado', 'format_underlined'], ['strikeThrough', 'Tachado', 'strikethrough_s'],
        ['insertUnorderedList', 'Viñetas', 'format_list_bulleted'], ['insertOrderedList', 'Numeración', 'format_list_numbered'],
        ['formatBlock', 'Encabezado de sección', 'format_h2', 'h2'], ['formatBlock', 'Subtítulo', 'format_h3', 'h3'],
        ['insertHorizontalRule', 'Separador', 'horizontal_rule'], ['formatBlock', 'Cita', 'format_quote', 'blockquote'],
        ['formatBlock', 'Párrafo', 'format_paragraph', 'p'], ['createLink', 'Enlace', 'link'],
        ['removeFormat', 'Quitar formato', 'format_clear'], ['undo', 'Deshacer', 'undo'], ['redo', 'Rehacer', 'redo'],
    ];
    let selection;
    editor.addEventListener('focusout', () => {
        const active = getSelection();
        if (active.rangeCount && editor.contains(active.anchorNode)) selection = active.getRangeAt(0).cloneRange();
    });
    for (const [command, label, symbol, value] of commands) {
        const button = document.createElement('button');
        button.type = 'button';
        button.title = label;
        button.setAttribute('aria-label', label);
        const glyph = document.createElement('span');
        glyph.className = 'icon';
        glyph.setAttribute('aria-hidden', 'true');
        glyph.textContent = symbol;
        button.append(glyph);
        button.addEventListener('click', () => {
            const argument = command === 'createLink' ? prompt('Ruta del portal o dirección HTTPS') : value;
            if (command === 'createLink' && !editorLink(argument)) return;
            editor.focus();
            if (selection && editor.contains(selection.startContainer)) {
                getSelection().removeAllRanges();
                getSelection().addRange(selection);
            }
            document.execCommand(command, false, argument);
            editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
        });
        toolbar.append(button);
    }
    editor.addEventListener('paste', (event) => {
        event.preventDefault();
        document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
    });
    const form = textarea.form;
    textarea.hidden = true;
    const errorLink = document.querySelector('[data-form-error] a[href="#' + textarea.id + '"]');
    errorLink?.addEventListener('click', (event) => {
        event.preventDefault();
        editor.focus();
    });
    textarea.after(toolbar, editor);
    editor.addEventListener('input', () => { textarea.value = editor.innerHTML; });
    form.addEventListener('submit', () => { textarea.value = editor.innerHTML; });

    if (form.hasAttribute('data-autosave')) {
        const status = document.querySelector('#save-status');
        let timer;
        let busy = false;
        let pending = form.hasAttribute('data-unsaved');
        let stopped = false;
        let navigating = false;
        const resume = form.querySelector('[data-resume]');
        const actions = [...document.querySelectorAll('.actions button')];
        const revision = document.querySelector('[data-pending-revision]');
        function lock(value) {
            for (const button of actions) button.disabled = value;
        }
        lock(pending);
        async function autosave() {
            if (!form.checkValidity() || busy || stopped) return;
            if (form.elements.media.files.length || form.elements.remove_media?.checked) {
                status.textContent = 'Guarda manualmente para aplicar el cambio de archivo.';
                return;
            }
            pending = false;
            busy = true;
            status.textContent = 'Guardando…';
            const data = new FormData(form);
            data.delete('media');
            try {
                const response = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
                const result = await response.json();
                if (!response.ok) {
                    resume.hidden = ![401, 403].includes(response.status);
                    throw new Error(result.error?.message);
                }
                form.elements.version.value = result.data.version;
                for (const version of document.querySelectorAll('.actions [name=version]')) version.value = result.data.version;
                if (revision) revision.hidden = false;
                status.textContent = 'Borrador guardado.';
                if (!pending) lock(false);
            } catch (error) {
                stopped = true;
                pending = true;
                status.textContent = error.message || 'No se pudo guardar. Conserva esta pestaña abierta.';
            } finally {
                busy = false;
                if (pending && !stopped) timer = setTimeout(autosave, 1000);
            }
        }
        form.addEventListener('input', () => {
            pending = true;
            lock(true);
            status.textContent = 'Cambios pendientes.';
            clearTimeout(timer);
            if (!busy && !stopped) timer = setTimeout(autosave, 1500);
        });
        form.addEventListener('submit', (event) => {
            if (busy) {
                event.preventDefault();
                status.textContent = 'Espera a que termine el autoguardado.';
                return;
            }
            clearTimeout(timer);
            navigating = true;
        });
        resume.querySelector('[data-resume-action]').addEventListener('click', async () => {
            try {
                const response = await fetch(location.pathname, { redirect: 'error', credentials: 'same-origin' });
                const snapshot = new DOMParser().parseFromString(await response.text(), 'text/html');
                const editForm = snapshot.querySelector('form[data-autosave]');
                if (!response.ok || !editForm) throw new Error('Vuelve a ingresar y verifica tu permiso de edición.');
                if (editForm.elements.version.value !== form.elements.version.value) {
                    throw new Error('Existe otra versión. Abre la edición vigente en otra pestaña y compara los cambios.');
                }
                form.elements._csrf.value = editForm.elements._csrf.value;
                const token = document.querySelector('header [name=_csrf]');
                if (token) token.value = editForm.elements._csrf.value;
                for (const csrf of document.querySelectorAll('.actions [name=_csrf]')) csrf.value = editForm.elements._csrf.value;
                stopped = false;
                resume.hidden = true;
                await autosave();
            } catch (error) {
                status.textContent = error.message;
            }
        });
        addEventListener('beforeunload', (event) => {
            if (!navigating && (pending || busy)) {
                event.preventDefault();
                event.returnValue = '';
            }
        });
        addEventListener('pageshow', () => { navigating = false; });
    }
}

document.querySelector('[data-form-error]')?.focus();

const manualEditor = document.querySelector('[data-manual-editor]');
if (manualEditor) {
    let dirty = false;
    let submitting = false;
    const markDirty = () => {
        if (dirty) return;
        dirty = true;
        document.querySelector('#save-status').textContent = 'Cambios pendientes de guardar.';
        for (const button of document.querySelectorAll('.publication-panel button')) button.disabled = true;
    };
    if (manualEditor.hasAttribute('data-unsaved')) markDirty();
    manualEditor.addEventListener('input', markDirty);
    manualEditor.addEventListener('change', markDirty);
    manualEditor.addEventListener('submit', () => { submitting = true; });
    addEventListener('pageshow', () => { submitting = false; });
    addEventListener('beforeunload', (event) => {
        if (dirty && !submitting) {
            event.preventDefault();
            event.returnValue = '';
        }
    });
}

if (document.querySelector('.institution-topic-option')) {
    const selectTopic = () => {
        const topic = document.getElementById(location.hash.slice(1));
        if (!topic?.matches('.institution-topic-option')) return;
        topic.checked = true;
        topic.closest('.institution-feature').scrollIntoView({ block: 'start' });
    };
    selectTopic();
    addEventListener('hashchange', selectTopic);
    document.querySelector('.institution-information').addEventListener('change', (event) => {
        if (event.target.matches('.institution-topic-option')) {
            history.replaceState(history.state, '', '#' + event.target.id);
        }
    });
}

for (const editor of document.querySelectorAll('[data-link-editor]')) {
    const rows = editor.querySelector('[data-link-rows]');
    const template = editor.querySelector('[data-link-template]');
    const add = editor.querySelector('[data-link-add]');
    let index = rows.children.length;
    const sync = () => {
        add.hidden = rows.children.length >= 40;
        for (const [position, row] of Array.from(rows.children).entries()) {
            const buttons = row.querySelectorAll('[data-link-move]');
            buttons[0].hidden = buttons[1].hidden = false;
            buttons[0].disabled = position === 0;
            buttons[1].disabled = position === rows.children.length - 1;
        }
    };
    sync();
    add.addEventListener('click', () => {
        if (rows.children.length >= 40) return;
        const row = template.content.firstElementChild.cloneNode(true);
        for (const input of row.querySelectorAll('[name]')) {
            input.name = input.name.replace('__INDEX__', String(index));
        }
        index += 1;
        rows.append(row);
        sync();
        row.querySelector('input').focus();
    });
    rows.addEventListener('click', (event) => {
        const button = event.target.closest('[data-link-move]');
        if (!button) return;
        const row = button.closest('[data-link-row]');
        const up = button.dataset.linkMove === '-1';
        const neighbor = up ? row.previousElementSibling : row.nextElementSibling;
        if (!neighbor) return;
        if (up) neighbor.before(row);
        else neighbor.after(row);
        sync();
        rows.dispatchEvent(new Event('input', { bubbles: true }));
        (button.disabled ? row.querySelector('[data-link-move]:not([disabled])') : button)?.focus();
    });
}

for (const form of document.querySelectorAll('[data-order-form]')) {
    const list = form.querySelector('ol');
    const buttons = list.querySelectorAll('[data-move]');
    for (const button of buttons) {
        button.hidden = false;
        button.addEventListener('click', () => {
            const item = button.closest('li');
            const previous = button.dataset.move === '-1';
            const neighbor = previous ? item.previousElementSibling : item.nextElementSibling;
            if (!neighbor) return;
            if (previous) list.insertBefore(item, neighbor);
            else list.insertBefore(neighbor, item);
            for (const [index, row] of [...list.children].entries()) row.querySelector('input').value = index + 1;
            button.focus();
            form.querySelector('[data-order-status]').textContent = 'Posición ' + item.querySelector('input').value;
        });
    }
}

for (const hero of document.querySelectorAll('.hero')) {
    const image = hero.querySelector('.hero-image');
    const slides = hero.querySelectorAll('[data-hero-slide]');
    if (!image) continue;
    for (const button of slides) {
        button.hidden = false;
        button.addEventListener('click', () => {
            const source = button.dataset.heroSlide;
            const width = Number(button.dataset.slideWidth);
            const height = Number(button.dataset.slideHeight);
            image.alt = button.dataset.slideAlt;
            if (width && height) {
                image.width = width;
                image.height = height;
            }
            if (width > 640 && button.dataset.slideSmall === '1') {
                image.srcset = source + '?tam=mini 640w, ' + source + ' ' + width + 'w';
                image.sizes = '100vw';
            } else {
                image.removeAttribute('srcset');
                image.removeAttribute('sizes');
            }
            image.src = source;
            for (const slide of slides) slide.setAttribute('aria-pressed', String(slide === button));
        });
    }
}

for (const control of document.querySelectorAll('[data-video-id]')) {
    control.hidden = false;
    control.addEventListener('click', () => {
        const player = document.createElement('iframe');
        player.className = 'video';
        player.src = 'https://www.youtube-nocookie.com/embed/' + control.dataset.videoId;
        player.title = control.dataset.videoTitle;
        player.referrerPolicy = 'strict-origin-when-cross-origin';
        player.allowFullscreen = true;
        control.replaceWith(player);
        player.focus();
    });
}
