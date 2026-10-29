package com.mobileblockpuzzle.game;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.WindowManager;

import androidx.appcompat.app.AppCompatActivity;

/**
 * Two-phase splash screen:
 *   Phase 1 (1600 ms) — EBYZOM brand mark on black background
 *   Phase 2 (1500 ms) — App logo + name + tagline on light background
 * Tap on either phase to skip it early.
 */
public class SplashActivity extends AppCompatActivity {

    private static final long EBYZOM_DURATION_MS = 1600;
    private static final long APP_DURATION_MS    = 1500;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable pendingTransition;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Keep screen on during splash and go edge-to-edge
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        );

        showEbyzomPhase();
    }

    // ── Phase 1: EBYZOM brand ────────────────────────────────────────────────

    private void showEbyzomPhase() {
        setContentView(R.layout.splash_ebyzom);

        scheduleTransition(EBYZOM_DURATION_MS, this::showAppPhase);

        findViewById(R.id.splash_ebyzom_root).setOnClickListener(v -> {
            cancelPending();
            showAppPhase();
        });
    }

    // ── Phase 2: App brand ───────────────────────────────────────────────────

    private void showAppPhase() {
        setContentView(R.layout.splash_app);

        scheduleTransition(APP_DURATION_MS, this::launchMain);

        findViewById(R.id.splash_app_root).setOnClickListener(v -> {
            cancelPending();
            launchMain();
        });
    }

    // ── Launch MainActivity ──────────────────────────────────────────────────

    private void launchMain() {
        startActivity(new Intent(this, MainActivity.class));
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
