
## 🚀 Сборка Docker-образа




```bash
docker build -t stsgn-gen .
```

- `-stsgn-gen` — задаёт имя образа.
- `.` — текущая директория, в которой лежит `Dockerfile`.

---

## ▶️ Запуск контейнера

```bash
docker run -d -p 8181:80 --name tsgn-container --restart always stsgn-gen
```

- `-d` — запускаем в фоновом режиме (detached).
- `-p 8181:80` — пробрасываем порт 80 внутри контейнера на порт 8080 хоста.
- `--name tsgn-container` — имя контейнера.
- `--restart always` — контейнер будет перезапускаться при сбоях и перезагрузке хоста.
- `stsgn-gen` — имя ранее собранного образа.

---

## 🛑 Остановка контейнера

```bash
docker stop tsgn-container
```

## ❌ Удаление контейнера

```bash
docker rm tsgn-container
```

