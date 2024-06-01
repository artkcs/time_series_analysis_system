from django.urls import path
from .views import main, GetIntegration, AddIntegration, Integrations, GetIntegrationData, GetIntegrationInitialData, GetIntegrationFields, UpdateIntegrationDataFromInteg, DeleteIntegration
urlpatterns = [
    path('', main),
    path('add-integration', AddIntegration.as_view()),
    path('get-integration', GetIntegration.as_view()),
    path('get-integration-data', GetIntegrationData.as_view()),
    path('get-integ-initial-data', GetIntegrationInitialData.as_view()),
    path('upd-integ-data-from-integ', UpdateIntegrationDataFromInteg.as_view()),
    path('get-integ-fields', GetIntegrationFields.as_view()),
    path('delete-integ/<int:id>', DeleteIntegration.as_view()),
    path('integrations', Integrations.as_view())
]
