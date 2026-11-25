(() => {
    const root = document.documentElement;
    const colorScheme = document.querySelector('meta[name="color-scheme"]');
    const systemScheme = matchMedia('(prefers-color-scheme: dark)');
    const compact = matchMedia('(max-width: 1200px)');
    const themeKey = 'colegio-theme';
    const menuButton = () => document.getElementById('menu');
    const navigation = () => document.getElementById('navigation');
    const openGroup = () => navigation()?.querySelector('.nav-group[open]');
    const systemTheme = () => systemScheme.matches ? 'dark' : 'light';

    function updateThemeButton() {
        const button = document.querySelector('[data-theme-toggle]');
        if (!button) return;
        const dark = (root.dataset.theme ?? systemTheme()) === 'dark';
        button.setAttribute('aria-pressed', String(dark));
    }

    function applyTheme(preference) {
        if (preference === 'light' || preference === 'dark') {
            root.dataset.theme = preference;
        } else {
            delete root.dataset.theme;
        }
        colorScheme.content = root.dataset.theme ?? 'light dark';
        updateThemeButton();
    }

    function restoreTheme() {
        try {
            applyTheme(localStorage.getItem(themeKey));
        } catch {
            // The CSS system preference works when browser storage is unavailable.
        }
    }

    function closeNavigation() {
        menuButton()?.setAttribute('aria-expanded', 'false');
        openGroup()?.removeAttribute('open');
    }

    function closeMenuOutside(event) {
        const insideNavigation = navigation()?.contains(event.target);
        const group = openGroup();
        if (group && !group.contains(event.target) && (event.type === 'click' || !insideNavigation)) {
            group.open = false;
        }
        const menu = menuButton();
        if (menu?.getAttribute('aria-expanded') === 'true'
            && !menu.contains(event.target)
            && !insideNavigation) {
            menu.setAttribute('aria-expanded', 'false');
        }
    }

    restoreTheme();
    document.addEventListener('DOMContentLoaded', updateThemeButton, {once: true});
    systemScheme.addEventListener('change', updateThemeButton);
    window.addEventListener('storage', event => {
        if (event.key === themeKey || event.key === null) restoreTheme();
    });
    window.addEventListener('pageshow', event => {
        if (!event.persisted) return;
        restoreTheme();
        closeNavigation();
    });
    window.addEventListener('pageswap', ({activation, viewTransition}) => {
        const destination = activation?.entry?.url;
        if (!destination || !viewTransition) return;
        const {pathname} = new URL(destination);
        if (pathname === '/admin' || pathname.startsWith('/admin/') || pathname === '/login' || pathname === '/salir') {
            // The panel opts out, so stop the transition before its page is revealed.
            viewTransition.ready.catch(() => {});
            viewTransition.skipTransition();
        }
    });

    document.addEventListener('click', event => {
        if (event.target.closest?.('[data-theme-toggle]')) {
            const opposite = (root.dataset.theme ?? systemTheme()) === 'dark' ? 'light' : 'dark';
            const preference = opposite === systemTheme() ? null : opposite;
            applyTheme(preference);
            try {
                if (preference) localStorage.setItem(themeKey, preference);
                else localStorage.removeItem(themeKey);
            } catch {}
        } else if (compact.matches && menuButton()?.contains(event.target)) {
            const menu = menuButton();
            menu.setAttribute('aria-expanded', String(menu.getAttribute('aria-expanded') !== 'true'));
            openGroup()?.removeAttribute('open');
        } else {
            closeMenuOutside(event);
        }
    });
    document.addEventListener('focusin', closeMenuOutside);
    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        const group = openGroup();
        if (group) {
            group.open = false;
            group.querySelector('summary').focus();
            return;
        }
        const menu = menuButton();
        if (menu?.getAttribute('aria-expanded') === 'true') {
            menu.setAttribute('aria-expanded', 'false');
            menu.focus();
        }
    });
    compact.addEventListener('change', closeNavigation);
    root.classList.add('enhanced');
})();
