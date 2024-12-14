class FileAccessApp {
    constructor() {
        this.webapp = window.Telegram.WebApp;
        this.statusElement = document.getElementById('status');
        this.errorElement = document.getElementById('error');
        this.retryButton = document.getElementById('retryButton');
        this.infoElement = document.getElementById('info');
        this.init();
    }

    init() {
        try {
            // Initialize Telegram WebApp
            this.webapp.ready();
            
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

    getStartAppParameter() {
        const urlParams = new URLSearchParams(window.location.search);
        const startApp = urlParams.get('startapp');
        console.log('Start parameter:', startApp); // Debug log
        return startApp;
    }

    processRedirect(startApp) {
        try {
            this.updateStatus('Processing request...');
            
            // Create both types of links
            const tgLink = `tg://resolve?domain=${CONFIG.DEFAULT_BOT}&start=${startApp}`;
            const httpLink = `https://t.me/${CONFIG.DEFAULT_BOT}?start=${startApp}`;
            
            // Try multiple redirection methods
            this.updateStatus('Accessing files...');
            
            // Method 1: Direct location change
            window.location.href = tgLink;
            
            // Method 2: Fallback after a short delay
            setTimeout(() => {
                window.location.href = httpLink;
            }, 1000);

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
        if (this.errorElement) {
            this.errorElement.textContent = message;
            this.errorElement.style.display = 'block';
        }
        if (this.retryButton) {
            this.retryButton.style.display = 'inline-block';
        }
    }

    showActiveIndicator() {
        if (this.infoElement) {
            this.infoElement.innerHTML = '<span class="active-indicator"></span> Mini App Active';
            this.infoElement.style.display = 'block';
        }
    }
}

// Initialize the app when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    new FileAccessApp();
});
