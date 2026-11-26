from django.urls import path
from django.contrib.auth.views import LoginView
from . import views

urlpatterns = [
    path('', views.startup_view, name='startup'),
    path('login/', LoginView.as_view(
        template_name='registration/login.html',
        next_page='calendar'
    ), name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('calendar/', views.calendar_view, name='calendar'),
    path('task/create/', views.create_task_api, name='create_task_api'),
]