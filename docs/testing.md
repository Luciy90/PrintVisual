# Тестирование PrintVisual

## Что покрыто

Автоматические тесты нацелены на ключевые серверные модули первого этапа миграции:

- `src/schemas.ts` — юнит-тесты для всех Zod-схем валидации.
- `src/services/printerService.ts` — юнит- и интеграционные тесты для MAC lookup.
- `src/services/networkScanner.ts` — юнит-, интеграционные и сценарные тесты для recovery plan.
- `src/services/address.ts` — вспомогательные функции нормализации адресов и MAC.
- `tests/app.integration.test.ts` — HTTP-интеграция Express API с реальной валидацией запросов.

## Команды

Установка зависимостей:

```bash
npm install
```

Быстрый запуск тестов:

```bash
npm test
```

Режим наблюдения:

```bash
npm run test:watch
```

Полный прогон с покрытием:

```bash
npm run test:coverage
```

Параллельно с тестами перед CI рекомендуется запускать:

```bash
npm run typecheck
npm run build
```

## Конфигурация

Основная конфигурация находится в `vitest.config.ts`.

Там заданы:

- Node runtime для тестов;
- генерация JSON и JUnit отчётов;
- покрытие `v8`;
- список целевых модулей для coverage;
- порог `>= 90%` по lines/functions/branches/statements для набора критичных модулей.

Сгенерированные отчёты сохраняются в репозитории в папке `reports/`:

- `reports/tests/results.json` — машиночитаемый сводный отчёт Vitest;
- `reports/tests/junit.xml` — JUnit-отчёт для CI;
- `reports/coverage/coverage-summary.json` — итоговое покрытие по модулям.

## Структура тестов

```text
tests/
  address.test.ts
  app.integration.test.ts
  networkScanner.test.ts
  printerService.test.ts
  schemas.test.ts
```

## Как расширять набор тестов

1. Для новых Zod-схем добавляйте кейсы в `tests/schemas.test.ts` или создавайте отдельный модульный файл рядом с ним.
2. Для сетевых сервисов предпочитайте dependency injection или мок `fetch`, чтобы тест не зависел от реальной сети.
3. Для recovery plan сначала покрывайте внутренние функции модуля через `networkScannerInternals`, затем добавляйте сценарный тест верхнего уровня через `buildRecoveryPlan`.
4. Для HTTP-поведения расширяйте `tests/app.integration.test.ts`, поднимая локальные тестовые серверы вместо обращения к внешним API.
5. Если новый модуль относится к критичным путям, добавляйте его в `coverage.include` в `vitest.config.ts`.

## CI

GitHub Actions workflow находится в `.github/workflows/ci.yml` и выполняет:

1. `npm ci`
2. `npm run typecheck`
3. `npm run build`
4. `npm run test:coverage`
5. публикацию артефактов из `reports/`
