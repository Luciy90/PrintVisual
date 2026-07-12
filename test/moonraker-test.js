// moonraker-test.js

// ВАЖНО: Укажите IP-адрес вашего принтера в локальной сети
const MOONRAKER_IP = '192.168.88.115'; 
const PORT = 7125; // 7125 — стандартный порт Moonraker по умолчанию

const baseUrl = `http://${MOONRAKER_IP}:${PORT}`;

/**
 * Универсальная функция для отправки GET-запросов к API Moonraker
 */
async function fetchMoonrakerData(endpoint) {
    try {
        const response = await fetch(`${baseUrl}${endpoint}`);
        if (!response.ok) {
            throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
        }
        const data = await response.json();
        // Moonraker всегда оборачивает полезные данные в объект "result"
        return data.result; 
    } catch (error) {
        console.error(`❌ Ошибка при запросе к ${endpoint}:`, error.message);
        return null;
    }
}

/**
 * Основная функция запуска тестов
 */
async function runTest() {
    console.log(`\n🔌 Подключение к Moonraker по адресу: ${baseUrl}\n`);
    console.log("=".repeat(50));

    // --- 1. Информация о сервере (Moonraker) ---
    console.log("1️⃣  СИСТЕМНАЯ ИНФОРМАЦИЯ MOONRAKER");
    const serverInfo = await fetchMoonrakerData('/server/info');
    if (serverInfo) {
        console.log(`Версия Moonraker: ${serverInfo.moonraker_version}`);
        console.log(`Загрузка процессора: ${serverInfo.system_cpu_usage?.cpu}%`);
        console.log(`Память (Свободно/Всего): ${(serverInfo.system_memory?.avail / 1024 / 1024).toFixed(2)} MB / ${(serverInfo.system_memory?.total / 1024 / 1024).toFixed(2)} MB`);
    }
    console.log("-".repeat(50));

    // --- 2. Базовая информация о принтере (Klipper) ---
    console.log("2️⃣  ИНФОРМАЦИЯ О KLIPPER");
    const printerInfo = await fetchMoonrakerData('/printer/info');
    if (printerInfo) {
        console.log(`Версия Klipper: ${printerInfo.software_version}`);
        console.log(`Статус Klipper: ${printerInfo.state} (${printerInfo.state_message})`);
    }
    console.log("-".repeat(50));

    // --- 3. Детальный статус принтера (Температуры, печать, координаты) ---
    // Здесь мы запрашиваем конкретные объекты: print_stats, toolhead, extruder, heater_bed
    console.log("3️⃣  ТЕКУЩЕЕ СОСТОЯНИЕ ПРИНТЕРА");
    const objectsQuery = '/printer/objects/query?print_stats&toolhead&extruder&heater_bed&display_status';
    const printerState = await fetchMoonrakerData(objectsQuery);

    if (printerState && printerState.status) {
        const status = printerState.status;

        // Статус текущей печати
        console.log(`\n[Статус печати]: ${status.print_stats?.state.toUpperCase()}`);
        console.log(`Файл: ${status.print_stats?.filename || "Нет активного файла"}`);
        console.log(`Прогресс: ${((status.display_status?.progress || 0) * 100).toFixed(1)}%`);
        console.log(`Время в печати: ${Math.floor((status.print_stats?.print_duration || 0) / 60)} мин.`);

        // Температуры
        console.log(`\n[Температуры]`);
        console.log(`Экструдер: ${status.extruder?.temperature.toFixed(1)}°C (Цель: ${status.extruder?.target}°C)`);
        console.log(`Стол: ${status.heater_bed?.temperature.toFixed(1)}°C (Цель: ${status.heater_bed?.target}°C)`);

        // Координаты
        if (status.toolhead?.position) {
            const [x, y, z, e] = status.toolhead.position;
            console.log(`\n[Позиция Toolhead]`);
            console.log(`X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, Z: ${z.toFixed(2)}, E: ${e.toFixed(2)}`);
        }
    }
    console.log("=".repeat(50));
    console.log("✅ Тест завершен.\n");
}

// Запуск
runTest();

//🔌 Подключение к Moonraker по адресу: http://192.168.88.115:7125

//==================================================
//1️⃣  СИСТЕМНАЯ ИНФОРМАЦИЯ MOONRAKER
//Версия Moonraker: v0.8.0-317-g0850c16
//Загрузка процессора: undefined%
//Память (Свободно/Всего): NaN MB / NaN MB
//--------------------------------------------------
//2️⃣  ИНФОРМАЦИЯ О KLIPPER
//Версия Klipper: v0.12.0-61-gb50d6669a-dirty
//Статус Klipper: ready (Printer is ready)
//--------------------------------------------------
//3️⃣  ТЕКУЩЕЕ СОСТОЯНИЕ ПРИНТЕРА

//[Статус печати]: STANDBY
//Файл: Нет активного файла
//Прогресс: 0.0%
//Время в печати: 0 мин.

//[Температуры]
//Экструдер: 27.8°C (Цель: 0°C)
//Стол: 27.5°C (Цель: 0°C)

//[Позиция Toolhead]
//X: 0.00, Y: 0.00, Z: 0.00, E: 0.00
//==================================================
//✅ Тест завершен.