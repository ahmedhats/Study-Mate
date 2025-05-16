import sys, json
from user_matcher import UserMatcher

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    target_user = input_data["target_user"]
    user_list = input_data["user_list"]

    matcher = UserMatcher()
    matches = matcher.match_user(user_list, target_user, top_n=3)

    output = [
        { "name": m[0]["name"], "score": round(m[1]*100, 2) }
        for m in matches
    ]
    print(json.dumps(output))
