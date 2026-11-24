#!/usr/bin/env python3
"""Install the pinned Codex skills for this repository."""

import argparse
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import sys
import tarfile
from tempfile import TemporaryDirectory


PROJECT = Path(__file__).resolve().parents[1]
LOCK = PROJECT / "agent-skills.lock.json"
AGENTS = PROJECT / ".agents"
BROWSER_PACKAGE = "agent-browser@0.44.0"


def git(directory, *arguments):
    subprocess.run(
        ["git", "-C", str(directory), *arguments],
        env={**os.environ, "GIT_TERMINAL_PROMPT": "0"},
        check=True,
    )


def unpack(archive, destination):
    destination = destination.resolve()
    with tarfile.open(archive) as bundle:
        for member in bundle:
            path = PurePosixPath(member.name)
            if path.is_absolute() or ".." in path.parts or "\\" in member.name:
                raise ValueError(f"Ruta inválida en el paquete de skills. {member.name}")
            if member.isdir():
                continue
            if not member.isfile():
                raise ValueError(f"Tipo de archivo no admitido en el paquete. {member.name}")
            target = destination.joinpath(*path.parts)
            if destination not in target.resolve().parents:
                raise ValueError(f"Ruta fuera del paquete de skills. {member.name}")
            target.parent.mkdir(parents=True, exist_ok=True)
            with bundle.extractfile(member) as origin, target.open("wb") as output:
                shutil.copyfileobj(origin, output)
            target.chmod(0o755 if member.mode & 0o111 else 0o644)


def name_in(skill):
    if not skill.is_file():
        return None
    first, *blocks = skill.read_text(encoding="utf-8-sig").split("---", 2)
    if first.strip() or not blocks:
        return None
    name = re.search(r"^name:\s*['\"]?([\w-]+)", blocks[0], re.MULTILINE)
    return name.group(1) if name else None


def copy_files(source, destination):
    for file in sorted(source.rglob("*")):
        if not file.is_file():
            continue
        target = destination / file.relative_to(source)
        if AGENTS.resolve() not in target.resolve().parents:
            raise ValueError(f"Ruta fuera de .agents. {target}")
        if target.exists() or target.is_symlink():
            if not target.is_file() or target.read_bytes() != file.read_bytes():
                raise ValueError(f"Hay un archivo local diferente en {target}")
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(file, target)


def install(source):
    repository = source["repository"]
    commit = source["commit"]
    support = source.get("support", [])
    licenses = source.get("licenses", [])
    paths = [*source["skills"].values(), *support, *licenses]
    if not re.fullmatch(r"[\w.-]+/[\w.-]+", repository) or not re.fullmatch(r"[a-f0-9]{40}", commit):
        raise ValueError(f"Origen inválido en {LOCK.name}. {repository}")
    print(f"Instalando {repository} ({commit[:7]})", flush=True)
    with TemporaryDirectory(prefix="colegio-agent-skills-") as temporary:
        work = Path(temporary)
        git(work, "init", "--quiet")
        git(work, "remote", "add", "origin", f"https://github.com/{repository}.git")
        git(work, "fetch", "--quiet", "--filter=blob:none", "--depth=1", "--no-tags", "origin", commit)
        archive = work / "skills.tar"
        git(work, "archive", "--format=tar", f"--output={archive}", commit, "--", *paths)
        files = work / "files"
        unpack(archive, files)
        for name, relative in source["skills"].items():
            tree = files / relative
            document = tree / "SKILL.md"
            if name_in(document) != name:
                raise ValueError(f"El origen de {name} no contiene su SKILL.md esperado.")
            if name == "ui-ux-pro-max":
                text = document.read_text(encoding="utf-8")
                text = text.replace("${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max", ".agents/skills/ui-ux-pro-max")
                document.write_text(text, encoding="utf-8")
            if name == "agent-browser":
                text = document.read_text(encoding="utf-8")
                text = text.replace("hidden: true\n", "", 1)
                text = text.replace("Install: `npm i -g agent-browser && agent-browser install`",
                                    "Use the project-local CLI from `.agents/tools/node_modules/.bin`.")
                document.write_text(text, encoding="utf-8")
            for license_file in licenses:
                local_file = tree / Path(license_file).name
                if not local_file.exists():
                    shutil.copy2(files / license_file, local_file)
            copy_files(tree, AGENTS / "skills" / name)
        for path in support:
            copy_files(files / path, AGENTS / path)


def verify(sources):
    names = [name for source in sources for name in source["skills"]]
    missing = [name for name in names if name_in(AGENTS / "skills" / name / "SKILL.md") != name]
    missing.extend(path for source in sources for path in source.get("support", []) if not (AGENTS / path).is_dir())
    if missing:
        raise ValueError("Faltan archivos de skills. " + ", ".join(missing))
    if len(names) != len(set(names)):
        raise ValueError(f"Hay skills duplicadas en {LOCK.name}.")
    print(f"{len(names)} skills verificadas en .agents/skills")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Revisar la instalación local sin descargar archivos")
    parser.add_argument("--with-browser-cli", action="store_true", help="Instalar el CLI local de agent-browser con npm")
    args = parser.parse_args()
    if AGENTS.is_symlink():
        raise ValueError("La carpeta .agents debe estar dentro del proyecto.")
    sources = json.loads(LOCK.read_text(encoding="utf-8"))["sources"]
    if not args.check:
        for source in sources:
            install(source)
    verify(sources)
    if args.with_browser_cli and not args.check:
        npm = shutil.which("npm")
        if npm is None:
            raise ValueError("El CLI de agent-browser requiere npm.")
        tools = AGENTS / "tools"
        cache = AGENTS / "cache" / "npm"
        if any(AGENTS not in path.resolve().parents for path in (tools, cache)):
            raise ValueError("Las carpetas del CLI deben estar dentro de .agents.")
        subprocess.run(
            [npm, "install", "--prefix", str(tools), "--cache", str(cache),
             "--ignore-scripts", "--no-audit", "--no-fund", "--save-exact", BROWSER_PACKAGE],
            cwd=PROJECT,
            check=True,
        )


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        print(error, file=sys.stderr)
        sys.exit(1)
