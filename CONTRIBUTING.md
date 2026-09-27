# 🤝 Contribuir a XAMA-ONG Platform

¡Gracias por tu interés! Este proyecto nace para ayudar a ONGs reales,
y toda contribución es bienvenida.

## 🐛 Reportar bugs

Abre un [issue](https://github.com/urukaisk-maker/xama-ong-platform/issues)
con:

- Descripción clara del problema
- Pasos para reproducirlo
- Comportamiento esperado vs. observado
- Logs o captura si aplica

## 💡 Proponer mejoras

Antes de abrir un issue, revisa si ya existe. Si no:

1. Abre un issue describiendo la propuesta
2. Explica qué problema resuelve y para quién
3. Espera feedback antes de hacer un PR grande

## 🔧 Pull Requests

### Flujo

    # 1. Fork + clonar
    git clone https://github.com/tu-usuario/xama-ong-platform.git
    cd xama-ong-platform

    # 2. Rama nueva
    git checkout -b feature/mi-mejora

    # 3. Desarrollar
    # ...

    # 4. Tests (obligatorio)
    docker compose exec xama-api pytest
    docker compose exec xama-api ruff check .

    # 5. Commit semántico
    git commit -m "feat(modulo): descripción corta"

    # 6. Push y PR
    git push origin feature/mi-mejora

### Convención de commits

| Prefijo | Cuándo |
|---------|--------|
| feat: | Nueva funcionalidad |
| fix: | Corrección de bug |
| docs: | Solo documentación |
| style: | Formato, sin cambios funcionales |
| refactor: | Refactorización |
| test: | Añadir o corregir tests |
| chore: | Tareas de mantenimiento |

### Checklist antes de PR

- [ ] Tests pasan: docker compose exec xama-api pytest
- [ ] Lint limpio: docker compose exec xama-api ruff check .
- [ ] Código en español (nombres de dominio) o inglés (código genérico)
- [ ] Sin console.log ni print() de debug
- [ ] Si añades endpoints, tests correspondientes
- [ ] Si cambias modelos, migración Alembic
- [ ] Actualiza README si afecta a funcionalidad pública

## 🎨 Estilo

- **Backend**: seguir el estilo existente (FastAPI + SQLAlchemy async).
- **Frontend**: TypeScript estricto, componentes funcionales, Tailwind.
- **Idioma del código**: identificadores en inglés, comentarios en español.
- **Sin dependencias nuevas** salvo justificación clara.

## 📋 Buenas prácticas

- Un PR = una cosa. Nada de "arreglo 5 cosas de golpe".
- Si es grande, abre un issue antes para discutirlo.
- Documenta el "por qué", no el "qué" (el código ya dice qué).

## 🙏 Gracias

Cada aportación, por pequeña que sea, ayuda a que más ONGs puedan
beneficiarse de una herramienta pensada para ellas.

🌱
