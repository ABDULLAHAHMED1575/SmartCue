const chrono = require('chrono-node');
const compromise = require('compromise');

class NLPService {
  /**
   * Parse natural language reminder input
   * @param {string} input - Natural language reminder text
   * @returns {object} Parsed reminder data
   */
  parseReminder(input) {
    const result = {
      originalInput: input,
      task: '',
      location: null,
      dueDate: null,
      category: 'Personal',
      priority: 'medium',
      triggerType: 'time'
    };

    // Extract date/time using chrono-node
    const dateResults = chrono.parse(input);
    if (dateResults.length > 0) {
      result.dueDate = dateResults[0].start.date();
      result.triggerType = 'time';
    }

    // Extract location-based triggers
    const locationTriggers = this.extractLocationTriggers(input);
    if (locationTriggers) {
      result.location = locationTriggers;
      result.triggerType = result.dueDate ? 'both' : 'location';
    }

    // Extract the main task
    result.task = this.extractTask(input, dateResults, locationTriggers);

    // Categorize the reminder
    result.category = this.categorizeReminder(input);

    // Determine priority
    result.priority = this.determinePriority(input);

    return result;
  }

  /**
   * Extract location-based triggers from text
   */
  extractLocationTriggers(text) {
    const locationPatterns = [
      /(?:when|if|once)\s+(?:I'?m?|I\s+am)\s+(?:at|near|in|by)\s+(.+?)(?:\.|,|$)/i,
      /(?:at|near|in|by)\s+(?:the\s+)?(.+?)(?:\.|,|$)/i,
      /(?:when|if|once)\s+(?:I|we)\s+(?:reach|get\s+to|arrive\s+at)\s+(.+?)(?:\.|,|$)/i
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          placeName: match[1].trim(),
          radius: 500 // Default radius in meters
        };
      }
    }

    return null;
  }

  /**
   * Extract the main task from the input
   */
  extractTask(input, dateResults, locationTriggers) {
    let task = input;

    // Remove date information
    if (dateResults.length > 0) {
      task = task.replace(dateResults[0].text, '').trim();
    }

    // Remove location triggers
    if (locationTriggers) {
      const locationPatterns = [
        /(?:when|if|once)\s+(?:I'?m?|I\s+am)\s+(?:at|near|in|by)\s+.+?(?:\.|,|$)/i,
        /(?:at|near|in|by)\s+(?:the\s+)?.+?(?:\.|,|$)/i,
        /(?:when|if|once)\s+(?:I|we)\s+(?:reach|get\s+to|arrive\s+at)\s+.+?(?:\.|,|$)/i
      ];

      for (const pattern of locationPatterns) {
        task = task.replace(pattern, '').trim();
      }
    }

    // Remove "remind me to" prefix
    task = task.replace(/^(?:remind\s+me\s+to|remember\s+to)\s+/i, '').trim();

    // Clean up punctuation
    task = task.replace(/[,.]$/, '').trim();

    return task || input;
  }

  /**
   * Categorize reminder based on keywords
   */
  categorizeReminder(text) {
    const categories = {
      'Groceries': ['grocery', 'store', 'supermarket', 'buy', 'milk', 'bread', 'food', 'shopping'],
      'Bills': ['bill', 'payment', 'pay', 'electricity', 'water', 'rent', 'insurance'],
      'Work': ['work', 'office', 'meeting', 'presentation', 'report', 'email', 'call'],
      'Health': ['doctor', 'appointment', 'medicine', 'pharmacy', 'workout', 'exercise', 'gym'],
      'Shopping': ['shop', 'buy', 'purchase', 'mall']
    };

    const lowerText = text.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return category;
        }
      }
    }

    return 'Personal';
  }

  /**
   * Determine priority based on keywords
   */
  determinePriority(text) {
    const highPriorityKeywords = ['urgent', 'important', 'asap', 'immediately', 'critical'];
    const lowPriorityKeywords = ['maybe', 'sometime', 'eventually', 'when possible'];

    const lowerText = text.toLowerCase();

    for (const keyword of highPriorityKeywords) {
      if (lowerText.includes(keyword)) {
        return 'high';
      }
    }

    for (const keyword of lowPriorityKeywords) {
      if (lowerText.includes(keyword)) {
        return 'low';
      }
    }

    return 'medium';
  }

  /**
   * Extract action verbs from text
   */
  extractActions(text) {
    const doc = compromise(text);
    const verbs = doc.verbs().out('array');
    return verbs;
  }
}

module.exports = new NLPService();
