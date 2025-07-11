export class AddSiteModal {
    constructor() {
        this.modal = document.getElementById('addSiteModalOverlay');
        this.form = document.getElementById('addSiteForm');
        this.closeButton = document.querySelector('.add-site-modal-close');
        this.cancelButton = document.querySelector('.add-site-cancel');
        this.submitButton = this.form.querySelector('.add-site-submit');
        
        // Create status message container
        this.statusContainer = document.createElement('div');
        this.statusContainer.className = 'form-status';
        this.form.insertBefore(this.statusContainer, this.form.querySelector('.form-actions'));
        
        this.bindEvents();
    }

    bindEvents() {
        // Close modal on X button click
        this.closeButton.addEventListener('click', () => this.hide());
        
        // Close modal on cancel button click
        this.cancelButton.addEventListener('click', () => this.hide());
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Handle form submission
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });
    }

    show() {
        this.modal.style.display = '';
        this.form.reset(); // Clear form
        this.clearStatus();
        this.enableForm();
    }

    hide() {
        this.modal.style.display = 'none';
        this.clearStatus();
        this.enableForm();
    }

    setStatus(message, isError = false) {
        this.statusContainer.textContent = message;
        this.statusContainer.className = `form-status ${isError ? 'error' : 'success'}`;
    }

    clearStatus() {
        this.statusContainer.textContent = '';
        this.statusContainer.className = 'form-status';
    }

    disableForm() {
        this.submitButton.disabled = true;
        this.submitButton.textContent = 'Adding site...';
        this.cancelButton.disabled = true;
    }

    enableForm() {
        this.submitButton.disabled = false;
        this.submitButton.textContent = 'Add Site';
        this.cancelButton.disabled = false;
    }

    async handleSubmit() {
        const siteName = document.getElementById('siteName').value.trim();
        const filePath = document.getElementById('filePath').value.trim();

        if (!siteName || !filePath) {
            this.setStatus('Please fill in all fields', true);
            return;
        }

        this.clearStatus();
        this.disableForm();

        try {
            const url = new URL('/db_load', window.location.origin);
            url.searchParams.append('file_path', filePath);
            url.searchParams.append('site_name', siteName);

            const response = await fetch(url, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            this.setStatus('Site added successfully!');
            
            // Dispatch an event to notify that a new site was added
            window.dispatchEvent(new CustomEvent('siteAdded', {
                detail: { siteName, filePath }
            }));

            // Hide the modal after a short delay to show the success message
            setTimeout(() => this.hide(), 1500);
        } catch (error) {
            console.error('Error adding site:', error);
            this.setStatus('Failed to add site. Please try again.', true);
            this.enableForm();
        }
    }
}