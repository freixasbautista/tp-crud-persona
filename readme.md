```text
PRACTICO/
├── backend/
│   ├── api.py
│   ├── models/
│   │   └── persona.py
│   ├── services/
│   │   └── persona_service.py
│   ├── repository/
│   │   └── persona_repository.py
│   └── personas.db
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── bun.lock
│
└── readme.md
```

```mermaid
flowchart TD
    Usuario["Usuario"]

    subgraph Proyecto["PRACTICO"]
        subgraph Frontend["frontend/"]
            UI["React + TypeScript"]
            Router["router.tsx<br/>TanStack Router"]
        end

        subgraph Backend["backend/"]
            API["api.py<br/>Flask REST API"]

            subgraph Services["services/"]
                Service["persona_service.py<br/>PersonaService"]
            end

            subgraph Repository["repository/"]
                Repo["persona_repository.py<br/>PersonaRepository"]
            end

            subgraph Models["models/"]
                Model["persona.py<br/>Persona"]
            end

            DB[("personas.db<br/>SQLite")]
        end

        README["readme.md"]
    end

    Usuario --> UI
    UI --- Router
    UI -->|"HTTP / JSON"| API
    API -->|"solicita operaciones"| Service
    Service -->|"aplica reglas de negocio"| Model
    Service -->|"solicita operaciones CRUD"| Repo
    Repo -->|"guarda / busca / modifica / elimina"| DB
    Model -->|"valida datos"| Model

    API -->|"respuestas JSON"| UI
```
