import React, { useEffect, useRef } from 'react';
import { openExternalLink } from '../../../helpers/openExternalLink';

// adsterra banner ad
const BannerAd = () => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = bannerRef.current;
    if (!container) return;

    // Create configuration script
    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.text = `
      atOptions = {
        key: "4d3aa5e82f119e12e2449dbc6246913d",
        format: "iframe",
        height: 90,
        width: 728,
        params: {},
      };
    `;

    // Create external script
    const externalScript = document.createElement('script');
    externalScript.type = 'text/javascript';
    externalScript.src = 'https://www.highperformanceformat.com/4d3aa5e82f119e12e2449dbc6246913d/invoke.js';

    // Append scripts to container
    container.appendChild(configScript);
    container.appendChild(externalScript);

    // Add a MutationObserver to monitor for iframe creation
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'IFRAME') {
              const iframe = node as HTMLIFrameElement;

              // When iframe loads, try to add click event listeners to all links in it
              iframe.addEventListener('load', () => {
                try {
                  // This will throw an error if iframe is cross-origin
                  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                  if (iframeDoc) {
                    // Capture all clicks in the iframe
                    iframeDoc.addEventListener('click', (event) => {
                      let target = event.target as HTMLElement;
                      // Find closest anchor
                      while (target && target.tagName !== 'A') {
                        target = target.parentElement as HTMLElement;
                      }

                      if (target && target.tagName === 'A') {
                        event.preventDefault();
                        event.stopPropagation();
                        const url = (target as HTMLAnchorElement).href;
                        openExternalLink(url);
                      }
                    }, true);
                  }
                } catch (e) {
                  // Cross-origin iframe - we'll use the backup method below
                  console.log('Cross-origin iframe detected, using fallback method');
                }
              });
            }
          });
        }
      });
    });

    // Start observing the container
    observer.observe(container, { childList: true, subtree: true });

    // Backup: Also add a click handler on the container itself
    const handleContainerClick = (event: MouseEvent) => {
      // If the click wasn't handled by the iframe listeners, we'll handle it here
      let element = event.target as HTMLElement | null;
      while (element && element !== container) {
        if (element.tagName === 'A') {
          event.preventDefault();
          const url = (element as HTMLAnchorElement).href;
          openExternalLink(url);
          return;
        } else if (element.tagName === 'IFRAME') {
          // If we click directly on an iframe (that we couldn't add listeners to)
          // Try to extract URL from common ad iframe patterns
          const iframe = element as HTMLIFrameElement;

          // Let the click happen first (so ad network registers it)
          setTimeout(() => {
            // Now open the URL the iframe would navigate to
            if (iframe.src) {
              // Basic check if this is an ad iframe with click-through URL
              if (iframe.src.includes('ad') || iframe.src.includes('banner')) {
                openExternalLink(iframe.src);
              }
            }
          }, 100);
          return;
        }
        element = element.parentElement;
      }
    };

    container.addEventListener('click', handleContainerClick);

    // Cleanup function
    return () => {
      observer.disconnect();
      container.removeEventListener('click', handleContainerClick);
      container.innerHTML = '';
    };
  }, []);

  return (
    <div
      className='relative bg-black'
      ref={bannerRef}
      style={{
        height: '90px',
        width: '728px',
        margin: '0 auto',
        overflow: 'hidden'
      }}
    />
  );
};

export default BannerAd;