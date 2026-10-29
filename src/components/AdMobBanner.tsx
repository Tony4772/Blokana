import { useEffect } from "react";
import {
  AdMob,
  BannerAdSize,
  BannerAdPosition,
} from "@capacitor-community/admob";

export function AdMobBanner() {
  useEffect(() => {
    async function startAdMob() {
      try {
        // Initialize the SDK
        await AdMob.initialize();

        // Show banner at bottom center with smart size
        const options = {
          position: BannerAdPosition.BOTTOM_CENTER,
          size: BannerAdSize.SMART_BANNER,
          // offsetTopStatusBar: true, // uncomment if needed for notches
        };

        await AdMob.showBanner(options);
      } catch (error) {
        console.error("AdMob error:", error);
      }
    }

    startAdMob();

    // Cleanup on unmount
    return async () => {
      try {
        await AdMob.hideBanner();
        await AdMob.destroyBanner();
      } catch (error) {
        console.error("AdMob cleanup error:", error);
      }
    };
  }, []);

  // Render null - the banner is managed natively
  return null;
}