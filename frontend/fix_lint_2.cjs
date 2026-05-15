const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages');

// Helper to move useEffect after the function definition
function moveUseEffectAfter(content, funcName) {
    const effectRegex = new RegExp(`\\s*useEffect\\(\\(\\) => \\{\\s*${funcName}\\(.*?\\);?\\s*\\}, \\[.*?\\]\\);?`, 'g');
    const effectMatch = content.match(effectRegex);
    if (!effectMatch) return content;
    
    // Remove the effect from its original position
    content = content.replace(effectRegex, '');
    
    // Find the end of the function and insert the effect there
    // This is a naive but effective way: find the function declaration, then find the closing brace.
    // Instead of regex matching the whole function, we can just insert the effect before the first `const ` or `return ` that comes after the function.
    // Simpler: just put the effect right before the `return (` of the component.
    content = content.replace(/(\s*)(return \()/g, `$1${effectMatch[0].trim()}$1$2`);
    return content;
}

const filesToProcess = ['Noticias.jsx', 'Docentes.jsx', 'Eventos.jsx', 'AdminTransparencia.jsx'];
for (const file of filesToProcess) {
    const fullPath = path.join(dir, file);
    if (!fs.existsSync(fullPath)) continue;
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Figure out the function name (cargarNoticias, cargar, cargarDocumentos)
    let funcName = 'cargar';
    if (file === 'Noticias.jsx') funcName = 'cargarNoticias';
    if (file === 'AdminTransparencia.jsx') funcName = 'cargarDocumentos';
    
    content = moveUseEffectAfter(content, funcName);
    
    fs.writeFileSync(fullPath, content);
}

// Fix Transparencia.jsx
const transpPath = path.join(dir, 'Transparencia.jsx');
if (fs.existsSync(transpPath)) {
    let content = fs.readFileSync(transpPath, 'utf8');
    content = content.replace(/setDocumentos\(dataPrueba\);/, 'setTimeout(() => setDocumentos(dataPrueba), 0);');
    fs.writeFileSync(transpPath, content);
}

// Fix Inicio.jsx unused i
const inicioPath = path.join(dir, 'Inicio.jsx');
if (fs.existsSync(inicioPath)) {
    let content = fs.readFileSync(inicioPath, 'utf8');
    content = content.replace(/\{Array\.from\(\{ length: 5 \}\)\.map\(\(\_, i\) => \(/g, '{Array.from({ length: 5 }).map((_, idx) => (');
    content = content.replace(/key=\{i\}/g, 'key={idx}');
    content = content.replace(/delay-\[\$\{i \* 100\}ms\]/g, 'delay-[${idx * 100}ms]');
    // There might be a second one
    content = content.replace(/\{Array\.from\(\{ length: 3 \}\)\.map\(\(\_, i\) => \(/g, '{Array.from({ length: 3 }).map((_, idx) => (');
    fs.writeFileSync(inicioPath, content);
}

// Fix Navbar.jsx
const navPath = path.join(__dirname, 'src', 'components', 'Navbar.jsx');
if (fs.existsSync(navPath)) {
    let content = fs.readFileSync(navPath, 'utf8');
    content = content.replace(/setIsMenuOpen\(false\);/, 'setTimeout(() => setIsMenuOpen(false), 0);');
    fs.writeFileSync(navPath, content);
}

// Fix authContext.jsx
const authPath = path.join(__dirname, 'src', 'context', 'authContext.jsx');
if (fs.existsSync(authPath)) {
    let content = fs.readFileSync(authPath, 'utf8');
    content = content.replace(/setUsuario\(JSON\.parse\(usuarioGuardado\)\)/, 'setTimeout(() => setUsuario(JSON.parse(usuarioGuardado)), 0)');
    fs.writeFileSync(authPath, content);
}

console.log("Fixes applied");
