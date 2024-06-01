from django.urls import path
from .views import index

urlpatterns = [
    path('', index),
    path('integration/<str:id>', index),
    path('integrations', index),
    path('update-integ/<str:id>', index),
    path('add', index),
    path('add/http', index),
    path('add/mqtt', index)
]
