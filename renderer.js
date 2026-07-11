const captureBtn = document.getElementById('capture-btn');
const saveBtn = document.getElementById('save-btn');
const previewImg = document.getElementById('preview-img');
const closeBtn = document.getElementById('close-btn');

let currentScreenshot = null;

// Close App
closeBtn.addEventListener('click', () => {
    window.electronAPI.closeWindow();
});

// Take Screenshot
captureBtn.addEventListener('click', async () => {
    captureBtn.innerText = "Capturing...";
    
    // Ask main.js to take the screenshot
    const dataUrl = await window.electronAPI.captureScreen();
    
    // Show the screenshot on the screen
    previewImg.src = dataUrl;
    previewImg.style.display = 'block';
    
    // Show the save button
    saveBtn.style.display = 'inline-block';
    captureBtn.innerText = "Capture Again";
    
    currentScreenshot = dataUrl;
});

// Save Screenshot
saveBtn.addEventListener('click', async () => {
    if (currentScreenshot) {
        const success = await window.electronAPI.saveImage(currentScreenshot);
        if (success) {
            saveBtn.innerText = "Saved!";
            setTimeout(() => { saveBtn.innerText = "Save Image"; }, 2000);
        }
    }
});

// Trigger capture from keyboard shortcut
window.electronAPI.onTriggerCapture(() => {
    captureBtn.click();
});
