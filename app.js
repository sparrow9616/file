class FileAccessApp {
    constructor() {
        this.webapp = window.Telegram.WebApp;
        this.statusElement = document.getElementById('status');
        this.init();
    }

    init() {
        try {
            // Initialize Telegram WebApp
            this.webapp.ready();
            this.webapp.expand();

            // Get the startapp parameter
            const startApp = this.getStartAppParameter();
            if (!startApp) {
                this.showError('No file access code provided');
                return;
            }

            // Process the redirect
            this.processRedirect(startApp);
        } catch (error) {
            this.showError('Initialization failed');
            if (CONFIG.DEBUG) console.error('Init Error:', error);
        }
    }

    getStartAppParameter() {
        // Try to get parameter from different sources
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('startapp') || 
               this.webapp.initDataUnsafe?.start_param ||
               null;
    }

    async processRedirect(startApp) {
        try {
            this.updateStatus('Preparing file access...');
            
            // Get an available bot
            const botUsername = await this.getAvailableBot();
            if (!botUsername) {
                this.showError('No available bot found');
                return;
            }

            // Create the redirect URL
            const tgLink = `tg://resolve?domain=${botUsername}&start=${startApp}`;
            
            // Update status and redirect
            this.updateStatus('Redirecting to file...');
            
            // Add small delay for smooth transition
            setTimeout(() => {
                window.location.href = tgLink;
                
                // Fallback button in case automatic redirect fails
                this.createFallbackButton(tgLink);
            }, CONFIG.REDIRECT_DELAY);

        } catch (error) {
            this.showError('Redirect failed');
            if (CONFIG.DEBUG) console.error('Redirect Error:', error);
        }
    }

    async getAvailableBot() {
        // In a real implementation, you might want to check bot availability
        // For now, we'll just return the default bot
        return CONFIG.DEFAULT_BOT;
    }

    updateStatus(message) {
        if (this.statusElement) {
            this.statusElement.textContent = message;
        }
    }

    showError(message) {
        this.updateStatus('');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        document.getElementById('main').appendChild(errorDiv);
    }

    createFallbackButton(link) {
        const button = document.createElement('button');
        button.className = 'button';
        button.textContent = 'Click here if not redirected';
        button.onclick = () => window.location.href = link;
        
        // Show button after a delay if redirect hasn't worked
        setTimeout(() => {
            button.style.display = 'inline-block';
            document.getElementById('main').appendChild(button);
        }, 3000);
    }
}

// Initialize the app when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    new FileAccessApp();
});
