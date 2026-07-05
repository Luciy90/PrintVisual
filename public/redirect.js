(() => {
      if (window.location.protocol !== 'file:') return;

      const LOCALHOST_PORT = '8765';
      const fileName = decodeURIComponent(window.location.pathname.split('/').pop() || 'print 1.8.27.html');
      const encodedFileName = encodeURIComponent(fileName);
      const targetUrl = `http://localhost:${LOCALHOST_PORT}/${encodedFileName}${window.location.search}${window.location.hash}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 900);

      fetch(targetUrl, { mode: 'no-cors', cache: 'no-store', signal: controller.signal })
        .then(() => {
          window.location.replace(targetUrl);
        })
        .catch(() => {
          window.addEventListener('DOMContentLoaded', () => {
            const notice = document.createElement('div');
            notice.style.cssText = [
              'position:fixed',
              'inset:16px 16px auto 16px',
              'z-index:99999',
              'padding:14px 16px',
              'border-radius:10px',
              'border:1px solid rgba(96,165,250,.65)',
              'background:rgba(15,23,42,.96)',
              'color:#eef2ff',
              'font:14px/1.45 Inter,system-ui,sans-serif',
              'box-shadow:0 18px 50px rgba(0,0,0,.35)'
            ].join(';');
            notice.innerHTML = `Для получения MAC откройте приложение через <b>http://localhost:${LOCALHOST_PORT}/${encodedFileName}</b>. Сейчас файл открыт напрямую, поэтому браузер отправляет Origin <b>null</b>.`;
            document.body.appendChild(notice);
          }, { once: true });
        })
        .finally(() => clearTimeout(timer));
    })();
  