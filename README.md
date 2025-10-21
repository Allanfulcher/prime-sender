# Prime Sender

## Installation

1. Clone the repository:
    ```bash
    git clonegit@github.com:alphaextensions/send-extension.git
    ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by clicking the toggle switch in the top right corner.
4. Click "Load unpacked" and select the cloned repository folder.

## Code Structure

### 📦 js/

- **background.js**: Handles background processes and events for the extension.
- **content.js**: Manages the interaction between the extension and the web page content.
- **messenger.js**: Manages core feature of extension and message sending related code
- **popup.js**: Handles the logic for the extension's popup UI.
- **inject.js**: Implements the logic and functions from the WhatsApp API library, injecting them into the WhatsApp Web page.

- **data.js**: Contains constant or static data used by `content.js` and `popup.js`. This data is also updated by the config data API.
- **driver.js**: Contains how to use features tour code.
- **ga-code.js**: Tracks user activity on Google Analytics.

#### 📂 js/library

- **[xlsx.full.min.js](https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js)**: A library for reading and writing spreadsheet files.
- **[intlTelInput.min.js](https://cdnjs.com/libraries/intl-tel-input)**: A library for handling international telephone inputs.
- **[intlTelInput.utils.js](https://cdnjs.com/libraries/intl-tel-input)**: Utility functions for the international telephone input library.
- **[jquery.js](https://cdnjs.com/libraries/jquery)**: A fast, small, and feature-rich JavaScript library.
- **[libphonenumber.min.js](https://cdnjs.com/libraries/libphonenumber-js)**: Google's library for parsing, formatting, and validating international phone numbers.
- **[driver.iife.js](https://cdnjs.com/libraries/driver.js)**: A light-weight, no-dependency, vanilla JavaScript library to drive the user's focus across the page.
- **[papaparse.min.js](https://cdnjs.com/libraries/PapaParse)**: Fast and powerful CSV parser for the browser, Converts CSV to JSON and JSON to CSV.

> Note: The libraries in this folder should be updated to their latest versions when available. 

## Build Process (Using `build.sh`)

To build the extension for both local (normal) and production (obfuscated) environments, follow the steps below:

### Prerequisites

Ensure the following commands/tools are installed:

- `grep`: Used for extracting the version from `manifest.json`.
- `zip`: For creating the ZIP packages.
- `javascript-obfuscator`: For obfuscating JavaScript files in the production build. Install it using:
  
```bash
npm install -g javascript-obfuscator
```
 
### Building the Extension

Run the `build.sh` script to generate both normal and obfuscated builds:

```bash
./build.sh
```

### What the Script Does?

1. **Checks for required commands**: Ensures that `grep`, `zip`, and `javascript-obfuscator` are installed.
2. **Extracts version**: Fetches the extension version from the `manifest.json` file. If unavailable, it uses the provided `{DEFAULT_VERSION}`.
3. **Normal build**:
   - Creates a normal build by copying all files and zipping them into a file named `Prime-Sender-v{VERSION}-Normal.zip`.
4. **Production (obfuscated) build**:
   - Copies all files, excluding those defined in `{PROD_IGNORED_FILES}`.
   - Obfuscates the specified JavaScript files listed in `P{ROD_OBFUSCATED_JS_FILES}`.
   - Creates a production build with obfuscated code and zips it into a file named `Prime-Sender-v{VERSION}-Obfuscated.zip`.

> Note: Both ZIP files will be saved in the parent directory.

## Links

- [Prime Sender - Official Website](https://prime-sender.com/)  
- [Prime Sender -  Chrome Web Store](https://chromewebstore.google.com/detail/prime-sender-whatsapp-mes/klfaghfflijdgoljefdlofkoinndmpia)
