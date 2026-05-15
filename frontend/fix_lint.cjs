const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Fix const cargar... = async (...) => {
    content = content.replace(/const (cargar[A-Za-z0-9_]*) = async \((.*?)\) => {/g, 'async function $1($2) {');
    // Fix const cargar... = (...) => {
    content = content.replace(/const (cargar[A-Za-z0-9_]*) = \((.*?)\) => {/g, 'function $1($2) {');
    
    // AdminAdministrativos.jsx
    if (file === 'AdminAdministrativos.jsx') {
        content = content.replace(/} catch \(error\) {\s+Swal.fire/g, '} catch (err) {\n            Swal.fire');
    }
    // AdminAdmisiones.jsx
    if (file === 'AdminAdmisiones.jsx') {
        content = content.replace(/} catch \(error\) {\s+Swal.fire/g, '} catch (err) {\n                Swal.fire');
    }
    // AdminCarrusel.jsx
    if (file === 'AdminCarrusel.jsx') {
        content = content.replace(/const token = localStorage.getItem\('token'\);\s+const formData/g, 'const formData');
        content = content.replace(/} catch \(error\) {\s+Swal.fire/g, '} catch (err) {\n                Swal.fire');
    }
    // AdminComunicados.jsx
    if (file === 'AdminComunicados.jsx') {
        content = content.replace(/} catch \(error\) {\s+Swal.fire/g, '} catch (err) {\n                Swal.fire');
    }
    // AdminDocentes.jsx
    if (file === 'AdminDocentes.jsx') {
        content = content.replace(/} catch \(error\) {\s+Swal.fire/g, '} catch (err) {\n            Swal.fire');
    }
    // AdminEventos.jsx
    if (file === 'AdminEventos.jsx') {
        content = content.replace(/} catch \(error\) {\s+Swal.fire/g, '} catch (err) {\n            Swal.fire');
    }
    // AdminGaleria.jsx
    if (file === 'AdminGaleria.jsx') {
        content = content.replace(/} catch \(error\) {\s+Swal.fire/g, '} catch (err) {\n            Swal.fire');
    }
    // AdminTransparencia.jsx
    if (file === 'AdminTransparencia.jsx') {
        content = content.replace(/} catch \(error\) {\s+Swal.fire/g, '} catch (err) {\n            Swal.fire');
    }
    // Admision.jsx
    if (file === 'Admision.jsx') {
        content = content.replace(/icon: Icon,\s*/g, '');
        content = content.replace(/<Icon className="[^"]*" size=\{24\} \/>/g, '');
    }
    // Inicio.jsx
    if (file === 'Inicio.jsx') {
        content = content.replace(/icon: Icon,\s*/g, '');
    }
    
    fs.writeFileSync(fullPath, content);
}

// Fix Footer.jsx unused Icon
const footerPath = path.join(__dirname, 'src', 'components', 'Footer.jsx');
if (fs.existsSync(footerPath)) {
    let footerContent = fs.readFileSync(footerPath, 'utf8');
    footerContent = footerContent.replace(/\{ icon: Icon, label, href \}/g, '{ label, href }');
    footerContent = footerContent.replace(/<Icon size=\{18\} className="text-blue-200 group-hover:text-white transition-colors" \/>/g, '');
    footerContent = footerContent.replace(/\{ icon: Icon, text \}/g, '{ text }');
    footerContent = footerContent.replace(/<Icon size=\{18\} className="text-red-500 mt-1 flex-shrink-0" \/>/g, '');
    fs.writeFileSync(footerPath, footerContent);
}

console.log("Fixes applied");
