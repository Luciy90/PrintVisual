export const Config = {
  defaultCameras: [
    { ip: '192.168.0.193', stream: '', name: 'ТкачМатерии' },
    { ip: '192.168.0.194', stream: '', name: 'КузницаСлоев' },
    { ip: '192.168.0.195', stream: '', name: 'Пластикоформовщик' }
  ],

  defaultSettings: {
    // Цветовая схема
    color1: '#667eea',
    color2: '#471b74',
    colorIntOver: 1.5,
    errorNotificationColor: '#ff4d4d',
    systemNotificationColor: '#4ade80',
    notificationOpacity: '0.3',

    // Загрузка
    loader: {
      hide: false,
      bgColor: '#111111',
      opacity: '1',
      offFullCheckbox: false
    },
    // Уведомления
    hideNotifications: false,

    // Сетка
    grid: {
      columns: 3
    },

    // Шапка
    header: {
      text: 'Активные принтера',
      hidden: false,
      bgColor: '#000000',
      bgOpacity: 0.4,
      textColor: '#ffffff'
    },

    // Разделители
    dividerColor: '#ba88e2',
    dividerThickness: 2,
    dividerAlign: 'center',
    dividerWidth: 96,
    enableDividers: false,

    // Размер текста
    namedDriv: 0.9,

    // Интерфейс
    interfaceWidth: 1400,
    interfaceHeight: 180,
    enableWidthInput: false
  },

  colors: {
    dammyColor: '#667eea',
    dammyColor2: '#471b74'
  },

  performance: {
    debounceDelay: 100,
    throttleDelay: 16,
    maxRetries: 3,
    retryDelay: 1000
  }
};
