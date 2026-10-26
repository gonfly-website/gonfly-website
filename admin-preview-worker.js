/**
 * Isolated static-asset Worker for the GoNfly admin feature preview.
 * This Worker is deliberately separate from the production gonfly-website Worker.
 */
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  }
};
