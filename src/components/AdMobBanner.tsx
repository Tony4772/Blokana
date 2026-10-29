import { useEffect } from "react";
import {
  AdMob,
  BannerAdSize,
  BannerAdPosition,
} from "@capacitor-community/admob";

// ID de prueba de Google. Reemplazar por el ID real del banner antes de publicar.
const BANNER_AD_ID = "ca-app-pub-3940256099942544/6300978111";

export function AdMobBanner() {
  useEffect(() => {
    let cancelled = false;

    async function startAdMob() {
      try {
        await AdMob.initialize();

        if (cancelled) return;

        await AdMob.showBanner({
          adId: BANNER_AD_ID,
          position: BannerAdPosition.BOTTOM_CENTER,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
        });
      } catch (error) {
        console.error("AdMob error:", error);
      }
    }

    startAdMob();

    return () => {
      cancelled = true;
      AdMob.hideBanner().catch(() => {});
      AdMob.removeBanner().catch(() => {});
    };
  }, []);

  // Render null - the banner is managed natively
  return null;
}
