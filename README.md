# Pixeldrain Download Limit Bypass

[![Install with Tampermonkey](https://img.shields.io/badge/Install%20with-Tampermonkey-00485B.svg)](https://github.com/suddelty/pixeldrain-bypass-userscript/raw/refs/heads/main/bypass_script.user.js)

A userscript that enhances Pixeldrain with bypass download functionality and download manager support to improve your downloading experience.

## Features

- **Download Bypass Button**: Download files using bypass links that circumvent Pixeldrain's download limits
- **Show Bypass Links Button**: View all bypass URLs with copy and save options
- **Download Manager Support**: Works seamlessly with external download managers (IDM, JDownloader, etc.) for bulk downloads

## Important Notes

- The bypass service limits download speeds to approximately 1mbps to prevent abuse and maintain service stability.
- Some file types (videos, images, PDFs) may open in your browser instead of downloading.
  - Right-click the bypass link and select "Save link as..."
- If using a VPN and the script doesn't work, try temporarily disabling it or switching servers.

## Installation

1. Install a userscript manager (like Tampermonkey) for your browser
2. Click [here](https://github.com/suddelty/pixeldrain-bypass-userscript/raw/refs/heads/main/bypass_script.user.js) to install the script

After installation, you'll see two new buttons in the left sidebar on Pixeldrain pages:

- **"Download Bypass"** - Direct download using bypass links
- **"Show Bypass Links"** - View bypass URLs in a popup


## Using with Download Managers

### Step-by-Step Instructions:

1. **Navigate to a Pixeldrain file or gallery page**
2. **Click "Show Bypass Links"** - This opens a popup with all bypass URLs
3. **Click "🔗 Copy URLs"** - This copies all URLs to your clipboard
4. **Open your download manager** (IDM, JDownloader, etc.)
5. **Paste the URLs** - Most download managers will automatically detect multiple URLs and add them to the download queue
6. **Start downloading** - Your download manager will handle the downloads

### Popular Download Managers:

- **Internet Download Manager (IDM)**: Paste URLs directly into the "Add URL" dialog
- **JDownloader**: Paste URLs into the LinkGrabber tab
- **Free Download Manager**: Use the "Add URL" feature

### Alternative Method (Save as Text File):

1. Click "Show Bypass Links"
2. Click "📄 Save as Text File" - Downloads a .txt file with all URLs
3. Import the text file into your download manager

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- Original script written by [MegaLime0](https://github.com/MegaLime0), [honey](https://github.com/hhoneeyy), and [Nurarihyon](https://greasyfork.org/en/users/723993-nurarihyonmaou)
- [Pixeldrain Bypass](https://pixeldrain-bypass.cybar.xyz/) provided by GameDrive