# Percolation Lab

Модульная версия учебного проекта по перколяции.

## Структура

```text
percolation-lab/
├── css/
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── pages.css
│   └── main.css
├── js/
│   ├── model/
│   │   ├── Grid.js
│   │   ├── Cluster.js
│   │   ├── Statistics.js
│   │   └── PercolationModel.js
│   ├── view/
│   │   ├── CanvasView.js
│   │   ├── StatsView.js
│   │   ├── ControlsView.js
│   │   ├── AccordionView.js
│   │   └── ChartView.js
│   ├── controller/
│   │   ├── PercolationController.js
│   │   └── AccordionController.js
│   ├── app.js
│   ├── theory.js
│   └── applications.js
├── index.html
├── theory.html
├── applications.html
├── about.html
├── .gitignore
└── README.md
```

## Запуск

Откройте `index.html` в браузере. Современные браузеры поддерживают ES modules.

Если браузер ограничивает `file://` для модулей, запустите простой локальный сервер:

```bash
python -m http.server 8000
```

После этого откройте `http://localhost:8000/`.

## Функциональность

- генерация случайной квадратной решётки;
- поиск кластеров и сквозного кластера;
- изменение `p` и размера `L`;
- анимация роста кластера;
- фильтр сквозного кластера;
- экспорт визуализации в PNG;
- синхронизация `p` и `L` с URL;
- построение `P∞(p)` и оценка `p_c`;
- аккордеоны на страницах теории и применений;
- открытие раздела теории по hash URL.

Логика исходных HTML вынесена в ES-модули без подключения сторонних библиотек.
