import json
import sys
from collections import Counter

def calculate_similarity(user1, user2):
    """Calculate similarity score between two users based on their attributes."""
    score = 0
    
    # Major match (30%)
    if user1.get('major') == user2.get('major'):
        score += 30
    
    # Education level match (20%)
    if user1.get('education') == user2.get('education'):
        score += 20
    
    # Study preference match (10%)
    if user1.get('studyPreference') == user2.get('studyPreference'):
        score += 10
    
    # Interests overlap (25%)
    interests1 = set(user1.get('interests', []))
    interests2 = set(user2.get('interests', []))
    if interests1 and interests2:
        overlap = len(interests1.intersection(interests2))
        total = len(interests1.union(interests2))
        score += (overlap / total) * 25 if total > 0 else 0
    
    # Hobbies overlap (15%)
    hobbies1 = set(user1.get('hobbies', []))
    hobbies2 = set(user2.get('hobbies', []))
    if hobbies1 and hobbies2:
        overlap = len(hobbies1.intersection(hobbies2))
        total = len(hobbies1.union(hobbies2))
        score += (overlap / total) * 15 if total > 0 else 0
    
    return score

def match_users(user_list, target_user, top_n=3):
    """Find the best matches for a target user from a list of users."""
    matches = []
    
    for user in user_list:
        if user['_id'] != target_user['_id']:
            similarity = calculate_similarity(target_user, user)
            matches.append({
                'user': user,
                'matchPercentage': similarity
            })
    
    # Sort by match percentage in descending order
    matches.sort(key=lambda x: x['matchPercentage'], reverse=True)
    
    return matches[:top_n]

if __name__ == "__main__":
    # Read input from command line argument
    input_data = json.loads(sys.argv[1])
    
    results = match_users(
        input_data['user_list'],
        input_data['target_user'],
        input_data.get('top_n', 3)
    )
    
    # Convert results to JSON and print
    print(json.dumps({
        'matches': [{
            'user': {
                '_id': match['user']['_id'],
                'name': match['user']['name'],
                'email': match['user']['email'],
                'major': match['user']['major'],
                'interests': match['user']['interests'],
                'hobbies': match['user']['hobbies'],
                'education': match['user']['education'],
                'studyPreference': match['user']['studyPreference']
            },
            'matchPercentage': match['matchPercentage']
        } for match in results]
    }))
