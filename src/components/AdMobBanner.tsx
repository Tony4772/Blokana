import { useEffect } from "react";
import {
  AdMob,
  BannerAdSize,
  BannerAdPosition,
} from "@capacitor-community/admob";
import { Capacitor } from "@capacitor/core";

// ID de prueba de Google AdMob
const BANNER_AD_ID = "ca-app-pub-3940256099942544/6300978111";

export function AdMobBanner() {
  useEffect(() => {
    // Only run on native Android/iOS
    if (!Capacitor.isNativePlatform()) return;

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
        console.warn("AdMob banner unavailable:", error);
      }
    }

    startAdMob();

    return () => {
      cancelled = true;
      try {
        AdMob.hideBanner().catch(() => {});
        AdMob.removeBanner().catch(() => {});
      } catch {
        /* noop */
      }
    };
  }, []);

  return null;
}
