// ==UserScript==
// @name         Pixeldrain Download Bypass
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Bypass Pixeldrain Download Limit
// @author       MegaLime0, honey, Nurarihyon, suddelty
// @match        https://pixeldrain.com/*
// @match        https://cdn.pd8.workers.dev/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pixeldrain.com
// @grant        GM_openInTab
// @downloadURL https://github.com/suddelty/pixeldrain-bypass-userscript/raw/refs/heads/main/bypass_script.user.js
// @updateURL   https://github.com/suddelty/pixeldrain-bypass-userscript/raw/refs/heads/main/bypass_script.user.js
// ==/UserScript==

(function() {
    'use strict';

    const bypassUrl = "https://pd.cybar.xyz/";
    const idRegex = /\/api\/file\/(\w+)\//;
    
    let cachedLinks = {
        bypassUrlList: [],
        bypassUrlNames: [],
        lastCachedUrl: '',
        isGallery: false
    };

    function cacheLinksOnLoad() {
        const currentUrl = window.location.href;
        console.log('Caching links for URL:', currentUrl);
        
        const isGalleryWithItem = currentUrl.includes("https://pixeldrain.com/l/") && currentUrl.includes("#item=");
        
        if (currentUrl.includes("https://pixeldrain.com/u/") || isGalleryWithItem) {
            cachedLinks.isGallery = false;
            cachedLinks.lastCachedUrl = currentUrl;
            
            let id;
            if (isGalleryWithItem) {
                id = getFileIdFromGalleryItem();
            } else {
                id = extractFileIdFromUrl(currentUrl);
            }
            
            if (id) {
                cachedLinks.bypassUrlList = [bypassUrl + id];
                cachedLinks.bypassUrlNames = [getFileNameFromPage() || id];
                console.log('Cached single file:', cachedLinks);
            } else {
                console.log('Could not extract file ID from URL:', currentUrl);
            }
        } else if (currentUrl.includes("https://pixeldrain.com/l/")) {
            cachedLinks.isGallery = true;
            cachedLinks.lastCachedUrl = currentUrl;
            const result = getBypassUrls("gallery");
            if (result) {
                cachedLinks.bypassUrlList = result.bypassUrlList;
                cachedLinks.bypassUrlNames = result.bypassUrlNames;
                console.log('Cached gallery files:', cachedLinks.bypassUrlList.length, 'files');
            }
        }
    }

    function getFileIdFromGalleryItem() {
        const mainImage = document.querySelector('img[src*="/api/file/"]') || 
                         document.querySelector('[style*="background-image"][style*="/api/file/"]') ||
                         document.querySelector('video source[src*="/api/file/"]') ||
                         document.querySelector('[src*="/api/file/"]');
        
        if (mainImage) {
            const src = mainImage.src || mainImage.style.backgroundImage || '';
            const match = src.match(/\/api\/file\/(\w+)/);
            if (match) {
                console.log('Extracted file ID from main image:', match[1]);
                return match[1];
            }
        }
        
        const hash = window.location.hash;
        if (hash.includes('#item=')) {
            const itemIndex = parseInt(hash.replace('#item=', ''));
            const galleryFiles = document.querySelectorAll('a.file');
            
            if (galleryFiles[itemIndex]) {
                const fileLink = galleryFiles[itemIndex];
                const childDiv = fileLink.querySelector('div');
                if (childDiv) {
                    const backgroundUrl = childDiv.style.backgroundImage;
                    const match = backgroundUrl.match(idRegex);
                    if (match && match.length > 1) {
                        console.log('Extracted file ID from gallery item at index', itemIndex, ':', match[1]);
                        return match[1];
                    }
                }
            }
        }
        
        const visibleFile = document.querySelector('[class*="active"] [style*="/api/file/"]') ||
                           document.querySelector('[class*="selected"] [style*="/api/file/"]') ||
                           document.querySelector('.file [style*="/api/file/"]');
        
        if (visibleFile) {
            const style = visibleFile.style.backgroundImage || '';
            const match = style.match(idRegex);
            if (match && match.length > 1) {
                console.log('Extracted file ID from visible file element:', match[1]);
                return match[1];
            }
        }
        
        console.log('Could not extract file ID from gallery item');
        return null;
    }

    function extractFileIdFromUrl(url) {
        const uMatch = url.match(/\/u\/([a-zA-Z0-9_-]+)/);
        if (uMatch) {
            return uMatch[1];
        }
        
        const generalMatch = url.match(/pixeldrain\.com\/[^\/]*\/([a-zA-Z0-9_-]+)/);
        if (generalMatch) {
            return generalMatch[1];
        }
        
        return null;
    }

    function getFileNameFromPage() {
        const title = document.title;
        if (title && title !== 'Pixeldrain') {
            return title.replace(' - Pixeldrain', '');
        }
        
        const mainHeading = document.querySelector('h1') || document.querySelector('.title') || document.querySelector('[class*="title"]');
        if (mainHeading && mainHeading.textContent.trim()) {
            return mainHeading.textContent.trim();
        }
        
        const breadcrumb = document.querySelector('.breadcrumb span:last-child');
        if (breadcrumb) {
            return breadcrumb.textContent.trim();
        }
        
        const metaTitle = document.querySelector('meta[property="og:title"]');
        if (metaTitle) {
            return metaTitle.getAttribute('content').replace(' - Pixeldrain', '');
        }
        
        return null;
    }

    function getBypassUrls(urlType) {
        const currentUrl = window.location.href;

        if (urlType == "file") {
            const isGalleryWithItem = currentUrl.includes("https://pixeldrain.com/l/") && currentUrl.includes("#item=");
            
            let id;
            if (isGalleryWithItem) {
                id = getFileIdFromGalleryItem();
            } else {
                id = extractFileIdFromUrl(currentUrl);
            }
            
            if (id) {
                const alteredUrl = bypassUrl + id;
                console.log('Generated bypass URL for file:', alteredUrl);
                return alteredUrl;
            }
            return null;
        }

        if (urlType == "gallery") {
            const links = document.querySelectorAll('a.file');
            const bypassUrlList = [];
            const bypassUrlNames = [];

            links.forEach((link) => {
                const childDiv = link.querySelector('div');
                if (!childDiv) return;
                
                const backgroundUrl = childDiv.style.backgroundImage;
                const match = backgroundUrl.match(idRegex);

                if (match && match.length > 1) {
                    const alteredUrl = bypassUrl + match[1];
                    bypassUrlList.push(alteredUrl);
                    
                    let fileName = link.textContent.trim();
                    if (!fileName) {
                        fileName = match[1];
                    }
                    bypassUrlNames.push(fileName);
                }
            });

            console.log('Generated bypass URLs for gallery:', bypassUrlList.length, 'files');
            return {bypassUrlList, bypassUrlNames};
        }
    }

    function updateCachedLinks() {
        if (cachedLinks.isGallery) {
            const result = getBypassUrls("gallery");
            if (result) {
                cachedLinks.bypassUrlList = result.bypassUrlList;
                cachedLinks.bypassUrlNames = result.bypassUrlNames;
            }
        }
    }

    function insertButtons() {
        const existingDownloadBtn = document.getElementById('bypass-download-btn');
        const existingLinksBtn = document.getElementById('bypass-links-btn');
        if (existingDownloadBtn) existingDownloadBtn.remove();
        if (existingLinksBtn) existingLinksBtn.remove();

        const button = document.createElement("button");
        button.id = 'bypass-download-btn';
        const downloadIcon = document.createElement("a");
        downloadIcon.className = "icon";
        downloadIcon.textContent = "download";
        downloadIcon.style.color = "#d7dde8";
        const downloadButtonText = document.createElement("span");
        downloadButtonText.textContent = "Download Bypass";
        button.appendChild(downloadIcon);
        button.appendChild(downloadButtonText);

        const linksButton = document.createElement("button");
        linksButton.id = 'bypass-links-btn';
        const linksIcon = document.createElement("i");
        linksIcon.className = "icon";
        linksIcon.textContent = "link";
        const linksButtonText = document.createElement("span");
        linksButtonText.textContent = "Show Bypass Links";
        linksButton.appendChild(linksIcon);
        linksButton.appendChild(linksButtonText);

        button.addEventListener('click', handleButtonClick);
        linksButton.addEventListener('click', handleLinksButtonClick);

        let buttonsInserted = false;

        const labels = document.querySelectorAll('div.label');
        labels.forEach(label => {
            if (label.textContent.trim() === 'Size' && !buttonsInserted) {
                const nextElement = label.nextElementSibling;
                if (nextElement) {
                    nextElement.insertAdjacentElement('afterend', linksButton);
                    nextElement.insertAdjacentElement('afterend', button);
                    buttonsInserted = true;
                }
            }
        });

        if (!buttonsInserted) {
            const sidebar = document.querySelector('nav.sidebar') || 
                           document.querySelector('.sidebar') || 
                           document.querySelector('aside') ||
                           document.querySelector('nav');
            
            if (sidebar) {
                const buttonContainer = document.createElement('div');
                buttonContainer.style.padding = '10px';
                buttonContainer.style.borderTop = '1px solid #555';
                buttonContainer.appendChild(button);
                buttonContainer.appendChild(linksButton);
                sidebar.appendChild(buttonContainer);
                buttonsInserted = true;
            }
        }

        if (!buttonsInserted) {
            const buttonContainer = document.createElement('div');
            buttonContainer.style.position = 'fixed';
            buttonContainer.style.top = '10px';
            buttonContainer.style.right = '10px';
            buttonContainer.style.zIndex = '1000';
            buttonContainer.style.backgroundColor = '#2f3541';
            buttonContainer.style.padding = '10px';
            buttonContainer.style.borderRadius = '5px';
            buttonContainer.style.border = '1px solid #555';
            buttonContainer.appendChild(button);
            buttonContainer.appendChild(linksButton);
            document.body.appendChild(buttonContainer);
            buttonsInserted = true;
        }

        console.log('Bypass buttons inserted:', buttonsInserted);
        return buttonsInserted;
    }

    function addGalleryEventListeners() {
        const galleryFiles = document.querySelectorAll('a.file');
        galleryFiles.forEach(fileLink => {
            fileLink.removeEventListener('click', handleGalleryFileClick);
            fileLink.addEventListener('click', handleGalleryFileClick);
        });

        const galleryButton = document.querySelector('a[href*="/l/"]');
        if (galleryButton) {
            galleryButton.removeEventListener('click', handleGalleryButtonClick);
            galleryButton.addEventListener('click', handleGalleryButtonClick);
        }

        const thumbnails = document.querySelectorAll('a[href*="/u/"]');
        thumbnails.forEach(thumb => {
            thumb.removeEventListener('click', handleGalleryFileClick);
            thumb.addEventListener('click', handleGalleryFileClick);
        });

        window.removeEventListener('popstate', handlePopStateChange);
        window.addEventListener('popstate', handlePopStateChange);
    }

    function handleGalleryFileClick(event) {
        console.log('Gallery file clicked');
        setTimeout(() => {
            insertButtons();
            cacheLinksOnLoad();
            updateButtonsForCurrentPage();
        }, 300);
    }

    function handleGalleryButtonClick(event) {
        console.log('Gallery button clicked');
        setTimeout(() => {
            insertButtons();
            cacheLinksOnLoad();
            updateButtonsForCurrentPage();
        }, 300);
    }

    function handlePopStateChange(event) {
        console.log('Page navigation detected');
        setTimeout(() => {
            insertButtons();
            cacheLinksOnLoad();
            updateButtonsForCurrentPage();
        }, 300);
    }

    function handleButtonClick() {
        const currentUrl = window.location.href;
        console.log('Download button clicked for URL:', currentUrl);

        const isGalleryWithItem = currentUrl.includes("https://pixeldrain.com/l/") && currentUrl.includes("#item=");

        if (currentUrl.includes("https://pixeldrain.com/u/") || isGalleryWithItem) {
            let alteredUrl;
            if (cachedLinks.lastCachedUrl === currentUrl && cachedLinks.bypassUrlList.length > 0) {
                alteredUrl = cachedLinks.bypassUrlList[0];
            } else {
                alteredUrl = getBypassUrls("file");
            }
            
            if (alteredUrl) {
                console.log('Starting download for:', alteredUrl);
                startDownload(alteredUrl);
            } else {
                console.error('Could not generate bypass URL for single file');
            }
        }

        if (currentUrl.includes("https://pixeldrain.com/l/") && !isGalleryWithItem) {
            let links;
            if (cachedLinks.lastCachedUrl === currentUrl && cachedLinks.bypassUrlList.length > 0) {
                links = cachedLinks.bypassUrlList;
            } else {
                const result = getBypassUrls("gallery");
                links = result ? result.bypassUrlList : [];
            }

            console.log('Starting downloads for', links.length, 'files');
            links.forEach((link) => {
                startDownload(link);
            });
        }
    }

    function startDownload(link) {
          const a = document.createElement("a");
          a.href = link;
          a.click();
    }

    function handleLinksButtonClick() {
        const popupBox = document.getElementById('popupBox');
        const popupClose = document.createElement('span');
        popupClose.innerHTML = '&times;';
        popupClose.style.position = 'absolute';
        popupClose.style.top = '1px';
        popupClose.style.right = '7px';
        popupClose.style.cursor = 'pointer';
        popupClose.onclick = function() {
            popupBox.style.display = 'none';
        };

        popupBox.innerHTML = '';
        popupBox.appendChild(popupClose);

        const currentUrl = window.location.href;
        console.log('Show links button clicked for URL:', currentUrl);
        
        const isGalleryWithItem = currentUrl.includes("https://pixeldrain.com/l/") && currentUrl.includes("#item=");
        
        let bypassLinks, bypassNames;
        
        if (cachedLinks.lastCachedUrl === currentUrl && cachedLinks.bypassUrlList.length > 0) {
            bypassLinks = cachedLinks.bypassUrlList;
            bypassNames = cachedLinks.bypassUrlNames;
            console.log('Using cached links:', bypassLinks.length, 'files');
        } else {
            console.log('Generating fresh links...');
            if (currentUrl.includes("https://pixeldrain.com/u/") || isGalleryWithItem) {
                const alteredUrl = getBypassUrls("file");
                if (alteredUrl) {
                    bypassLinks = [alteredUrl];
                    bypassNames = [getFileNameFromPage() || alteredUrl.split('/').pop()];
                } else {
                    bypassLinks = [];
                    bypassNames = [];
                }
            } else if (currentUrl.includes("https://pixeldrain.com/l/")) {
                const result = getBypassUrls("gallery");
                bypassLinks = result ? result.bypassUrlList : [];
                bypassNames = result ? result.bypassUrlNames : [];
            } else {
                bypassLinks = [];
                bypassNames = [];
            }
            console.log('Generated fresh links:', bypassLinks.length, 'files');
        }

        if (!bypassLinks || bypassLinks.length === 0) {
            const noLinksMessage = document.createElement("div");
            noLinksMessage.textContent = "No bypass links found. Make sure you're on a file or gallery page.";
            noLinksMessage.style.color = "#ff6b6b";
            noLinksMessage.style.textAlign = "center";
            noLinksMessage.style.padding = "20px";
            popupBox.appendChild(noLinksMessage);
            popupBox.style.display = 'block';
            return;
        }

        if (currentUrl.includes("https://pixeldrain.com/u/") || isGalleryWithItem) {
            const urlElement = document.createElement("div");
            urlElement.style.marginBottom = "10px";
            urlElement.style.padding = "10px";
            urlElement.style.border = "1px solid #555";
            urlElement.style.borderRadius = "5px";
            urlElement.style.backgroundColor = "#3a4149";
            
            const fileName = document.createElement("div");
            fileName.textContent = bypassNames[0] || "Unknown File";
            fileName.style.fontWeight = "bold";
            fileName.style.marginBottom = "5px";
            fileName.style.color = "#a4be8c";
            
            const urlLink = document.createElement("a");
            urlLink.href = bypassLinks[0];
            urlLink.textContent = bypassLinks[0];
            urlLink.style.color = "#88c0d0";
            urlLink.style.textDecoration = "none";
            urlLink.style.wordBreak = "break-all";
            
            urlElement.appendChild(fileName);
            urlElement.appendChild(urlLink);
            popupBox.appendChild(urlElement);
        }

        if (currentUrl.includes("https://pixeldrain.com/l/") && !isGalleryWithItem) {
            const linksContainer = document.createElement("div");
            linksContainer.style.maxHeight = "60vh";
            linksContainer.style.overflowY = "auto";
            linksContainer.style.overflowX = "hidden";
            linksContainer.style.paddingBottom = "10px";
            linksContainer.style.marginBottom = "10px";

            bypassLinks.forEach((link, index) => {
                const urlElement = document.createElement("div");
                urlElement.style.marginBottom = "10px";
                urlElement.style.padding = "10px";
                urlElement.style.border = "1px solid #555";
                urlElement.style.borderRadius = "5px";
                urlElement.style.backgroundColor = "#3a4149";
                urlElement.style.wordWrap = "break-word";
                urlElement.style.overflowWrap = "break-word";
                
                const fileName = document.createElement("div");
                fileName.textContent = bypassNames[index] || `File ${index + 1}`;
                fileName.style.fontWeight = "bold";
                fileName.style.marginBottom = "5px";
                fileName.style.color = "#a4be8c";
                
                const urlLink = document.createElement("a");
                urlLink.href = link;
                urlLink.textContent = link;
                urlLink.style.color = "#88c0d0";
                urlLink.style.textDecoration = "none";
                urlLink.style.wordBreak = "break-all";
                urlLink.style.overflowWrap = "break-word";
                
                urlElement.appendChild(fileName);
                urlElement.appendChild(urlLink);
                linksContainer.appendChild(urlElement);
            });

            popupBox.appendChild(linksContainer);

            popupBox.style.display = 'flex';
            popupBox.style.flexDirection = 'column';
            popupBox.style.alignItems = 'center';
            popupBox.style.justifyContent = 'center';

            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.justifyContent = 'center';
            buttonContainer.style.marginTop = '10px';

            const copyButton = document.createElement('button');
            copyButton.textContent = '🔗 Copy URLs';
            copyButton.style.marginRight = '5px';
            copyButton.addEventListener('click', function() {
                const urls = bypassLinks.join('\r\n');
                navigator.clipboard.writeText(urls).then(function() {
                    copyButton.textContent = "✔️ Copied";
                    setTimeout(function() {
                        copyButton.textContent = '🔗 Copy URLs';
                    }, 2500);
                }, function(err) {
                    console.error('Failed to copy URLs: ', err);
                });
            });
            buttonContainer.appendChild(copyButton);

            const saveButton = document.createElement('button');
            saveButton.textContent = '📄 Save as Text File';
            saveButton.style.marginLeft = '5px';
            saveButton.addEventListener('click', function() {
                const currentUrl = window.location.href;
                const fileIdMatch = currentUrl.match(/\/l\/([^/#?]+)/);
                if (fileIdMatch && fileIdMatch.length > 1) {
                    const fileId = fileIdMatch[1];
                    const fileName = fileId + '.txt';
                    let content = '';
                    bypassLinks.forEach((link, index) => {
                        content += `${bypassNames[index] || `File ${index + 1}`}: ${link}\r\n`;
                    });
                    const blob = new Blob([content.trim()], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                } else {
                    console.error('Failed to extract file identifier from URL.');
                }
            });
            buttonContainer.appendChild(saveButton);

            popupBox.appendChild(buttonContainer);
        }

        popupBox.style.display = 'block';
    }

    function updateButtonsForCurrentPage() {
        const currentUrl = window.location.href;
        const downloadButton = document.getElementById('bypass-download-btn');
        const linksButton = document.getElementById('bypass-links-btn');
        
        if (downloadButton && linksButton) {
            const isGalleryWithItem = currentUrl.includes("https://pixeldrain.com/l/") && currentUrl.includes("#item=");
            const isGalleryMainPage = currentUrl.includes("https://pixeldrain.com/l/") && !currentUrl.includes("#item=");
            const isSingleFile = currentUrl.includes("https://pixeldrain.com/u/");
            
            if (isSingleFile || isGalleryWithItem) {
                downloadButton.style.display = 'block';
                linksButton.style.display = 'block';
            } else if (isGalleryMainPage) {
                downloadButton.style.display = 'none';
                linksButton.style.display = 'block';
            } else {
                downloadButton.style.display = 'none';
                linksButton.style.display = 'none';
            }
        }
    }

    if (window.location.href.includes('pixeldrain.com')) {
        const popupBox = document.createElement("div");
        popupBox.style.zIndex = 20;
        popupBox.style.whiteSpace = "pre-line";
        popupBox.id = "popupBox";
        popupBox.style.display = "none";
        popupBox.style.position = "fixed";
        popupBox.style.top = "50%";
        popupBox.style.left = "50%";
        popupBox.style.transform = "translate(-50%, -50%)";
        popupBox.style.padding = "20px";
        popupBox.style.background = "#2f3541";
        popupBox.style.border = "2px solid #a4be8c";
        popupBox.style.color = "#d7dde8";
        popupBox.style.borderRadius = "10px";
        popupBox.style.width = "40%";
        popupBox.style.height = "auto";
        popupBox.style.maxWidth = "700px";
        popupBox.style.maxHeight = "80vh";
        popupBox.style.overflowY = "auto";
        popupBox.style.overflowX = "hidden";

        document.body.appendChild(popupBox);

        document.addEventListener('click', function(event) {
            if (popupBox.style.display === 'block') {
                if (!popupBox.contains(event.target)) {
                    const linksButton = document.getElementById('bypass-links-btn');
                    if (!linksButton || !linksButton.contains(event.target)) {
                        popupBox.style.display = 'none';
                    }
                }
            }
        });

        insertButtons();
        cacheLinksOnLoad();
        addGalleryEventListeners();
        updateButtonsForCurrentPage();

        const observer = new MutationObserver(function(mutations) {
            let shouldReinitialize = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    const hasNewContent = Array.from(mutation.addedNodes).some(node => 
                        node.nodeType === 1 && (
                            (node.matches && (
                                node.matches('a.file') || 
                                node.matches('[class*="content"]') ||
                                node.matches('main') ||
                                node.matches('.sidebar') ||
                                node.matches('nav')
                            )) ||
                            (node.querySelector && (
                                node.querySelector('a.file') ||
                                node.querySelector('[class*="content"]') ||
                                node.querySelector('main') ||
                                node.querySelector('.sidebar') ||
                                node.querySelector('nav')
                            ))
                        )
                    );
                    
                    if (hasNewContent) {
                        shouldReinitialize = true;
                    }
                }
            });

            if (shouldReinitialize) {
                setTimeout(() => {
                    insertButtons();
                    addGalleryEventListeners();
                    cacheLinksOnLoad();
                    updateButtonsForCurrentPage();
                }, 200);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        function positionPopupBox(popupBox) {
            const popupRect = popupBox.getBoundingClientRect();
            popupBox.style.top = `calc(50% - ${popupRect.height / 2}px)`;
            popupBox.style.left = `calc(50% - ${popupRect.width / 2}px)`;
        }
    }
})();
