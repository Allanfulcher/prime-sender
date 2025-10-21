#!/bin/bash

# Run ./build.sh to make Normal and Production build
# ./build.sh normal for normal build (optional, by default normal build will be made)
# ./build.sh prod for production build

# Check for input parameters and assign them to variables
EXTENSION_NAME="Prime-Sender"
EXTENSION_SUB_NAME="send-extension"
DEFAULT_VERSION="1.0.0"
BUILD_TYPE=${1:-"normal"}
COUNTRY_CODE=${2:-"IN"} 

if [[ "$BUILD_TYPE" != "normal" && "$BUILD_TYPE" != "prod" && "$BUILD_TYPE" != "production" ]]; then
    echo -e "\e[31mInvalid build type: $BUILD_TYPE. Use 'normal' or 'prod/production'.\e[0m"
    exit 1
fi

# Production Build Config
PROD_OBFUSCATED_JS_FILES=("translate.js" "messenger.js" "popup.js" "content.js" "inject.js")
IGNORED_FILES=(".git" "build.sh")

# Function to check if a command exists
ALL_COMMANDS_EXISTS=true
command_exists() {
    command -v "$1" &> /dev/null
}

# Ensure the required commands are available
if ! command_exists grep; then
    echo -e "\e[31mError: grep command not found. Please install grep.\e[0m"
    ALL_COMMANDS_EXISTS=false
fi

if ! command_exists zip; then
    echo -e "\e[31mError: zip command not found. Please install zip.\e[0m"
    ALL_COMMANDS_EXISTS=false
fi

if ! $ALL_COMMANDS_EXISTS; then
    echo -e "\e[31mInstall required commands first. Exiting...\e[0m"
    exit 1
fi

echo "--- ${EXTENSION_NAME} build process started ---"

# Extract version from manifest.json
VERSION=$(grep -oP '(?<="version": ")[^"]*' manifest.json)

if [ -z "$VERSION" ]; then
    echo "Failed to extract version from manifest.json. Using default version"
    VERSION=$DEFAULT_VERSION
fi

echo "Build version: $VERSION"
TIMESTAMP=$(date '+%Y%m%d%H%M%S')

# Update default_country_code in manifest
update_default_country() {
    local JS_FILE="$1"
    if [ -f "$JS_FILE" ]; then
        sed -i "s/const default_country_code = \"IN\";/const default_country_code = \"$COUNTRY_CODE\";/g" $JS_FILE
        echo "  Updated default_country_code: $COUNTRY_CODE"
    else
        echo -e "\e[31mError: JS File not found!\e[0m"
        exit 1
    fi
}

# Function to create a normal build
create_normal_build() {
    local BROWSER=$1
    local BUILD_NAME="${EXTENSION_NAME}-v${VERSION}-Normal"
    local BUILD_ROOT_DIR="../${BUILD_NAME}-${TIMESTAMP}"
    local BUILD_DIR="${BUILD_ROOT_DIR}/${EXTENSION_SUB_NAME}"

    [[ "$BROWSER" != "chrome" ]] && BUILD_NAME+="-${BROWSER}"
    [[ "$COUNTRY_CODE" != "IN" ]] && BUILD_NAME+="-${COUNTRY_CODE}"

    echo -e "\e[32mProcess Started :: Normal build for $BROWSER :: ${BUILD_NAME}\e[0m"

    mkdir -p "$BUILD_DIR"
    cp -r . "$BUILD_DIR"

    if [[ "$COUNTRY_CODE" != "IN" ]]; then
        update_default_country "$BUILD_DIR/js/background.js"
    fi

    if [[ "$BROWSER" == "edge" ]]; then
        local MANIFEST_FILE="$BUILD_DIR/manifest.json"
        if [ -f "$MANIFEST_FILE" ]; then
            sed -i '/"update_url":/d' "$MANIFEST_FILE"
            echo "  Removed update_url from manifest.json for Edge build."
        fi
    fi

    # Exclude files from the obfuscated build directory
    for ITEM in "${IGNORED_FILES[@]}"; do
        rm -rf "$BUILD_DIR/$ITEM"
        echo "  Removed ${ITEM} in Normal Build"
    done

    (cd "$BUILD_ROOT_DIR" && zip -rq "../${BUILD_NAME}.zip" "$EXTENSION_SUB_NAME")
    rm -rf "$BUILD_ROOT_DIR"

    echo -e "\e[32mProcess Completed :: Normal build for $BROWSER :: ${BUILD_NAME}\e[0m"
}

# Function to create a normal build
create_prod_build() {
    if ! command_exists javascript-obfuscator; then
        echo -e "\e[31mError: javascript-obfuscator command not found. Please install javascript-obfuscator.\e[0m"
        exit 1
    fi

    local BROWSER=$1
    local BUILD_NAME="${EXTENSION_NAME}-v${VERSION}-Prod"
    local BUILD_ROOT_DIR="../${BUILD_NAME}-${TIMESTAMP}"
    local BUILD_DIR="${BUILD_ROOT_DIR}/${EXTENSION_SUB_NAME}"

    [[ "$BROWSER" != "Chrome" ]] && BUILD_NAME+="-${BROWSER}"

    echo -e "\e[32mProcess Started :: Prod build for $BROWSER :: ${BUILD_NAME}\e[0m"

    mkdir -p "$BUILD_DIR"
    cp -r . "$BUILD_DIR"

    if [[ "$BROWSER" == "edge" ]]; then
        local MANIFEST_FILE="$BUILD_DIR/manifest.json"
        if [ -f "$MANIFEST_FILE" ]; then
            sed -i '/"update_url":/d' "$MANIFEST_FILE"
            echo "  Removed update_url from manifest.json for Edge build."
        fi
    fi

    # Exclude files from the obfuscated build directory
    for ITEM in "${IGNORED_FILES[@]}"; do
        rm -rf "$BUILD_DIR/$ITEM"
        echo "  Removed ${ITEM} in Production Build"
    done

    # Obfuscate JavaScript files
    for FILE in "${PROD_OBFUSCATED_JS_FILES[@]}"; do
        FILE_PATH="$BUILD_DIR/js/$FILE"
        if [ -f "$FILE_PATH" ]; then
            PREFIX="ps_$(basename "$FILE" .js)_"
            javascript-obfuscator "$FILE_PATH" -o "$FILE_PATH" --seed 7 --compact true --simplify true --transform-object-keys true --control-flow-flattening true --control-flow-flattening-threshold 0.5 --identifier-names-generator mangled-shuffled --identifiers-prefix "${PREFIX}" --dead-code-injection false --self-defending false --string-array false
        else
            echo "  Warning: $FILE not found!"
        fi
    done

    (cd "$BUILD_ROOT_DIR" && zip -rq "../${BUILD_NAME}.zip" "$EXTENSION_SUB_NAME")
    rm -rf "$BUILD_ROOT_DIR"

    echo -e "\e[32mProcess Completed :: Prod build for $BROWSER :: ${BUILD_NAME}\e[0m"
}

# Execute appropriate build process
if [[ "$BUILD_TYPE" == "normal" ]]; then
    create_normal_build "chrome"
    # create_normal_build "edge"
elif [[ "$BUILD_TYPE" == "prod" || "$BUILD_TYPE" == "production" ]]; then
    create_prod_build "chrome"
    # create_prod_build "edge"
fi

echo "--- ${EXTENSION_NAME} build process completed ---"