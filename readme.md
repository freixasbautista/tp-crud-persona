```mermaid
flowchart TD
    Usuario --> API
    API --> Service
    Service --> Repository
    Repository --> Model
    Model --> Repository
    Repository --> Service
    Service --> API
    API --> Usuario
```
