const axios = require('axios');
const { File } = require('megajs');
const fs = require('fs');
const path = require('path');

// Helper function to save JSON data to files
function saveJsonToFile(mergedJSON, outputFolderPath) {
    if (!fs.existsSync(outputFolderPath)) {
        fs.mkdirSync(outputFolderPath, { recursive: true });
    }
    for (const [fileName, fileContent] of Object.entries(mergedJSON)) {
        const outputPath = path.join(outputFolderPath, fileName);
        fs.writeFileSync(outputPath, JSON.stringify(fileContent, null, 2));
        console.log(`Saved ${fileName} to ${outputPath}`);
    }
}

// Helper function to download files from MEGA
async function downloadFromMega(url, outputPath) {
    try {
        const folderPath = path.dirname(outputPath);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const file = File.fromURL(url);
        await file.loadAttributes();
        const data = await file.downloadBuffer();
        fs.writeFileSync(outputPath, data);
        console.log(`Downloaded session file to ${outputPath}`);
    } catch (error) {
        console.error("Error downloading session file from MEGA:", error);
        throw error;
    }
}

// Main function to load a session
async function MakeSession(sessionId, folderPath = './session/') {
    try {
        // Decrypt the session ID
        const decryptedSessionId = sessionId.split("Rudhra~")[1].split('').reverse().join('');
        console.log("Decrypted Pastebin ID:", decryptedSessionId);

        // Attempt to load session from Pastebin
        const response = await axios.get(`https://pastebin.com/raw/${decryptedSessionId}`);
        saveJsonToFile(response.data, folderPath);
        console.log("Session ID loaded successfully from Paste");
        return true;
    } catch (error) {
        console.error("Invalid session id from Pastebin:", error.message);

        try {
            // Fallback to loading session from MEGA
            const url = "https://mega.nz/file/" + sessionId.replace("Rudhra~", "");
            const outputPath = path.join(folderPath, "creds.json");
            await downloadFromMega(url, outputPath);
            console.log("Session ID loaded successfully from Mega");
            return true;
        } catch (megaError) {
            console.error("Invalid session id from MEGA:", megaError.message);
            throw megaError;
        }
    }
}

// Export the MakeSession function
module.exports = { MakeSession };
