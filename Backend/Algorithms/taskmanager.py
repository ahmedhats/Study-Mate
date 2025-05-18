from datetime import datetime, timedelta
import json
import sys

# Convert priority to numeric score
def get_priority_score(priority):
    return {
        "urgent": 4,
        "high": 3,
        "medium": 2,
        "low": 1
    }.get(priority.lower(), 2)

# Convert importance to numeric score
def get_importance_score(importance):
    return {
        "critical": 4,
        "important": 3,
        "normal": 2,
        "optional": 1
    }.get(importance.lower(), 2)

def get_days_until_deadline(task_date, current_date):
    deadline = datetime.strptime(task_date, "%Y-%m-%d")
    return (deadline - current_date).days

# Calculate task urgency score
def calculate_urgency(task, current_date):
    priority_score = get_priority_score(task["priority"])
    importance_score = get_importance_score(task["importance"])
    
    # Calculate days until deadline
    days_until_due = get_days_until_deadline(task["deadline"], current_date)
    
    # Urgency increases as deadline approaches
    deadline_score = max(1, 10 - days_until_due) if days_until_due >= 0 else 10
    
    # Final score combines priority, importance and deadline proximity
    return (priority_score * importance_score * deadline_score)

def assign_time_slots(tasks, max_hours_per_day):
    """Assign specific time slots to tasks within a day"""
    START_HOUR = 9  # Start at 9 AM
    current_hour = START_HOUR
    scheduled_tasks = []

    for task in tasks:
        task_hours = task["time"]
        start_time = current_hour
        end_time = current_hour + task_hours

        # Add time slot information to task
        task_with_time = task.copy()
        task_with_time["start_time"] = f"{int(start_time):02d}:{int((start_time % 1) * 60):02d}"
        task_with_time["end_time"] = f"{int(end_time):02d}:{int((end_time % 1) * 60):02d}"
        
        scheduled_tasks.append(task_with_time)
        current_hour = end_time

    return scheduled_tasks

# Main AI Scheduler
def ai_schedule_tasks(tasks, start_date=None, max_hours_per_day=5):
    start_date = start_date or datetime.today()
    current_date = start_date
    schedule = {}
    unscheduled_tasks = []

    # Sort tasks by urgency score
    tasks_with_scores = [
        (task, calculate_urgency(task, current_date))
        for task in tasks
    ]
    sorted_tasks = [
        task for task, _ in sorted(tasks_with_scores, 
        key=lambda x: x[1], reverse=True)
    ]

    # Schedule tasks
    for task in sorted_tasks:
        task_time_remaining = task["time"]
        days_until_deadline = get_days_until_deadline(task["deadline"], current_date)
        
        # If task exceeds daily limit and not within 3 days of deadline
        if task_time_remaining > max_hours_per_day and days_until_deadline > 3:
            unscheduled_tasks.append({
                **task,
                "days_until_deadline": days_until_deadline,
                "exceeds_time_limit": True
            })
            continue

        deadline = datetime.strptime(task["deadline"], "%Y-%m-%d")
        current_date = start_date  # Reset to start date for each task

        # Calculate days available until deadline
        days_until_deadline = (deadline - current_date).days + 1
        if days_until_deadline <= 0:
            days_until_deadline = 1  # If task is overdue, schedule for today

        # Try to distribute task time evenly across available days
        daily_allocation = min(
            task_time_remaining / days_until_deadline,
            max_hours_per_day
        )

        task_scheduled = False
        temp_schedule = {}

        while task_time_remaining > 0 and current_date <= deadline:
            day_str = current_date.strftime("%Y-%m-%d")
            
            if day_str not in temp_schedule:
                temp_schedule[day_str] = []

            # Calculate remaining hours for this day
            day_total = sum(t["time"] for t in (schedule.get(day_str, []) + temp_schedule[day_str]))
            hours_available = max_hours_per_day - day_total

            if hours_available > 0:
                # Allocate time for this task today
                allocated_time = min(
                    daily_allocation,
                    hours_available,
                    task_time_remaining
                )
                
                if allocated_time >= 0.5:  # Only schedule if at least 30 minutes
                    temp_schedule[day_str].append({
                        "name": task["name"],
                        "time": allocated_time,
                        "_id": task.get("_id"),
                        "priority": task["priority"],
                        "importance": task["importance"],
                        "deadline": task["deadline"],
                        "days_until_deadline": get_days_until_deadline(task["deadline"], current_date)
                    })
                    task_time_remaining -= allocated_time
                    task_scheduled = True

            current_date += timedelta(days=1)

        # If task couldn't be fully scheduled, add to unscheduled tasks
        if task_time_remaining > 0:
            unscheduled_tasks.append({
                **task,
                "days_until_deadline": get_days_until_deadline(task["deadline"], start_date),
                "partially_scheduled": task_scheduled,
                "remaining_time": task_time_remaining
            })
        else:
            # Add successfully scheduled task parts to main schedule
            for day, tasks in temp_schedule.items():
                if day not in schedule:
                    schedule[day] = []
                schedule[day].extend(tasks)

    # Sort and assign time slots for each day's tasks
    for day in schedule:
        # First sort by priority and importance
        schedule[day].sort(
            key=lambda x: (
                get_priority_score(x["priority"]) * get_importance_score(x["importance"]),
                x["time"]
            ),
            reverse=True
        )
        # Then assign time slots
        schedule[day] = assign_time_slots(schedule[day], max_hours_per_day)

    return {
        "schedule": schedule,
        "unscheduled_tasks": unscheduled_tasks
    }

if __name__ == "__main__":
    try:
        # Read input from command line argument
        input_data = json.loads(sys.argv[1])
        tasks = input_data["tasks"]
        max_hours_per_day = input_data.get("maxHoursPerDay", 5)

        # Run scheduler
        result = ai_schedule_tasks(
            tasks,
            start_date=datetime.today(),
            max_hours_per_day=max_hours_per_day
        )

        # Output result as JSON
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)