from django.shortcuts import render, redirect
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
import json
from .models import Task

def startup_view(request):
    return render(request, 'planner/startup.html')


def register_view(request):
    if request.method == 'POST':
        username   = request.POST.get('username')
        password   = request.POST.get('password')
        email      = request.POST.get('email')
        first_name = request.POST.get('first_name')
        last_name  = request.POST.get('last_name')

        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already taken.')
            return redirect('login')

        user = User.objects.create_user(
            username=username, password=password,
            email=email, first_name=first_name, last_name=last_name
        )
        login(request, user)
        return redirect('calendar')

    return redirect('login')


def logout_view(request):
    logout(request)
    return redirect('login')


@login_required
def calendar_view(request):
    tasks = Task.objects.filter(user=request.user)

    tasks_json = []
    for task in tasks:
        tasks_json.append({
            'title': task.title,
            'description': task.description,
            'deadline': task.deadline.strftime('%Y-%m-%d'),
            'priority': task.priority,
            'difficulty': task.difficulty,
        })

    return render(request, 'planner/calendar.html', {
        'tasks': tasks,
        'tasks_json': json.dumps(tasks_json)
    })


@login_required
def create_task_api(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        task = Task(
            user        = request.user,
            title       = data.get('title'),
            description = data.get('description', ''),
            deadline    = data.get('deadline'),
            priority    = data.get('priority', 'low'),
            difficulty  = data.get('difficulty', 'easy'),
        )
        task.save()
        return JsonResponse({'status': 'ok', 'id': task.id})
    return JsonResponse({'error': 'Method not allowed'}, status=405)