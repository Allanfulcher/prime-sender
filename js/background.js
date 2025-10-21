importScripts("data.js");
importScripts("ga-code.js");

let bookmark_url = 'https://chrome.google.com/webstore/detail/prime-sender-best-web-ext/klfaghfflijdgoljefdlofkoinndmpia';
let checkoutCache = null;

const countryToCurrency = { AD: 'EUR', AE: 'AED', AF: 'AFN', AG: 'XCD', AI: 'XCD', AL: 'ALL', AM: 'AMD', AN: 'ANG', AO: 'AOA', AQ: 'USD', AR: 'ARS', AS: 'USD', AT: 'EUR', AU: 'AUD', AW: 'AWG', AX: 'EUR', AZ: 'AZN', BA: 'BAM', BB: 'BBD', BD: 'BDT', BE: 'EUR', BF: 'XOF', BG: 'BGN', BH: 'BHD', BI: 'BIF', BJ: 'XOF', BL: 'EUR', BM: 'BMD', BN: 'BND', BO: 'BOB', BQ: 'USD', BR: 'BRL', BS: 'BSD', BT: 'BTN', BV: 'NOK', BW: 'BWP', BY: 'BYN', BZ: 'BZD', CA: 'CAD', CC: 'AUD', CD: 'CDF', CF: 'XAF', CG: 'XAF', CH: 'CHF', CI: 'XOF', CK: 'NZD', CL: 'CLP', CM: 'XAF', CN: 'CNY', CO: 'COP', CR: 'CRC', CU: 'CUP', CV: 'CVE', CW: 'ANG', CX: 'AUD', CY: 'EUR', CZ: 'CZK', DE: 'EUR', DJ: 'DJF', DK: 'DKK', DM: 'XCD', DO: 'DOP', DZ: 'DZD', EC: 'USD', EE: 'EUR', EG: 'EGP', EH: 'MAD', ER: 'ERN', ES: 'EUR', ET: 'ETB', FI: 'EUR', FJ: 'FJD', FK: 'FKP', FM: 'USD', FO: 'DKK', FR: 'EUR', GA: 'XAF', GB: 'GBP', GD: 'XCD', GE: 'GEL', GF: 'EUR', GG: 'GBP', GH: 'GHS', GI: 'GIP', GL: 'DKK', GM: 'GMD', GN: 'GNF', GP: 'EUR', GQ: 'XAF', GR: 'EUR', GS: 'FKP', GT: 'GTQ', GU: 'USD', GW: 'XOF', GY: 'GYD', HK: 'HKD', HM: 'AUD', HN: 'HNL', HR: 'EUR', HT: 'HTG', HU: 'HUF', ID: 'IDR', IE: 'EUR', IL: 'ILS', IM: 'GBP', IN: 'INR', IO: 'USD', IQ: 'IQD', IR: 'IRR', IS: 'ISK', IT: 'EUR', JE: 'GBP', JM: 'JMD', JO: 'JOD', JP: 'JPY', KE: 'KES', KG: 'KGS', KH: 'KHR', KI: 'AUD', KM: 'KMF', KN: 'XCD', KP: 'KPW', KR: 'KRW', KW: 'KWD', KY: 'KYD', KZ: 'KZT', LA: 'LAK', LB: 'LBP', LC: 'XCD', LI: 'CHF', LK: 'LKR', LR: 'LRD', LS: 'LSL', LT: 'EUR', LU: 'EUR', LV: 'EUR', LY: 'LYD', MA: 'MAD', MC: 'EUR', MD: 'MDL', ME: 'EUR', MF: 'EUR', MG: 'MGA', MH: 'USD', MK: 'MKD', ML: 'XOF', MM: 'MMK', MN: 'MNT', MO: 'MOP', MP: 'USD', MQ: 'EUR', MR: 'MRU', MS: 'XCD', MT: 'EUR', MU: 'MUR', MV: 'MVR', MW: 'MWK', MX: 'MXN', MY: 'MYR', MZ: 'MZN', NA: 'NAD', NC: 'XPF', NE: 'XOF', NF: 'AUD', NG: 'NGN', NI: 'NIO', NL: 'EUR', NO: 'NOK', NP: 'NPR', NR: 'AUD', NU: 'NZD', NZ: 'NZD', OM: 'OMR', PA: 'PAB', PE: 'PEN', PF: 'XPF', PG: 'PGK', PH: 'PHP', PK: 'PKR', PL: 'PLN', PM: 'EUR', PN: 'NZD', PR: 'USD', PS: 'ILS', PT: 'EUR', PW: 'USD', PY: 'PYG', QA: 'QAR', RE: 'EUR', RO: 'RON', RS: 'RSD', RU: 'RUB', RW: 'RWF', SA: 'SAR', SB: 'SBD', SC: 'SCR', SD: 'SDG', SE: 'SEK', SG: 'SGD', SH: 'SHP', SI: 'EUR', SJ: 'NOK', SK: 'EUR', SL: 'SLE', SM: 'EUR', SN: 'XOF', SO: 'SOS', SR: 'SRD', SS: 'SSP', ST: 'STN', SV: 'USD', SX: 'ANG', SY: 'SYP', SZ: 'SZL', TC: 'USD', TD: 'XAF', TF: 'EUR', TG: 'XOF', TH: 'THB', TJ: 'TJS', TK: 'NZD', TL: 'USD', TM: 'TMT', TN: 'TND', TO: 'TOP', TR: 'TRY', TT: 'TTD', TV: 'AUD', TW: 'TWD', TZ: 'TZS', UA: 'UAH', UG: 'UGX', UM: 'USD', US: 'USD', UY: 'UYU', UZ: 'UZS', VA: 'EUR', VC: 'XCD', VE: 'VES', VG: 'USD', VI: 'USD', VN: 'VND', VU: 'VUV', WF: 'XPF', WS: 'WST', YE: 'YER', YT: 'EUR', ZA: 'ZAR', ZM: 'ZMW', ZW: 'ZWL' }
const countryToDialCode = { AF: "+93", AL: "+355", DZ: "+213", AS: "+1684", AD: "+376", AO: "+244", AI: "+1264", AQ: "+672", AG: "+1268", AR: "+54", AM: "+374", AW: "+297", AU: "+61", AT: "+43", AZ: "+994", BS: "+1242", BH: "+973", BD: "+880", BB: "+1246", BY: "+375", BE: "+32", BZ: "+501", BJ: "+229", BM: "+1441", BT: "+975", BO: "+591", BA: "+387", BW: "+267", BR: "+55", IO: "+246", BN: "+673", BG: "+359", BF: "+226", BI: "+257", KH: "+855", CM: "+237", CA: "+1", CV: "+238", KY: "+345", CF: "+236", TD: "+235", CL: "+56", CN: "+86", CX: "+61", CC: "+61", CO: "+57", KM: "+269", CG: "+242", CD: "+243", CK: "+682", CR: "+506", CI: "+225", HR: "+385", CU: "+53", CY: "+357", CZ: "+420", CW: "+599", IC: "+34", DK: "+45", DJ: "+253", DM: "+1767", DO: "+1809", EC: "+593", EG: "+20", SV: "+503", GQ: "+240", ER: "+291", EE: "+372", ET: "+251", FK: "+500", FO: "+298", FJ: "+679", FI: "+358", FR: "+33", GF: "+594", PF: "+689", TF: "+262", GA: "+241", GM: "+220", GE: "+995", DE: "+49", GH: "+233", GI: "+350", GR: "+30", GL: "+299", GD: "+1473", GP: "+590", GU: "+1671", GT: "+502", GG: "+44", GN: "+224", GW: "+245", GY: "+592", HT: "+509", HM: "+672", VA: "+379", HN: "+504", HK: "+852", HU: "+36", IS: "+354", IN: "+91", ID: "+62", IR: "+98", IQ: "+964", IE: "+353", IM: "+44", IL: "+972", IT: "+39", JM: "+1658", JP: "+81", JE: "+44", JO: "+962", KZ: "+77", KE: "+254", KI: "+686", KP: "+850", KR: "+82", KW: "+965", KG: "+996", XK: "+383", LA: "+856", LV: "+371", LB: "+961", LS: "+266", LR: "+231", LY: "+218", LI: "+423", LT: "+370", LU: "+352", MO: "+853", MK: "+389", MG: "+261", MW: "+265", MY: "+60", MV: "+960", ML: "+223", MT: "+356", MH: "+692", MQ: "+596", MR: "+222", MU: "+230", YT: "+262", MX: "+52", FM: "+691", MD: "+373", MC: "+377", MN: "+976", ME: "+382", MS: "+1664", MA: "+212", MZ: "+258", MM: "+95", NA: "+264", NR: "+674", NP: "+977", NL: "+31", BQ: "+599", NC: "+687", NZ: "+64", NI: "+505", NE: "+227", NG: "+234", NU: "+683", NF: "+672", MP: "+1670", NO: "+47", OM: "+968", PK: "+92", PW: "+680", PS: "+970", PA: "+507", PG: "+675", PY: "+595", PE: "+51", PH: "+63", PN: "+872", PL: "+48", PT: "+351", PR: "+1787", QA: "+974", RO: "+40", RU: "+7", RW: "+250", RE: "+262", BL: "+590", SH: "+290", KN: "+1869", LC: "+1758", MF: "+590", PM: "+508", VC: "+1784", WS: "+685", SM: "+378", ST: "+239", SA: "+966", SN: "+221", RS: "+381", SC: "+248", SL: "+232", SG: "+65", SK: "+421", SI: "+386", SB: "+677", SO: "+252", ZA: "+27", GS: "+500", ES: "+34", LK: "+94", SD: "+249", SS: "+211", SR: "+597", SJ: "+47", SZ: "+268", SE: "+46", CH: "+41", SY: "+963", SX: "+721", TW: "+886", TJ: "+992", TZ: "+255", TH: "+66", TL: "+670", TG: "+228", TK: "+690", TO: "+676", TT: "+1868", TN: "+216", TR: "+90", TM: "+993", TC: "+1649", TV: "+688", UG: "+256", UA: "+380", AE: "+971", GB: "+44", US: "+1", UY: "+598", UZ: "+998", VU: "+678", VE: "+58", VN: "+84", VG: "+1284", VI: "+1340", WF: "+681", EH: "+212", YE: "+967", ZM: "+260", ZW: "+263", AX: "+358" }
const countryWithSpecificPricing = { "IN": 'india', "ID": 'indonesia', "AE": 'uae', "EG": 'egypt', "GB": 'uk', "SA": 'saudi_arabia', "KW": 'kuwait', "SG": 'singapore', "IL": 'israel' };

chrome.runtime.onInstalled.addListener((async function(e) {
    send_notification("Prime Sender is installed", '');
    fetchCountryInfo();
    loadConfigData();

    chrome.storage.local.set({
        tips_count: 0,
        first_visit_attachment: true,
        daysSinceInstallation: 1,
        installDate: new Date().toDateString(),
        isTooltipClosed: false,
        lastTooltipOpenDate: null,
        first_attachment_click_count: 0,
        added_trial_days:false,
        isCaptionUsed:false,
        countOfExportUsed: 0,
        lastDayExportUsed: null
    });

    // Check if there is an open WhatsApp Web tab
    chrome.tabs.query({ url: "*://web.whatsapp.com/*" }, function (tabs) {
        if (tabs.length > 0) {
            // If WhatsApp Web is already open, activate that tab and reload it
            chrome.tabs.update(tabs[0].id, { active: true }, function () {
                chrome.tabs.reload(tabs[0].id);
            });
        } else {
            // Else open a new WhatsApp Web tab
            chrome.tabs.create({ url: "https://web.whatsapp.com/" });
        }
    });

    // Add bookmark
    chrome.bookmarks.search({ url: bookmark_url }, function (bookmarks) {
        if (bookmarks.length === 0) {
            chrome.bookmarks.create({
                parentId: '1',
                title: 'Prime Sender',
                url: bookmark_url,
            });
        }
    });
    chrome.storage.local.get(['my_number'],(res)=>{
        if(!res.my_number){
            console.log(res)
            GoogleAnalytics.trackEvent('extension_install');
        }
    })
}));

chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

function messageListner() {
    chrome.runtime.onMessage.addListener(listner);
}

function listner(request, sender, sendResponse){
    if(request.type === 'send_notification')
        send_notification(request.title, request.message);
    if(request.type === 'ga') {
        _gaq.push(['_trackEvent', request.event+"v3", request.track, request.label]);
    }
    if(request.type==='set_uninstall_url'){
        setUninstallURL(request.uninstall_url, { 
            trialDays: request.trial_days, 
            number: request.number 
        });
    }
    if (request.type === "checkoutData") {
        checkoutCache = request.payload;
        console.log("Stored checkout data in background:", checkoutCache);
    }

    if (request.type === "getCheckoutData") {
        sendResponse(checkoutCache);
    }
}

function send_notification(title, message = '') {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: '../logo/logo-img.png',
        title: title,
        message: message
    });
}

function sendMessageToContent(message) {
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, message);
        });
    } catch (e) { }
}

function bcdinit() {
    messageListner();
    chrome.identity.getProfileUserInfo(function(userinfo){
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            sendResponse( {email: userinfo.email})
        });
    });
}

bcdinit();

const default_country_code = "IN";

async function fetchCountryInfo() {
    // Test build 
    if (default_country_code !== "IN") {
        let default_country_name = Object.keys(countryWithSpecificPricing).includes(default_country_code) ? countryWithSpecificPricing[default_country_code] : 'international';
        let test_country_info = { 
            name: default_country_name, 
            name_code: default_country_code, 
            dial_code: countryToDialCode[default_country_code], 
            currency: countryToCurrency[default_country_code], 
            default: true 
        };
        chrome.storage.local.set({ country_info: test_country_info, location_info: test_country_info });
        return;
    }

    // Normal build
    let default_country_info = { name: 'India', name_code: 'IN', dial_code: '91', currency: 'INR', default: true };
    let default_location_info = { name: 'international', name_code: "US", currency: "USD", default: true };
    
    let current_country_info = await new Promise((resolve, reject) => {
        fetch('https://get.geojs.io/v1/ip/geo.json')
            .then((res) => res.json())
            .then((data) =>
                resolve({ 
                    name: data.country,
                    name_code: data.country_code,
                    dial_code: countryToDialCode[data.country_code],
                    currency: countryToCurrency[data.country_code],
                    city: data.city,
                    region: data.region,
                    country: data.country,
                    default: false
                })
            )
            .catch((error) => {
                GoogleAnalytics.trackEvent('get_location_api_error', error);
                resolve(null)
            });
    }); 

    // country_info: used in popup js for country code selector
    // location_info: used in content js for contry wise pricing 
    if(current_country_info === null) {
        chrome.storage.local.set({ country_info: default_country_info, location_info: default_location_info });
    } else {
        chrome.storage.local.set({ country_info: current_country_info, location_info: current_country_info });
    }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        let tabId = activeInfo.tabId;
        let tab = await chrome.tabs.get(tabId);

        if (tab.url && (
            tab.url.includes("buy.stripe.com") ||
            tab.url.includes("checkout.stripe.com")
        )) {
            chrome.storage.local.set({ visitedPrimeSender: true });
        }

        if (tab.url && tab.url.includes("web.whatsapp.com")) {
            chrome.storage.local.get("visitedPrimeSender", function (data) {
                if (data.visitedPrimeSender) {
                    chrome.tabs.reload(tabId);
                    chrome.storage.local.set({ visitedPrimeSender: false });
                }
            });
        }
    } catch (error) {
        console.error("Error getting tab info:", error);
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    try {
        if (tab.url && tab.url.includes("web.whatsapp.com")) {
            if (changeInfo.status === 'loading') {
                chrome.storage.session.remove('whatsapp_session', () => {
                    console.log('WhatsApp session cleared on tab reload.');
                });
            }
        }
    } catch (error) {
        console.error("Error getting tab info:", error);
    }
});


function hasAnHourPassed(lastTime) {
    const oneHour = 60 * 60 * 1000;
    return (getCurrentTime() - lastTime) >= oneHour;
}

function getCurrentTime() {
    return new Date().getTime();
}

// Show "show_update_reminder_popup" Popup on update available
chrome.runtime.onUpdateAvailable.addListener((details) => {
    console.log('Update available:', details.version);
    // sendMessageToContent({ type: 'show_update_reminder_popup' });
});

async function setUninstallURL(uninstallUrl, params = {}) {
    try {
        let client_id = await GoogleAnalytics.getOrCreateClientId();
        let urlParams = `?clientId=${client_id}`;
        if (params.trialDays)
            urlParams += `&trialDays=${params.trialDays}`;
        if (params.number)
            urlParams += `&number=${params.number}`;
        chrome.runtime.setUninstallURL(uninstallUrl + urlParams);
    } catch (error) {
        chrome.runtime.setUninstallURL(uninstallUrl);
    }
}

function loadConfigData() {
    chrome.storage.local.get(['CONFIG_DATA'], (res) => {
        let configData = res.CONFIG_DATA;
        if (configData) {
            if (configData.RUNTIME_CONFIG)
                RUNTIME_CONFIG = safeMergeObject(RUNTIME_CONFIG, configData.RUNTIME_CONFIG);
        }

        setUninstallURL(RUNTIME_CONFIG.uninstallUrl);
    })
}

function safeMergeObject(target = {}, source = {}) {
    Object.keys(source).forEach(key => {
        target[key] = source[key];
    });
    return target;
}