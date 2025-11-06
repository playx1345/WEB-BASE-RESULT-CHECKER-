/**
 * Input sanitization and validation utilities
 * Provides secure input handling for the grade access system
 */

export class InputSanitizer {
  /**
   * Sanitize text input by removing potentially harmful characters
   */
  static sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove HTML brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .slice(0, 500); // Limit length
  }

  /**
   * Sanitize and validate email input
   */
  static sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') return '';
    
    return email
      .trim()
      .toLowerCase()
      .replace(/[^\w@.-]/g, '') // Only allow alphanumeric, @, ., and -
      .slice(0, 254); // RFC 5321 limit
  }

  /**
   * Sanitize matric number input
   */
  static sanitizeMatricNumber(matricNumber: string): string {
    if (!matricNumber || typeof matricNumber !== 'string') return '';
    
    return matricNumber
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9/]/g, '') // Only allow letters, numbers, and forward slash
      .slice(0, 30); // Increased to accommodate new format: PSP/SICT/CSC/ND/24/001
  }

  /**
   * Sanitize phone number input
   */
  static sanitizePhoneNumber(phone: string): string {
    if (!phone || typeof phone !== 'string') return '';
    
    return phone
      .trim()
      .replace(/[^\d+\-\s()]/g, '') // Only allow digits, +, -, space, and parentheses
      .slice(0, 20);
  }

  /**
   * Sanitize PIN input (numeric only)
   */
  static sanitizePIN(pin: string): string {
    if (!pin || typeof pin !== 'string') return '';
    
    return pin
      .trim()
      .replace(/[^\d]/g, '') // Only allow digits
      .slice(0, 6);
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate matric number format (PSP/SICT/CSC/ND/YY/XXX or PSP/SICT/CSC/HND/YY/XXX)
   */
  static validateMatricNumber(matricNumber: string): boolean {
    const matricRegex = /^PSP\/SICT\/CSC\/(ND|HND)\/\d{2}\/\d{3}$/;
    return matricRegex.test(matricNumber);
  }

  /**
   * Validate PIN format (6 digits)
   */
  static validatePIN(pin: string): boolean {
    return /^\d{6}$/.test(pin);
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[+]?[\d\s\-()]{10,15}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Sanitize search query input
   */
  static sanitizeSearchQuery(query: string): string {
    if (!query || typeof query !== 'string') return '';
    
    return query
      .trim()
      .replace(/[<>]/g, '') // Remove HTML brackets
      .replace(/['"`;]/g, '') // Remove potential SQL injection characters
      .slice(0, 100);
  }

  /**
   * Escape HTML characters for safe display
   */
  static escapeHtml(text: string): string {
    if (!text || typeof text !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Validate and sanitize file names
   */
  static sanitizeFileName(fileName: string): string {
    if (!fileName || typeof fileName !== 'string') return '';
    
    return fileName
      .trim()
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .slice(0, 255);
  }
}

/**
 * Rate limiting utility for API calls
 */
export class RateLimiter {
  private static requests = new Map<string, number[]>();
  
  /**
   * Check if request is within rate limit
   */
  static checkLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requestTimes = this.requests.get(key)!;
    
    // Remove old requests outside the window
    const validRequests = requestTimes.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
}