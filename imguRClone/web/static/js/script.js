// static/js/script.js
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadForm = document.getElementById('upload-form');
    const uploadButton = document.querySelector('.upload-button');
    const toast = document.getElementById('toast');

    // Drag & drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length) {
            fileInput.files = files;
            updateFileLabel();
        }
    });

    // File input change handler
    fileInput.addEventListener('change', updateFileLabel);

    // Form submission
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const files = fileInput.files;

        if (files.length === 0) {
            showToast('Please select files first!', 'error');
            return;
        }

        uploadButton.disabled = true;
        uploadButton.querySelector('.button-text').textContent = 'Uploading...';
        uploadButton.querySelector('.loading-icon').style.display = 'inline-block';

        try {
            for (let file of files) {
                formData.append('files[]', file);
            }

            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showToast('Files uploaded successfully!', 'success');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Upload failed. Please try again.', 'error');
        } finally {
            uploadButton.disabled = false;
            uploadButton.querySelector('.button-text').textContent = 'Upload';
            uploadButton.querySelector('.loading-icon').style.display = 'none';
        }
    });

    function updateFileLabel() {
        const label = document.getElementById('file-label');
        const files = fileInput.files;
        
        if (files.length > 0) {
            label.textContent = `${files.length} file${files.length > 1 ? 's' : ''} selected`;
        } else {
            label.textContent = 'Browse Files';
        }
    }

    function showToast(message, type = 'info') {
        toast.textContent = message;
        toast.className = `toast visible ${type}`;
        setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    }
});