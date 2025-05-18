import re
from datetime import datetime, timedelta
import dateparser

# Extract deadline from text or estimate it based on difficulty
def extract_deadline(text, current_date):
    deadline_patterns = [
        r"due\s+(?:on\s+)?(?:\w+(?:\s+\d{1,2}(?:st|nd|rd|th)?)?|\d{1,2}(?:st|nd|rd|th)?\s+\w+)",
        r"by\s+(?:\w+(?:\s+\d{1,2}(?:st|nd|rd|th)?)?|\d{1,2}(?:st|nd|rd|th)?\s+\w+)",
        r"in\s+(\d+)\s+(?:day|days|week|weeks|month|months)",
        r"\b(?:tomorrow|tmr|tmrw)\b",
        r"\bnext\s+(?:week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b",
        r"\bthis\s+(?:week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b",
        r"\bon\s+(?:\w+(?:\s+\d{1,2}(?:st|nd|rd|th)?)?|\d{1,2}(?:st|nd|rd|th)?\s+\w+)",
        r"\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?\w+",
        r"\w+\s+\d{1,2}(?:st|nd|rd|th)?",
    ]

    # Try to parse an explicit deadline
    for pattern in deadline_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            # Handle special case for "in X days/weeks/months"
            if "in" in match.group(0).lower():
                number = int(re.search(r"\d+", match.group(0)).group(0))
                unit = re.search(r"day|week|month", match.group(0), re.IGNORECASE).group(0).lower()
                if unit == "day":
                    return (current_date + timedelta(days=number)).date()
                elif unit == "week":
                    return (current_date + timedelta(weeks=number)).date()
                elif unit == "month":
                    # Approximate month as 30 days
                    return (current_date + timedelta(days=number * 30)).date()
            
            parsed = dateparser.parse(match.group(0), settings={
                "RELATIVE_BASE": current_date,
                "PREFER_DATES_FROM": "future"
            })
            if parsed:
                # If the parsed date is in the past, try to move it to the future
                if parsed.date() < current_date.date():
                    if "next" in match.group(0).lower():
                        parsed = parsed + timedelta(days=7)
                    else:
                        # Try adding a year if the date is in the past
                        parsed = parsed.replace(year=parsed.year + 1)
                return parsed.date()

    # If no deadline found — estimate based on difficulty
    difficulty = extract_difficulty(text)
    if difficulty == "easy":
        return (current_date + timedelta(days=1)).date()
    elif difficulty == "medium":
        return (current_date + timedelta(days=2)).date()
    elif difficulty == "hard":
        return (current_date + timedelta(days=3)).date()

    # Fallback
    return (current_date + timedelta(days=2)).date()

# Extract duration in hours
def extract_duration(text):
    match = re.search(r"(~|about|approximately|for)? ?(\d+(\.\d+)?) ?(hours|hrs|h)", text, re.IGNORECASE)
    if match:
        return float(match.group(2))
    return 1.0  # default duration if not found

# Extract difficulty level
def extract_difficulty(text):
    for level in ["easy", "medium", "hard"]:
        if re.search(rf"\b{level}\b", text, re.IGNORECASE):
            return level
    return "medium"  # default difficulty

# Extract cleaned-up task name
def extract_task_name(text):
    clean = text.strip()

    # Record exact phrases to remove
    matches_to_remove = []

    # Duration patterns (e.g., for 3 hours, ~2.5 hrs, takes 2h)
    duration_patterns = [
        r"(~|about|approximately|for|takes?)? ?\d+(\.\d+)? ?(hours|hrs|h|hour)",
        r"should take \d+(\.\d+)? ?(hours|hrs|h|hour)"
    ]
    for pattern in duration_patterns:
        match = re.search(pattern, clean, re.IGNORECASE)
        if match:
            matches_to_remove.append(match.group(0))

    # Difficulty with context (e.g., "it's easy", "difficulty: medium")
    difficulty_patterns = [
        r"(?:it'?s|this is|difficulty:?\s+)?\b(easy|medium|hard)\b(?:\s+difficulty)?",
        r"\b(easy|medium|hard)\b\s+task"
    ]
    for pattern in difficulty_patterns:
        match = re.search(pattern, clean, re.IGNORECASE)
        if match:
            matches_to_remove.append(match.group(0))

    # Deadline phrases
    deadline_patterns = [
        r"due\s+(?:on\s+)?(?:\w+(?:\s+\d{1,2}(?:st|nd|rd|th)?)?|\d{1,2}(?:st|nd|rd|th)?\s+\w+)",
        r"by\s+(?:\w+(?:\s+\d{1,2}(?:st|nd|rd|th)?)?|\d{1,2}(?:st|nd|rd|th)?\s+\w+)",
        r"in\s+\d+\s+(?:day|days|week|weeks|month|months)",
        r"\b(?:tomorrow|tmr|tmrw)\b",
        r"\bnext\s+(?:week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b",
        r"\bthis\s+(?:week|month)\b",
        r"\bon\s+(?:\w+(?:\s+\d{1,2}(?:st|nd|rd|th)?)?|\d{1,2}(?:st|nd|rd|th)?\s+\w+)",
        r"\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?\w+"
    ]
    for pattern in deadline_patterns:
        match = re.search(pattern, clean, re.IGNORECASE)
        if match and not re.search(r"\bon\s+(?:math|reading|homework|project|exam)", match.group(0), re.IGNORECASE):
            matches_to_remove.append(match.group(0))

    filler_phrases = [
        r"(?:and|&)\s+it'?s",
        r"(?:and|&)\s+(?:about|approximately)",
        r"of\s+work",
        r"(?:just|maybe)\s+",
        r"(?:will|would)\s+(?:take|need)",
        r"(?:i|we)\s+(?:need|have|want)\s+to",
        r"(?:i|we)\s+should",
        r"please"
    ]
    for pattern in filler_phrases:
        matches = re.finditer(pattern, clean, re.IGNORECASE)
        for match in matches:
            matches_to_remove.append(match.group(0))

    # Remove matched phrases from the original sentence
    for phrase in matches_to_remove:
        clean = re.sub(re.escape(phrase), "", clean, flags=re.IGNORECASE)

    # Clean up remaining artifacts
    clean = re.sub(r"\s{2,}", " ", clean)  # Multiple spaces
    clean = re.sub(r"[,\.]+(?:\s+[,\.]+)*", "", clean)  # Multiple punctuation
    clean = re.sub(r"^\W+|\W+$", "", clean)  # Leading/trailing punctuation
    clean = clean.strip()

    # Capitalize first letter of each word, but handle special cases
    words = clean.split()
    if words:
        # Capitalize first word always
        words[0] = words[0].capitalize()
        # For remaining words, capitalize unless they're common lowercase words
        lowercase_words = {'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with'}
        for i in range(1, len(words)):
            if words[i].lower() not in lowercase_words:
                words[i] = words[i].capitalize()
        clean = " ".join(words)

    return clean


def process_tasks(raw_task_list, current_date=None):
    if not raw_task_list:
        return []
        
    if not isinstance(raw_task_list, list):
        raise ValueError("raw_task_list must be a list")

    current_date = current_date or datetime.now()
    if not isinstance(current_date, datetime):
        try:
            current_date = datetime.fromisoformat(str(current_date))
        except (ValueError, TypeError):
            raise ValueError("current_date must be a datetime object or a valid date string")

    parsed_tasks = []

    for raw in raw_task_list:
        if not isinstance(raw, str) or not raw.strip():
            continue
            
        try:
            deadline = extract_deadline(raw, current_date)
            task = {
                "name": extract_task_name(raw),
                "difficulty": extract_difficulty(raw),
                "time": extract_duration(raw),
                "deadline": deadline.strftime("%Y-%m-%d") if deadline else None
            }
            parsed_tasks.append(task)
        except Exception as e:
            print(f"Warning: Failed to parse task '{raw}': {str(e)}")
            continue

    return parsed_tasks
