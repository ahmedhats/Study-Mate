import { parse, addDays, addWeeks, addMonths, addYears, isValid, isBefore, format } from 'date-fns';

// Extract deadline from text or estimate it based on difficulty
export function extract_deadline(text, current_date) {
    // Special case for "next week"
    if (text.match(/\b(?:next\s+week)\b/i)) {
        return addDays(current_date, 7); // Set to 7 days from now
    }

    // Special case for "tomorrow"
    if (text.match(/\b(?:tomorrow|tmr|tmrw)\b/i)) {
        return addDays(current_date, 1);
    }

    // Special case for "after X days"
    const afterMatch = text.match(/after\s+(\d+)\s+days?/i);
    if (afterMatch) {
        const days = parseInt(afterMatch[1]);
        return addDays(current_date, days);
    }

    // Special case for "in the next X days"
    const nextMatch = text.match(/in\s+the\s+next\s+(\d+)\s+days?/i);
    if (nextMatch) {
        const days = parseInt(nextMatch[1]);
        return addDays(current_date, Math.floor(days / 2)); // Set to middle of the period
    }

    // Handle other patterns
    const deadline_patterns = [
        "due\\s+(?:on\\s+)?(?:\\w+(?:\\s+\\d{1,2}(?:st|nd|rd|th)?)?|\\d{1,2}(?:st|nd|rd|th)?\\s+\\w+)",
        "by\\s+(?:\\w+(?:\\s+\\d{1,2}(?:st|nd|rd|th)?)?|\\d{1,2}(?:st|nd|rd|th)?\\s+\\w+)",
        "in\\s+(\\d+)\\s+(?:day|days|week|weeks|month|months)",
        "\\bnext\\s+(?:month|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\\b",
        "\\bthis\\s+(?:week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\\b",
        "\\bon\\s+(?:\\w+(?:\\s+\\d{1,2}(?:st|nd|rd|th)?)?|\\d{1,2}(?:st|nd|rd|th)?\\s+\\w+)",
        "\\d{1,2}(?:st|nd|rd|th)?\\s+(?:of\\s+)?\\w+",
        "\\w+\\s+\\d{1,2}(?:st|nd|rd|th)?"
    ];

    // Try to parse an explicit deadline
    for (const pattern of deadline_patterns) {
        const match = text.match(new RegExp(pattern, 'i'));
        if (match) {
            // Handle special case for "in X days/weeks/months"
            if (match[0].toLowerCase().includes('in')) {
                const numberMatch = match[0].match(/\d+/);
                const unitMatch = match[0].match(/day|week|month/i);
                if (numberMatch && unitMatch) {
                    const number = parseInt(numberMatch[0]);
                    const unit = unitMatch[0].toLowerCase();
                    
                    if (unit === 'day') {
                        return addDays(current_date, number);
                    } else if (unit === 'week') {
                        return addWeeks(current_date, number);
                    } else if (unit === 'month') {
                        return addMonths(current_date, number);
                    }
                }
            }
            
            // Try to parse the date string
            const dateStr = match[0].replace(/^(due|by|on)\s+/i, '');
            const parsed = parse(dateStr, 'MMMM d', new Date());
            
            if (isValid(parsed)) {
                // If the parsed date is in the past, move it to next year
                if (isBefore(parsed, current_date)) {
                    return addYears(parsed, 1);
                }
                return parsed;
            }
        }
    }

    // If no deadline found — estimate based on difficulty
    const difficulty = extract_difficulty(text);
    
    if (difficulty === "easy") {
        return addDays(current_date, 1);
    } else if (difficulty === "medium") {
        return addDays(current_date, 2);
    } else if (difficulty === "hard") {
        return addDays(current_date, 3);
    }
    
    return addDays(current_date, 2); // Default
}

// Extract duration in hours
export function extract_duration(text) {
    const match = text.match(/(~|about|approximately|for)? ?(\d+(\.\d+)?) ?(hours|hrs|h)/i);
    if (match) {
        return parseFloat(match[2]);
    }
    return 1.0; // default duration if not found
}

// Extract difficulty level
export function extract_difficulty(text) {
    const difficulties = ["easy", "medium", "hard"];
    for (const level of difficulties) {
        if (text.toLowerCase().includes(level)) {
            return level;
        }
    }
    return "medium"; // default difficulty
}

// Extract cleaned-up task name
export function extract_task_name(text) {
    let clean = text.trim();

    // Record exact phrases to remove
    const matches_to_remove = [];

    // Duration patterns
    const duration_patterns = [
        "(~|about|approximately|for|takes?)? ?\\d+(\\.\\d+)? ?(hours|hrs|h|hour)",
        "should take \\d+(\\.\\d+)? ?(hours|hrs|h|hour)"
    ];
    for (const pattern of duration_patterns) {
        const match = clean.match(new RegExp(pattern, 'i'));
        if (match) {
            matches_to_remove.push(match[0]);
        }
    }

    // Difficulty patterns
    const difficulty_patterns = [
        "(?:it'?s|this is|difficulty:?\\s+)?\\b(easy|medium|hard)\\b(?:\\s+difficulty)?",
        "\\b(easy|medium|hard)\\b\\s+task"
    ];
    for (const pattern of difficulty_patterns) {
        const match = clean.match(new RegExp(pattern, 'i'));
        if (match) {
            matches_to_remove.push(match[0]);
        }
    }

    // Deadline patterns
    const deadline_patterns = [
        "due\\s+(?:on\\s+)?(?:\\w+(?:\\s+\\d{1,2}(?:st|nd|rd|th)?)?|\\d{1,2}(?:st|nd|rd|th)?\\s+\\w+)",
        "by\\s+(?:\\w+(?:\\s+\\d{1,2}(?:st|nd|rd|th)?)?|\\d{1,2}(?:st|nd|rd|th)?\\s+\\w+)",
        "in\\s+\\d+\\s+(?:day|days|week|weeks|month|months)",
        "\\b(?:tomorrow|tmr|tmrw)\\b",
        "\\bnext\\s+(?:week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\\b",
        "\\bthis\\s+(?:week|month)\\b",
        "\\bon\\s+(?:\\w+(?:\\s+\\d{1,2}(?:st|nd|rd|th)?)?|\\d{1,2}(?:st|nd|rd|th)?\\s+\\w+)",
        "\\d{1,2}(?:st|nd|rd|th)?\\s+(?:of\\s+)?\\w+"
    ];
    for (const pattern of deadline_patterns) {
        const match = clean.match(new RegExp(pattern, 'i'));
        if (match && !match[0].match(/\bon\s+(?:math|reading|homework|project|exam)/i)) {
            matches_to_remove.push(match[0]);
        }
    }

    // Remove matched phrases
    for (const phrase of matches_to_remove) {
        clean = clean.replace(new RegExp(phrase, 'gi'), '');
    }

    // Clean up remaining artifacts
    clean = clean.replace(/\s{2,}/g, ' '); // Multiple spaces
    clean = clean.replace(/[,\.]+(?:\s+[,\.]+)*/g, ''); // Multiple punctuation
    clean = clean.replace(/^\W+|\W+$/g, ''); // Leading/trailing punctuation
    clean = clean.trim();

    // Capitalize words properly
    const words = clean.split(' ');
    if (words.length > 0) {
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
        const lowercase_words = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i].toLowerCase();
            words[i] = lowercase_words.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1);
        }
        clean = words.join(' ');
    }

    return clean;
}

// Calculate importance based on deadline proximity and difficulty
function calculate_importance(deadline, difficulty, current_date = new Date()) {
    const daysUntilDue = Math.ceil((new Date(deadline) - current_date) / (1000 * 60 * 60 * 24));
    
    // Base importance from explicit difficulty only
    let importanceLevel = 0;
    if (difficulty !== 'medium') { // Only count difficulty if explicitly set
        importanceLevel = difficulty === 'hard' ? 3 : 
                         difficulty === 'easy' ? 1 : 0;
    }
    
    // Adjust importance based on deadline proximity
    if (daysUntilDue < 0) { // Overdue tasks
        importanceLevel += 5; // Highest priority for overdue tasks
    } else if (daysUntilDue <= 1) { // Due within 24 hours
        importanceLevel += 4; // Critical for next-day tasks
    } else if (daysUntilDue <= 3) { // Due within 3 days
        importanceLevel += 3; // Important for tasks due soon
    } else if (daysUntilDue <= 5) { // Due within 5 days
        importanceLevel += 2; // Normal+ for medium-term tasks
    } else if (daysUntilDue <= 7) { // Due within a week
        importanceLevel += 1; // Normal for week-long tasks
    }
    
    // Map final importance level to task system importance
    if (daysUntilDue < 0) return 'overdue'; // Special status for overdue tasks
    if (importanceLevel >= 4) return 'critical';
    if (importanceLevel >= 3) return 'important';
    if (importanceLevel >= 1) return 'normal';
    return 'optional';
}

// Process tasks
export function process_tasks(raw_task_list, current_date = new Date()) {
    if (!Array.isArray(raw_task_list)) {
        throw new Error("raw_task_list must be an array");
    }

    if (!current_date) {
        current_date = new Date();
    }

    return raw_task_list.map(raw => {
        if (typeof raw !== 'string' || !raw.trim()) {
            return null;
        }

        try {
            const deadline = extract_deadline(raw, current_date);
            const difficulty = extract_difficulty(raw);
            const importance = calculate_importance(deadline, difficulty, current_date);
            
            return {
                title: extract_task_name(raw),
                difficulty: difficulty,
                time: extract_duration(raw),
                dueDate: format(deadline, 'yyyy-MM-dd'),
                status: 'todo',
                priority: difficulty === 'hard' ? 'high' : 
                         difficulty === 'medium' ? 'medium' : 'low',
                progress: 0,
                importance: importance
            };
        } catch (error) {
            console.error('Error parsing task:', error);
            return null;
        }
    }).filter(task => task !== null);
} 