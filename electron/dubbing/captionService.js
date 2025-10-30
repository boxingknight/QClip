const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { extractAudio } = require('./audioExtractor');

class CaptionService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    this.openai = new OpenAI({ apiKey });
    this.apiKey = apiKey;
  }

  /**
   * Generate captions for a video using OpenAI Whisper
   * @param {string} videoPath - Path to source video
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<string>} Path to generated SRT file
   */
  async generateCaptions(videoPath, onProgress) {
    try {
      console.log(`[CaptionService] Starting caption generation for ${videoPath}`);
      
      onProgress({ status: 'extracting', percent: 10 });
      
      // Extract audio from video
      const audioPath = await extractAudio(videoPath);
      console.log(`[CaptionService] Audio extracted to: ${audioPath}`);
      
      onProgress({ status: 'transcribing', percent: 30 });
      
      // Check file size (Whisper has 25MB limit)
      const stats = fs.statSync(audioPath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      if (fileSizeInMB > 25) {
        throw new Error(`Audio file too large: ${fileSizeInMB.toFixed(2)}MB. Whisper limit is 25MB.`);
      }
      
      console.log(`[CaptionService] Audio file size: ${fileSizeInMB.toFixed(2)}MB`);
      
      // Call Whisper API
      console.log('[CaptionService] Calling OpenAI Whisper API...');
      const response = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: "whisper-1",
        response_format: "srt",
        temperature: 0.0 // More consistent results
        // language omitted for auto-detection
      });
      
      onProgress({ status: 'saving', percent: 90 });
      
      // Save SRT file
      const srtPath = videoPath.replace(/\.[^.]+$/, '.srt');
      fs.writeFileSync(srtPath, response);
      
      console.log(`[CaptionService] SRT file saved to: ${srtPath}`);
      
      // Clean up temporary audio file
      try {
        fs.unlinkSync(audioPath);
        console.log('[CaptionService] Temporary audio file cleaned up');
      } catch (cleanupError) {
        console.warn('[CaptionService] Failed to clean up audio file:', cleanupError.message);
      }
      
      onProgress({ status: 'complete', percent: 100 });
      return srtPath;
      
    } catch (error) {
      console.error('[CaptionService] Caption generation error:', error);
      onProgress({ status: 'error', percent: 0 });
      throw new Error(`Caption generation failed: ${error.message}`);
    }
  }

  /**
   * Validate API key by making a test request
   * @returns {Promise<boolean>} True if API key is valid
   */
  async validateApiKey() {
    try {
      console.log('[CaptionService] Validating API key...');
      const response = await this.openai.models.list();
      console.log('[CaptionService] API key is valid');
      return true;
    } catch (error) {
      console.error('[CaptionService] API key validation failed:', error.message);
      return false;
    }
  }

  /**
   * Get cost estimate for caption generation
   * @param {number} durationInSeconds - Video duration in seconds
   * @returns {Object} Cost estimate
   */
  getCostEstimate(durationInSeconds) {
    const durationInMinutes = durationInSeconds / 60;
    const costPerMinute = 0.006; // $0.006 per minute for Whisper
    const totalCost = durationInMinutes * costPerMinute;
    
    return {
      durationMinutes: durationInMinutes,
      costPerMinute: costPerMinute,
      totalCost: totalCost,
      currency: 'USD'
    };
  }
}

module.exports = { CaptionService };
