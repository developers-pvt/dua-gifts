import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let targetUrl = searchParams.get("url");

  if (!targetUrl) {
    targetUrl = "https://www.flipkart.com/search?q=gifts";
  }

  // Ensure valid HTTP protocol
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = "https://" + targetUrl;
  }

  try {
    const parsedTarget = new URL(targetUrl);
    const origin = parsedTarget.origin;
    const isMeesho = parsedTarget.hostname.includes("meesho.com");

    const userAgent = isMeesho
      ? "WhatsApp/2.21.12.21 A"
      : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

    const upstreamResponse = await fetch(targetUrl, {
      headers: {
        "User-Agent": userAgent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    const contentType = upstreamResponse.headers.get("content-type") || "text/html";

    // Non-HTML responses (images, fonts, stylesheets) are forwarded directly
    if (!contentType.includes("text/html")) {
      const buffer = await upstreamResponse.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    let html = await upstreamResponse.text();

    // 1. Strip upstream X-Frame-Options and Content-Security-Policy meta tags
    html = html.replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, "");
    html = html.replace(/<meta[^>]*http-equiv=["']?X-Frame-Options["']?[^>]*>/gi, "");

    // 2. Insert <base> tag to correctly load all external assets (images, css, fonts)
    const baseTag = `<base href="${origin}/" />`;
    if (html.includes("<head>")) {
      html = html.replace("<head>", `<head>${baseTag}`);
    } else if (html.includes("<head ")) {
      html = html.replace(/<head[^>]*>/, `$&${baseTag}`);
    }

    // 3. Inject Gift Studio In-Browser Assistant & PostMessage Bridge
    const assistantScript = `
    <!-- GIFT STUDIO INBUILT BROWSER ASSISTANT -->
    <style>
      #giftstudio-inbuilt-bar {
        position: fixed !important;
        bottom: 24px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        z-index: 2147483647 !important;
        background: rgba(18, 18, 20, 0.94) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        color: #ffffff !important;
        padding: 12px 20px !important;
        border-radius: 9999px !important;
        box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.15) !important;
        display: flex !important;
        align-items: center !important;
        gap: 16px !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        font-size: 13px !important;
        max-width: 90vw !important;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      #giftstudio-inbuilt-bar .gs-logo {
        font-weight: 800 !important;
        letter-spacing: 0.05em !important;
        color: #ffffff !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        white-space: nowrap !important;
      }
      #giftstudio-inbuilt-bar .gs-badge {
        background: rgba(255,255,255,0.12) !important;
        padding: 3px 8px !important;
        border-radius: 9999px !important;
        font-size: 10px !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        color: #10b981 !important;
      }
      #giftstudio-inbuilt-bar .gs-prod-info {
        display: flex !important;
        flex-direction: column !important;
        max-width: 280px !important;
        overflow: hidden !important;
      }
      #giftstudio-inbuilt-bar .gs-prod-title {
        font-weight: 600 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        color: #ffffff !important;
        font-size: 12px !important;
      }
      #giftstudio-inbuilt-bar .gs-prod-price {
        font-weight: 700 !important;
        color: #34d399 !important;
        font-size: 14px !important;
      }
      #giftstudio-inbuilt-btn {
        background: #000000 !important;
        color: #ffffff !important;
        border: 1px solid rgba(255,255,255,0.25) !important;
        padding: 8px 18px !important;
        border-radius: 9999px !important;
        font-weight: 700 !important;
        font-size: 12px !important;
        cursor: pointer !important;
        white-space: nowrap !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        transition: transform 0.2s, background 0.2s !important;
      }
      #giftstudio-inbuilt-btn:hover {
        background: #27272a !important;
        transform: scale(1.04) !important;
      }
      #giftstudio-inbuilt-btn:active {
        transform: scale(0.98) !important;
      }
      #giftstudio-toast {
        position: fixed !important;
        top: 20px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        z-index: 2147483647 !important;
        background: #10b981 !important;
        color: #ffffff !important;
        padding: 10px 24px !important;
        border-radius: 9999px !important;
        font-weight: 700 !important;
        font-size: 13px !important;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3) !important;
        display: none !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      }
    </style>

    <div id="giftstudio-toast">✓ Item added to your Dua Gifts Hamper!</div>

    <div id="giftstudio-inbuilt-bar">
      <div class="gs-logo">
        <span>🎁</span>
        <span>DUA GIFTS</span>
        <span class="gs-badge">Live Browser</span>
      </div>
      <div class="gs-prod-info" id="gs-info-box">
        <span class="gs-prod-title" id="gs-title-text">Browse & Select any Product</span>
        <span class="gs-prod-price" id="gs-price-text">Live Sync</span>
      </div>
      <button id="giftstudio-inbuilt-btn" type="button">
        <span>+ Add to My Hamper Cart</span>
      </button>
    </div>

    <script>
      (function() {
        var currentProduct = null;

        function detectProduct() {
          try {
            var title = "";
            var h1 = document.querySelector("h1");
            if (h1 && h1.innerText.trim().length > 3) {
              title = h1.innerText.trim();
            }
            if (!title) {
              var ogTitle = document.querySelector('meta[property="og:title"]');
              if (ogTitle && ogTitle.content) title = ogTitle.content.split("|")[0].split("-")[0].trim();
            }
            if (!title) {
              title = document.title ? document.title.split("|")[0].split("-")[0].trim() : "Marketplace Item";
            }

            var price = 0;
            var priceEl = document.querySelector('._30jeq3, ._16Jk6d, [class*="price"], [class*="Price"]');
            var rawText = priceEl ? priceEl.innerText : document.body.innerText;
            var priceMatch = rawText.match(/(?:₹|Rs\.?)\s*([0-9,]+)/i);
            if (priceMatch) {
              price = parseInt(priceMatch[1].replace(/,/g, ""), 10);
            }

            var imageUrl = "";
            var ogImg = document.querySelector('meta[property="og:image"]');
            if (ogImg && ogImg.content) {
              imageUrl = ogImg.content;
            } else {
              var mainImg = document.querySelector('img[src*="flixcart"], img[src*="meesho"], img[src*="amazon"]');
              if (mainImg) imageUrl = mainImg.src;
            }

            var marketplace = location.hostname.includes("meesho") ? "Meesho" : location.hostname.includes("shopsy") ? "Shopsy" : location.hostname.includes("amazon") ? "Amazon" : "Flipkart";

            currentProduct = {
              id: "live_" + Date.now(),
              title: title,
              price: price || 999,
              imageUrl: imageUrl || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500",
              marketplace: marketplace,
              sourceUrl: window.location.href
            };

            var titleEl = document.getElementById("gs-title-text");
            var priceEl = document.getElementById("gs-price-text");
            if (titleEl && title) titleEl.innerText = title;
            if (priceEl && price > 0) priceEl.innerText = "₹" + price.toLocaleString("en-IN");

          } catch (e) {
            console.error("GS detector error:", e);
          }
        }

        setTimeout(detectProduct, 1000);
        setInterval(detectProduct, 2500);

        try {
          window.parent.postMessage({
            type: "GIFT_STUDIO_URL_CHANGE",
            url: window.location.href
          }, "*");
        } catch(e) {}

        var btn = document.getElementById("giftstudio-inbuilt-btn");
        if (btn) {
          btn.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            detectProduct();
            if (currentProduct) {
              window.parent.postMessage({
                type: "GIFT_STUDIO_ADD_TO_CART",
                product: currentProduct
              }, "*");

              var toast = document.getElementById("giftstudio-toast");
              if (toast) {
                toast.style.display = "block";
                setTimeout(function() {
                  toast.style.display = "none";
                }, 3000);
              }
            }
          });
        }

        document.addEventListener("click", function(e) {
          var target = e.target.closest("a");
          if (!target || !target.href) return;
          var href = target.href;
          if (href.startsWith("http") && !href.includes("/api/browser-proxy")) {
            e.preventDefault();
            window.location.href = "/api/browser-proxy?url=" + encodeURIComponent(href);
          }
        }, true);

      })();
    </script>
    `;

    if (html.includes("</body>")) {
      html = html.replace("</body>", `${assistantScript}</body>`);
    } else {
      html += assistantScript;
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    return new NextResponse(
      `<html><body><h3>Failed to load page in Dua Gifts Inbuilt Browser</h3><p>${error?.message}</p></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}
