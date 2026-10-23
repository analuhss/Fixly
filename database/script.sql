CREATE TABLE IF NOT EXISTS login (
    idCliente INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    tipo TEXT NOT NULL
        CHECK (tipo IN ('cliente', 'profisional', 'adm'))
)
