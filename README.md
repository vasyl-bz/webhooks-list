# Webhooks

Невеликий застосунок: вхід, список вебхуків з пагінацією та пошуком, редагування. API імітується через MSW.

## Запуск

Потрібен Node.js 20+.

```bash
npm install
npm run dev
```

Застосунок відкриється на http://localhost:5173.

```bash
npm test          # автотести HTTP-клієнта (Vitest + msw/node)
npm run typecheck # tsc у strict mode
npm run lint
npm run build && npm run preview
```

## Тестові облікові дані

| Email              | Пароль        |
| ------------------ | ------------- |
| `demo@example.com` | `password123` |

## Стек

- React 19 + TypeScript (`strict`, `noUncheckedIndexedAccess`)
- React Router 7 (data mode: loaders і actions)
- react-hook-form + zod
- MSW 2 для мок-API, Vitest для тестів
- Чистий CSS без UI-бібліотек

## Як перевірити основні сценарії

- **Сесія на 30 секунд.** Увійдіть, зачекайте понад 30 с і перейдіть на іншу сторінку або збережіть форму. У DevTools → Network видно: `401 → POST /auth/token/rotate → повтор запиту`.
- **Спільний rotate.** Після перезавантаження сторінки `/v1/me` і `/v1/webhooks` йдуть паралельно, обидва отримують 401, а rotate буде лише один. Ту саму поведінку перевіряє автотест.
- **Серверна валідація.** На формі редагування вкажіть `ftp://example.com`: помилка 422 зʼявиться біля поля URL. На клієнті перевіряється лише заповненість полів, формат URL перевіряє сервер.
- **Стан помилки списку.** Виконайте `localStorage.setItem('mock:fail-webhooks', '1')` і оновіть список: мок поверне 500. Щоб вимкнути, виконайте `localStorage.removeItem('mock:fail-webhooks')`.
- **URL-стан.** Сторінка й пошук живуть в URL. Після перезавантаження потрібно увійти знову, бо стан мока зберігається лише в памʼяті, і після входу відкривається та сама адреса з параметрами.

## Структура

```
src/
  api/                  транспорт і типізовані клієнти API, без React
    http/client.ts      CSRF, повтор на 419, rotate на 401 (single-flight)
    http/csrf.ts        кеш CSRF-токена з дедуплікацією запиту
    http/errors.ts      ApiError і type guards
    auth.ts, webhooks.ts
    fingerprint.ts      32 hex, генерується один раз, зберігається в localStorage
    create-api.ts       фабрика (застосунок і тести створюють власні екземпляри)
  features/
    auth/               сторінка входу, loader сесії, logout action, redirect-утиліти
    webhooks/           loaders, сторінки списку й редагування, компоненти
  shared/               UI-примітиви, мапінг серверних помилок у форму
  mocks/                MSW-хендлери, in-memory «база», seed
  app/                  роутер і layout-и
```
