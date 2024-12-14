class FileAccessApp {
    constructor() {
        this.webapp = window.Telegram.WebApp;
        this.statusElement = document.getElementById('status');
        this.errorElement = document.getElementById('error');
        this.retryButton = document.getElementById('retryButton');
        this.infoElement = document.getElementById('info');
        this.setupEventListeners();
        this.init();
    }

    setupEventListeners() {
        // Listen for messages from Telegram
        window.addEventListener('message', this.handleMessage.bind(this));
        
        // Retry button click handler
        this.retryButton.addEventListener('click', () => {
            this.hideError();
            this.init();
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateStatus('Ready for file access...');
            }
        });
    }

    init() {
        try {
            // Initialize Telegram WebApp
            this.webapp.ready();
            this.webapp.expand();

            // Get the startapp parameter
            const startApp = this.getStartAppParameter();
            if (startApp) {
                this.processRedirect(startApp);
            } else {
                this.updateStatus('Ready for file access...');
                this.showActiveIndicator();
            }
        } catch (error) {
            this.showError('Initialization failed. Please try again.');
            console.error('Init Error:', error);
        }
    }

    handleMessage(event) {
        try {
            const data = event.data;
            if (typeof data === 'string' && data.startsWith('https://')) {
                const url = new URL(data);
                const params = new URLSearchParams(url.search);
                const startApp = params.get('startapp');
                if (startApp) {
                    this.processRedirect(startApp);
                }
            }
        } catch (error) {
            console.error('Message handling error:', error);
        }
    }

    getStartAppParameter() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('startapp') || 
               this.webapp.initDataUnsafe?.start_param ||
               null;
    }

    async processRedirect(startApp) {
        try {
            this.updateStatus('Processing request...');
            
            // Get bot username from config
            const botUsername = CONFIG.DEFAULT_BOT;
            if (!botUsername) {
                throw new Error('Bot configuration missing');
            }

            // Create the redirect URL
            const tgLink = `tg://resolve?domain=${botUsername}&start=${startApp}`;
            
            // Update status
            this.updateStatus('Accessing files...');
            
            // Try to use Telegram's native methods first
            if (this.webapp.openTelegramLink) {
                await this.webapp.openTelegramLink(tgLink);
            } else {
                window.location.href = tgLink;
            }
            
            // Reset status after a delay
            setTimeout(() => {
                this.updateStatus('Ready for next file...');
                this.showActiveIndicator();
            }, 2000);

        } catch (error) {
            this.showError('Failed to access files. Please try again.');
            console.error('Redirect Error:', error);
        }
    }

    updateStatus(message) {
        if (this.statusElement) {
            this.statusElement.textContent = message;
        }
    }

    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.style.display = 'block';
        this.retryButton.style.display = 'inline-block';
        this.updateStatus('Error occurred');
    }

    hideError() {
        this.errorElement.style.display = 'none';
        this.retryButton.style.display = 'none';
    }

    showActiveIndicator() {
        this.infoElement.innerHTML = '<span class="active-indicator"></span> Mini App Active';
        this.infoElement.style.display = 'block';
    }
}

// Initialize the app when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    new FileAccessApp();
});
