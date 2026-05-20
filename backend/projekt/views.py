import json

from django.contrib.auth.hashers import make_password, check_password
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


def serialize_user_row(row):
    id_, username, email, password, timer_minutes, timer_interrupts, score, quiz_correct, quiz_wrong = row
    return {
        "id": id_,
        "username": username,
        "email": email,
        "timer_minutes": timer_minutes,
        "timer_interrupts": timer_interrupts,
        "score": score,
        "quiz_correct": quiz_correct,
        "quiz_wrong": quiz_wrong,
    }


@csrf_exempt
@require_http_methods(["GET", "PUT"])
def user_detail(request, user_id):
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT id, username, email, password, timer_minutes, timer_interrupts, score, quiz_correct, quiz_wrong FROM user WHERE id = %s",
            [user_id],
        )
        row = cursor.fetchone()

        if not row:
            return JsonResponse({"detail": "User not found."}, status=404)

        if request.method == "PUT":
            try:
                payload = json.loads(request.body or "{}")
            except json.JSONDecodeError:
                return JsonResponse({"detail": "Invalid JSON payload."}, status=400)

            id_, old_username, old_email, old_password, old_timer_minutes, old_timer_interrupts, old_score, old_quiz_correct, old_quiz_wrong = row
            username = payload.get("username", old_username)
            email = payload.get("email", old_email)
            password = make_password(payload["password"]) if "password" in payload else old_password
            timer_minutes = payload.get("timer_minutes", old_timer_minutes)
            timer_interrupts = payload.get("timer_interrupts", old_timer_interrupts)
            score = payload.get("score", old_score)
            quiz_correct = payload.get("quiz_correct", old_quiz_correct)
            quiz_wrong = payload.get("quiz_wrong", old_quiz_wrong)
            cursor.execute(
                "UPDATE user SET username = %s, email = %s, password = %s, timer_minutes = %s, timer_interrupts = %s, score = %s, quiz_correct = %s, quiz_wrong = %s WHERE id = %s",
                [username, email, password, timer_minutes, timer_interrupts, score, quiz_correct, quiz_wrong, user_id],
            )
            row = (user_id, username, email, password, timer_minutes, timer_interrupts, score, quiz_correct, quiz_wrong)

    return JsonResponse(serialize_user_row(row))


@csrf_exempt
@require_http_methods(["POST"])
def user_create(request):
    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON payload."}, status=400)

    username = payload.get("username")
    if not username:
        return JsonResponse({"detail": "Username is required."}, status=400)

    email = payload.get("email", "")
    password = make_password(payload.get("password", ""))
    timer_minutes = payload.get("timer_minutes", 0)
    timer_interrupts = payload.get("timer_interrupts", 0)
    score = payload.get("score", 0)

    with connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO user (username, email, password, timer_minutes, timer_interrupts, score, quiz_correct, quiz_wrong) VALUES (%s, %s, %s, %s, %s, %s, 0, 0)",
            [username, email, password, timer_minutes, timer_interrupts, score],
        )
        user_id = cursor.lastrowid
        row = (user_id, username, email, password, timer_minutes, timer_interrupts, score, 0, 0)

    return JsonResponse(serialize_user_row(row), status=201)


@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON payload."}, status=400)

    identifier = payload.get("username") or payload.get("email")
    if not identifier:
        return JsonResponse({"detail": "Username or email is required."}, status=400)

    password = payload.get("password")
    if not password:
        return JsonResponse({"detail": "Password is required."}, status=400)

    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT id, username, email, password, timer_minutes, timer_interrupts, score, quiz_correct, quiz_wrong FROM user WHERE username=%s OR email=%s",
            [identifier, identifier]
        )
        row = cursor.fetchone()

    if not row:
        return JsonResponse({"detail": "User not found."}, status=404)

    user_id, username, email, hashed_password, timer_minutes, timer_interrupts, score, quiz_correct, quiz_wrong = row

    if not check_password(password, hashed_password):
        return JsonResponse({"detail": "Invalid password."}, status=401)

    request.session["user_id"] = user_id
    request.session.modified = True

    return JsonResponse({"id": user_id, "username": username, "email": email, "timer_minutes": timer_minutes, "timer_interrupts": timer_interrupts, "score": score, "quiz_correct": quiz_correct, "quiz_wrong": quiz_wrong}, status=200)


@csrf_exempt
@require_http_methods(["GET"])
def get_me(request):
    user_id = request.session.get("user_id")

    if not user_id:
        return JsonResponse({"authenticated": False}, status=200)

    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT id, username, email, password, timer_minutes, timer_interrupts, score, quiz_correct, quiz_wrong FROM user WHERE id = %s",
            [user_id],
        )
        row = cursor.fetchone()

        if not row:
            request.session.pop("user_id", None)
            return JsonResponse({"authenticated": False}, status=200)

    user_data = serialize_user_row(row)
    return JsonResponse({"authenticated": True, **user_data}, status=200)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def quiz_list_create(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"detail": "Not authenticated."}, status=401)

    if request.method == "POST":
        try:
            payload = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"detail": "Invalid JSON payload."}, status=400)

        title = payload.get("title", "").strip()
        text = payload.get("text", "").strip()
        if not (title and text):
            return JsonResponse({"detail": "Title and text are required."}, status=400)

        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO quiz (user_id, title, text) VALUES (%s, %s, %s)",
                [user_id, title, text],
            )
            quiz_id = cursor.lastrowid
            cursor.execute(
                "SELECT id, user_id, title, text, created_at FROM quiz WHERE id = %s",
                [quiz_id],
            )
            row = cursor.fetchone()

        return JsonResponse({
            "id": row[0], "user_id": row[1], "title": row[2],
            "text": row[3], "created_at": row[4]
        }, status=201)

    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT id, user_id, title, text, created_at FROM quiz WHERE user_id = %s ORDER BY created_at DESC",
            [user_id],
        )
        rows = cursor.fetchall()

    quizzes = [
        {"id": r[0], "user_id": r[1], "title": r[2], "text": r[3], "created_at": r[4]}
        for r in rows
    ]
    return JsonResponse(quizzes, safe=False, status=200)


@csrf_exempt
@require_http_methods(["POST"])
def quiz_stats(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"detail": "Not authenticated."}, status=401)

    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON payload."}, status=400)

    correct = int(payload.get("correct") or 0)
    wrong = int(payload.get("wrong") or 0)

    with connection.cursor() as cursor:
        cursor.execute(
            "UPDATE user SET quiz_correct = quiz_correct + %s, quiz_wrong = quiz_wrong + %s, score = MAX(0, score + %s) WHERE id = %s",
            [correct, wrong, correct - wrong, user_id],
        )
        cursor.execute(
            "SELECT quiz_correct, quiz_wrong, score FROM user WHERE id = %s",
            [user_id],
        )
        row = cursor.fetchone()

    return JsonResponse({"quiz_correct": row[0], "quiz_wrong": row[1], "score": row[2]}, status=200)
