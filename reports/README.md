# Отчёты тестирования

В этой папке сохраняются последние машиночитаемые результаты локального и CI-прогона:

- `tests/results.json` — полный JSON-отчёт Vitest;
- `tests/junit.xml` — JUnit-отчёт для CI;
- `coverage/coverage-summary.json` — агрегированное покрытие целевых модулей.

Файлы обновляются командой:

```bash
npm run test:coverage
```
