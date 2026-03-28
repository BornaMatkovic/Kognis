import json
from typing import Any

from django.contrib.auth.hashers import make_password, check_password
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


def serialize_user_row(row: tuple) -> dict[str, Any]:
    """Convert database row to user dict."""
    id_, username, email, password, timer_minutes, timer_interrupts, score = row
    return {
        "id": id_,
        "username": username,
        "email": email,
        "timer_minutes": timer_minutes,
        "timer_interrupts": timer_interrupts,
        "score": score,
    }


@csrf_exempt
@require_http_methods(["GET", "PUT"])
def user_detail(request: Any, user_id: int) -> JsonResponse:
    """GET vraca korisnika po ID-u, PUT azurira postojeceg korisnika."""
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT id, username, email, password, timer_minutes, timer_interrupts, score FROM user WHERE id = %s",
            [user_id],
        )
        row = cursor.fetchone()

        if not row:
            return JsonResponse({"detail": "User not found."}, status=404)

        if request.method == "PUT":
            try:
                payload: dict[str, Any] = json.loads(request.body or "{}")
            except json.JSONDecodeError:
                return JsonResponse({"detail": "Invalid JSON payload."}, status=400)

            id_, old_username, old_email, old_password, old_timer_minutes, old_timer_interrupts, old_score = row
            username = payload.get("username", old_username)
            email = payload.get("email", old_email)
            raw_password = payload.get("password", old_password)
            password = make_password(raw_password)
            timer_minutes = payload.get("timer_minutes", old_timer_minutes)
            timer_interrupts = payload.get("timer_interrupts", old_timer_interrupts)
            score = payload.get("score", old_score)
            cursor.execute(
                "UPDATE user SET username = %s, email = %s, password = %s, timer_minutes = %s, timer_interrupts = %s, score = %s WHERE id = %s",
                [username, email, password, timer_minutes, timer_interrupts, score, user_id],
            )
            row = (user_id, username, email, password, timer_minutes, timer_interrupts, score)

    return JsonResponse(serialize_user_row(row))


@csrf_exempt
@require_http_methods(["POST"])
def user_create(request: Any) -> JsonResponse:
    """Create new user without specifying ID."""
    try:
        payload: dict[str, Any] = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON payload."}, status=400)

    username = payload.get("username")
    if not username:
        return JsonResponse({"detail": "Username is required."}, status=400)

    email = payload.get("email", "")
    raw_password = payload.get("password", "")
    password = make_password(raw_password)
    timer_minutes = payload.get("timer_minutes", 0)
    timer_interrupts = payload.get("timer_interrupts", 0)
    score = payload.get("score", 0)

    with connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO user (username, email, password, timer_minutes, timer_interrupts, score) VALUES (%s, %s, %s, %s, %s, %s)",
            [username, email, password, timer_minutes, timer_interrupts, score],
        )
        user_id = cursor.lastrowid
        row = (user_id, username, email, password, timer_minutes, timer_interrupts, score)

    return JsonResponse(serialize_user_row(row), status=201)


from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.contrib.auth.hashers import check_password
from django.db import connection
import json
from typing import Any

@csrf_exempt
@require_http_methods(["POST"])
def login(request: Any) -> JsonResponse:
    try:
        payload: dict[str, Any] = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON payload."}, status=400)

    identifier = payload.get("username") or payload.get("email")
    if not identifier:
        return JsonResponse({"detail": "Username or email is required."}, status=400)

    password = payload.get("password", "")
    if not password:
        return JsonResponse({"detail": "Password is required."}, status=400)

    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT id, username, email, password, timer_minutes, timer_interrupts, score FROM user WHERE username=%s OR email=%s",
            [identifier, identifier]
        )
        row = cursor.fetchone()

    if not row:
        return JsonResponse({"detail": "User not found."}, status=404)

    user_id, username, email, hashed_password, timer_minutes, timer_interrupts, score = row

    if not check_password(password, hashed_password):
        return JsonResponse({"detail": "Invalid password."}, status=401)

    request.session["user_id"] = user_id #za identifikaciju
    request.session.modified = True  # Obavezno spremi session

    return JsonResponse({"id": user_id, "username": username, "email": email, "timer_minutes": timer_minutes, "timer_interrupts": timer_interrupts, "score": score}, status=200)

@csrf_exempt
@require_http_methods(["GET"])
def get_me(request: Any) -> JsonResponse:
    user_id = request.session.get("user_id")

    if not user_id:
        return JsonResponse({"authenticated": False}, status=200)

    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT id, username, email, password, timer_minutes, timer_interrupts, score FROM user WHERE id = %s",
            [user_id],
        )
        row = cursor.fetchone()

        if not row:
            request.session.pop("user_id", None)
            return JsonResponse({"authenticated": False}, status=200)

    user_data = serialize_user_row(row)
    return JsonResponse({"authenticated": True, **user_data}, status=200)