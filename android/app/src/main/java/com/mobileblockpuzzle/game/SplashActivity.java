package com.mobileblockpuzzle.game;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.WindowManager;

import androidx.appcompat.app.AppCompatActivity;

/**
 * Two-phase splash screen:
 *   Phase 1 (1000 ms) — EBYZOM brand mark on black background
 *   Phase 2 (1000 ms) — App logo + name + tagline on light background
 * Tap on either phase to skip it early.
 */
public class SplashActivity extends AppCompatActivity {

    private static final long EBYZOM_DURATION_MS = 1000;
    private static final long APP_DURATION_MS    = 1000;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable pendingTransition;
    private boolean isNavigating = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Keep screen on during splash and handle notch/cutout
        try {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                getWindow().getAttributes().layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            }
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            );
        } catch (Exception ignored) {}

        showEbyzomPhase();
    }

    // ── Phase 1: EBYZOM brand ────────────────────────────────────────────────

    private void showEbyzomPhase() {
        setContentView(R.layout.splash_ebyzom);

        scheduleTransition(EBYZOM_DURATION_MS, this::showAppPhase);

        View root = findViewById(R.id.splash_ebyzom_root);
        if (root != null) {
            root.setOnClickListener(v -> {
                cancelPending();
                showAppPhase();
            });
        }
    }

    // ── Phase 2: App brand ───────────────────────────────────────────────────

    private void showAppPhase() {
        if (isFinishing() || isDestroyed()) return;
        setContentView(R.layout.splash_app);

        scheduleTransition(APP_DURATION_MS, this::launchMain);

        View root = findViewById(R.id.splash_app_root);
        if (root != null) {
            root.setOnClickListener(v -> {
                cancelPending();
                launchMain();
            });
        }
    }

    // ── Launch MainActivity ──────────────────────────────────────────────────

    private synchronized void launchMain() {
        if (isNavigating) return;
        isNavigating = true;
        cancelPending();
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        startActivity(intent);
        finish();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void scheduleTransition(long delayMs, Runnable action) {
        cancelPending();
        pendingTransition = action;
        handler.postDelayed(pendingTransition, delayMs);
    }

    private void cancelPending() {
        if (pendingTransition != null) {
            handler.removeCallbacks(pendingTransition);
            pendingTransition = null;
        }
    }

    @Override
    protected void onDestroy() {
        cancelPending();
        super.onDestroy();
    }
}
