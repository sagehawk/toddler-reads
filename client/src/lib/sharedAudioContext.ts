/**
 * Shared AudioContext for synthesized UI sounds.
 * 
 * Mobile browsers (especially iOS Safari) limit concurrent AudioContext
 * instances to ~6. Creating a new one per tap causes silent failures.
 * This module provides a single shared instance that all components reuse.
 */

let _sharedCtx: AudioContext | null = null;

/**
 * Returns the shared AudioContext, creating it on first call.
 * Automatically resumes the context if it was suspended by the browser
 * (which mobile browsers do after periods of inactivity).
 */
export function getSharedAudioContext(): AudioContext | null {
  try {
    if (!_sharedCtx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      _sharedCtx = new AC();
    }
    // Mobile browsers suspend AudioContext after idle — resume it
    if (_sharedCtx.state === 'suspended') {
      _sharedCtx.resume();
    }
    return _sharedCtx;
  } catch (e) {
    return null;
  }
}
