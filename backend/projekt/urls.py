"""
URL configuration for projekt project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path

from .views import login, user_detail, user_create, get_me, quiz_list_create, quiz_stats

urlpatterns = [
    path('api/users/', user_create, name='user-create'),
    path('api/users/<int:user_id>/', user_detail, name='user-detail'),
    path('api/login/', login, name='login'),
    path('api/me/', get_me, name='me'),
    path('api/quiz/', quiz_list_create, name='quiz-list-create'),
    path('api/quiz-stats/', quiz_stats, name='quiz-stats'),
]
