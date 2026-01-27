window.STRINGS_EN = {
    BOOTING_UP: "Initializing...",
    INSTALLING_GAME: "Downloading game package...",
    EXTRACTING_PACKAGE: "Extracting resources...",
    APPLYING_PATCHES: "Applying patches...",
    REPACKING_GAME: "Packaging app...",
    DOWNLOADING_PEPPER_FLASH: "Installing dependencies...",
    EXTRACTING_PEPPER_FLASH: "Extracting dependencies...",
    PATCHING_PEPPER_FLASH: "Applying patches...",
    CLEANING_UP: "Cleaning up..."
};

const STRINGS = window[`strings_${navigator.language[0]+navigator.language[1]}`.toUpperCase()] || STRINGS_EN;

const getCurrentProgress = async () => {
    try {
        const result = await (await fetch('http://127.0.0.1:41470/')).text();
        document.getElementById('status').innerText = STRINGS[result] || STRINGS_EN[result] || result;
    } catch (error) {
        console.log('You are on your own, goodbye!');
    }
    setTimeout(getCurrentProgress, 1000);
};

getCurrentProgress();