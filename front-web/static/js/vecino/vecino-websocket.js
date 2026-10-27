// front-web/static/js/vecino/vecino-websocket.js
document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = localStorage.getItem('selected_backend') || 'http://127.0.0.1:8000/api';
    let reconnectDelay = 1000;
    let reconnectTimeout;

    function connect() {
        let socket;

        try {
            const backendUrl = new URL(apiBaseUrl);
            backendUrl.protocol = backendUrl.protocol === 'https:' ? 'wss:' : 'ws:';
            backendUrl.pathname = '/ws/reclamos/publicos/';
            backendUrl.search = '';
            backendUrl.hash = '';

            socket = new WebSocket(backendUrl.toString());
        } catch (error) {
            console.error('No se pudo iniciar la conexión WebSocket:', error);
            scheduleReconnect();
            return;
        }

        socket.onopen = () => {
            console.log('Conexión WebSocket pública establecida.');
            reconnectDelay = 1000;
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                window.dispatchEvent(new CustomEvent('reclamo:actualizado', { detail: data }));
            } catch (error) {
                console.error('No se pudo procesar el mensaje WebSocket:', error);
            }
        };

        socket.onerror = (error) => {
            console.error('Error en la conexión WebSocket:', error);
        };

        socket.onclose = () => {
            console.warn('Conexión WebSocket cerrada; se intentará reconectar.');
            scheduleReconnect();
        };
    }

    function scheduleReconnect() {
        window.clearTimeout(reconnectTimeout);
        reconnectTimeout = window.setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30000);
    }

    connect();
});